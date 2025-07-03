import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getMessageStore } from "./messageStore";
import { MCPClient } from "./mcp";
import { makeC1Response } from "@thesysai/genui-sdk/server";
import { JSONSchema } from "openai/lib/jsonschema.mjs";
import { transformStream } from "@crayonai/stream";
import { cookies } from 'next/headers';
import type { ChatCompletionMessageParam } from "openai/resources.mjs";

// Initialize MCP client
const mcpClient = new MCPClient();

/**
 * Initialize MCP client connection if not already connected
 */
async function ensureMCPConnection(): Promise<void> {
  if (mcpClient.tools.length === 0) {
    await mcpClient.connect();
  }
}


export async function POST(req: NextRequest) {
  const { prompt, threadId, responseId } = (await req.json()) as {
    prompt: ChatCompletionMessageParam & { id: string };
    threadId: string;
    responseId: string;
  };

  console.log('Chat API called with:', { threadId, promptRole: prompt.role, responseId });
  console.log('THESYS_API_KEY present:', !!process.env.THESYS_API_KEY);

  // Try to extract auth token from multiple sources
  let authToken = '';
  
  // 1. Try from Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    authToken = authHeader.replace('Bearer ', '');
    console.log('Auth token from header:', authToken ? 'Present' : 'Missing');
  }
  
  // 2. Try from cookies as fallback
  if (!authToken) {
    try {
      const cookieStore = await cookies();
      authToken = cookieStore.get('authToken')?.value || '';
      console.log('Auth token from cookies:', authToken ? 'Present' : 'Missing');
    } catch (error) {
      console.log('Could not read cookies:', error);
    }
  }
  
  // 3. Try from request body as last resort (if SDK passes it)
  if (!authToken && 'authToken' in req) {
    authToken = (req as { authToken?: string }).authToken || '';
    console.log('Auth token from request body:', authToken ? 'Present' : 'Missing');
  }

  const client = new OpenAI({
    baseURL: "https://api.thesys.dev/v1/embed",
    apiKey: process.env.THESYS_API_KEY,
  });

  const messageStore = getMessageStore(threadId, authToken);
  
  try {
    await messageStore.addMessage(prompt);
  } catch (error) {
    console.error('Error adding prompt message:', error);
    // Continue anyway - we'll try to get existing messages
  }
// Ensure MCP connection is established
await ensureMCPConnection();

// Get existing messages for context
const messages = await messageStore.getOpenAICompatibleMessageList();
console.log('Retrieved existing messages:', messages.length);

const c1Response = makeC1Response();
c1Response.writeThinkItem({
  title: "Processing your request...",
  description: "Analyzing your message and determining the best approach.",
});

const llmStream = await client.beta.chat.completions.runTools({
  model: "c1-nightly",
  messages: messages,
  tools: mcpClient.tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.function.name,
      description: tool.function.description!,
      parameters: tool.function.parameters as unknown as JSONSchema,
      parse: JSON.parse,
      function: async (args: unknown) => {
        c1Response.writeThinkItem({
          title: `Using tool ${tool.function.name}`,
          description:
            "Executing external tools to gather the information you need.",
        });
        const results = await mcpClient.runTool({
          tool_call_id: tool.function.name + Date.now().toString(),
          name: tool.function.name,
          args: args as Record<string, unknown>,
        });
        return results.content;
      },
    },
  })),
  stream: true,
});

const responseStream = transformStream(
  llmStream,
  (chunk) => {
    return chunk.choices[0].delta.content;
  },
  {
    onTransformedChunk: (chunk) => {
      if (chunk) {
        c1Response.writeContent(chunk);
      }
    },
    onError: (error) => {
      console.error("Error in chat route:", error);
      c1Response.writeContent(
        "Sorry, I encountered an error processing your request."
      );
    },
    onEnd: ({ accumulated }) => {
      const message = accumulated.filter((message) => message).join("");
      messageStore.addMessage({
        role: "assistant",
        content: message,
        id: responseId,
      });
      c1Response.end();
    },
  }
) as ReadableStream<string>;

  return new NextResponse(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
