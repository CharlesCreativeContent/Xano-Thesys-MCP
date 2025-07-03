import { Thread } from "@crayonai/react-core";
import type { ChatCompletionMessageParam } from "openai/resources.mjs";
import { getToken } from "@/lib/auth";

const API_BASE_URL = "https://x6if-wu0q-dtak.n7.xano.io/api:6CaHLfWk";

export type Message = ChatCompletionMessageParam & {
  id: string;
};

interface ThreadResponse {
  id: string;
  name: string;
  created_at: number;
  messages?: { [key: string]: Message };
}

// Helper function to get auth token using the auth lib
const getAuthToken = (): string => {
  const token = getToken();
  console.log('Getting auth token:', token ? 'Token found' : 'No token found');
  return token || '';
};

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}, authToken?: string) => {
  // Use provided token or try to get it from localStorage (client-side only)
  const token = authToken || (typeof window !== 'undefined' ? getAuthToken() : '');
  console.log('Making API call to:', `${API_BASE_URL}${endpoint}`, 'with token:', token ? 'Present' : 'Missing');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };
  
  // Only add Authorization header if we have a token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    console.error('API call failed:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
};

// Function 1: Create Thread
export const createThread = async (name: string, authToken?: string): Promise<Thread> => {
  const newThread = await apiCall('/thread', {
    method: 'POST',
    body: JSON.stringify({
      name: name,
      messages: {},
    }),
  }, authToken);

  return {
    threadId: newThread.id,
    title: newThread.name,
    createdAt: new Date(newThread.created_at * 1000), // Convert timestamp to Date
  };
};

export const getThreadList = async (authToken?: string): Promise<Thread[]> => {
  const threads = await apiCall('/thread', {}, authToken);
  
  return threads.map((thread: ThreadResponse) => ({
    threadId: thread.id,
    title: thread.name,
    createdAt: new Date(thread.created_at * 1000), // Convert timestamp to Date
  }));
};

export const addMessages = async (threadId: string, ...messages: Message[]) => {
  return addMessagesWithAuth(threadId, undefined, ...messages);
};

export const addMessagesWithAuth = async (threadId: string, authToken?: string, ...messages: Message[]) => {
  try {
    // First get the current thread to retrieve existing messages
    const currentThread = await apiCall(`/thread/${threadId}`, {}, authToken);
    
    // Get existing messages as an array to maintain order
    const existingMessages = currentThread.messages || {};
    const existingArray: Message[] = Object.values(existingMessages);
    
    // Add new messages to the array
    const allMessages = [...existingArray, ...messages];
    
    // Convert back to object format with sequential keys
    const messagesObject: { [key: string]: Message } = {};
    allMessages.forEach((message, index) => {
      messagesObject[`msg_${index.toString().padStart(4, '0')}`] = message;
    });

    await apiCall(`/thread/${threadId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        messages: messagesObject,
      }),
    }, authToken);
  } catch (error) {
    console.error('Error adding messages to thread:', error);
    throw error;
  }
};

export const getUIThreadMessages = async (
  threadId: string,
  authToken?: string
): Promise<Message[]> => {
  const thread = await apiCall(`/thread/${threadId}`, {}, authToken);
  
  const messages = thread.messages || {};
  
  // Sort messages by key to maintain order
  const sortedKeys = Object.keys(messages).sort();
  const messageArray: Message[] = sortedKeys.map(key => messages[key]);

  const uiMessages = messageArray.filter(
    (msg) =>
      !(
        msg.role === "tool" || // Exclude 'tool' role messages
        (msg.role === "assistant" && // Exclude 'assistant' role messages *if* they have tool_calls
          msg.tool_calls)
      )
  );

  return uiMessages;
};

export const getLLMThreadMessages = async (
  threadId: string,
  authToken?: string
): Promise<ChatCompletionMessageParam[]> => {
  const thread = await apiCall(`/thread/${threadId}`, {}, authToken);
  
  const messages = thread.messages || {};
  
  // Sort messages by key to maintain order
  const sortedKeys = Object.keys(messages).sort();
  const messageArray: Message[] = sortedKeys.map(key => messages[key]);

  const llmMessages = messageArray.map((msg) => {
    const mappedMsg = { ...msg, id: undefined };
    delete mappedMsg.id;
    return mappedMsg;
  });

  return llmMessages;
};

export const updateMessage = async (
  threadId: string,
  updatedMessage: Message
): Promise<void> => {
  // Get current thread messages
  const thread = await apiCall(`/thread/${threadId}`);
  const messages = thread.messages || {};
  
  // Find and update the specific message
  let messageFound = false;
  for (const [key, message] of Object.entries(messages)) {
    if ((message as Message).id === updatedMessage.id) {
      messages[key] = updatedMessage;
      messageFound = true;
      break;
    }
  }

  if (messageFound) {
    await apiCall(`/thread/${threadId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        messages: messages,
      }),
    });
  } else {
    console.warn(
      `Message with id ${updatedMessage.id} not found in thread ${threadId}.`
    );
  }
};

export const deleteThread = async (threadId: string): Promise<void> => {
  await apiCall(`/thread/${threadId}`, {
    method: 'DELETE',
  });
};

export const updateThread = async (thread: {
  threadId: string;
  name: string;
}): Promise<Thread> => {
  const updatedThread = await apiCall(`/thread/${thread.threadId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: thread.name,
    }),
  });

  return {
    threadId: updatedThread.id,
    title: updatedThread.name,
    createdAt: new Date(updatedThread.created_at * 1000), // Convert timestamp to Date
  };
};