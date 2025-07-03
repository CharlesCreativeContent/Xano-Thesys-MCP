import OpenAI from "openai";
import { 
  getUIThreadMessages, 
  addMessagesWithAuth,
  getLLMThreadMessages,
  Message
} from "@/app/services/threadService";

export type DBMessage = OpenAI.Chat.ChatCompletionMessageParam & {
  id?: string;
};

// In-memory cache for performance (optional)
const messagesCache: {
  [threadId: string]: DBMessage[];
} = {};

export const getMessageStore = (threadId: string, authToken?: string) => {
  return {
    addMessage: async (message: DBMessage) => {
      try {
        // Add message to Xano
        await addMessagesWithAuth(threadId, authToken, message as Message);
        
        // Update cache if it exists
        if (messagesCache[threadId]) {
          messagesCache[threadId].push(message);
        }
      } catch (error) {
        console.error('Error adding message to store:', error);
        throw error;
      }
    },
    
    getOpenAICompatibleMessageList: async (): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> => {
      try {
        // Try cache first
        if (messagesCache[threadId]) {
          return messagesCache[threadId].map((m) => {
            const message = { ...m };
            delete message.id;
            return message;
          });
        }
        
        // Fetch from Xano
        const messages = await getLLMThreadMessages(threadId, authToken);
        
        // Update cache
        messagesCache[threadId] = messages.map(m => ({ ...m, id: (m as Message).id }));
        
        return messages;
      } catch (error) {
        console.error('Error getting messages from store:', error);
        // Return empty array if we can't fetch messages
        return [];
      }
    },
    
    // Helper method to get UI messages
    getUIMessages: async () => {
      try {
        return await getUIThreadMessages(threadId, authToken);
      } catch (error) {
        console.error('Error getting UI messages:', error);
        return [];
      }
    }
  };
}; 