import type { Thread } from "@crayonai/react-core";
import { getToken } from "@/lib/auth";

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  console.log('ApiClient - Token retrieved:', token ? 'Present' : 'Missing');
  console.log('ApiClient - Making request to:', endpoint);
  
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    console.error('ApiClient - Request failed:', response.status, response.statusText);
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Export thread list operations
export const getThreadList = async (): Promise<Thread[]> => {
  const result = await apiCall('/api/threads');
  console.log('ApiClient - getThreadList result:', result);
  return result;
};

export const deleteThread = async (threadId: string): Promise<void> => {
  await apiCall(`/api/thread/${threadId}`, {
    method: 'DELETE',
  });
};

export const updateThread = async (thread: Thread): Promise<Thread> => {
  return apiCall(`/api/thread/${thread.threadId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: thread.title,
    }),
  });
};

export const createThread = async (name: string): Promise<Thread> => {
  return apiCall('/api/threads', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

// Export message operations
export const getMessages = async (threadId: string): Promise<any[]> => {
  const result = await apiCall(`/api/thread/${threadId}`);
  console.log('ApiClient - getMessages result for thread', threadId, ':', result);
  return result;
};

export const updateMessage = async (threadId: string, message: any): Promise<void> => {
  // For message updates, we'll still use the thread service directly
  // since this is typically called for form submissions and other UI updates
  const { updateMessage: updateMessageService } = await import("@/app/services/threadService");
  return updateMessageService(threadId, message);
};

export const addMessage = async (threadId: string, message: any): Promise<void> => {
  await apiCall(`/api/thread/${threadId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      messages: [message],
    }),
  });
}; 