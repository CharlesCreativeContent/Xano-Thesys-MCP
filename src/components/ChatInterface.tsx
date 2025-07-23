'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  C1Chat,
  useThreadListManager,
  useThreadManager,
  ThemeProvider
} from "@thesysai/genui-sdk";
import { Theme, themePresets } from '@crayonai/react-ui';
import { 
  getThreadList,
  deleteThread as deleteThreadService,
  updateThread as updateThreadService,
  createThread as createThreadService,
  getUIThreadMessages,
  updateMessage as updateMessageService
} from "@/app/services/threadService";
import { useAuth } from "@/contexts/AuthContext";
import "@crayonai/react-ui/styles/index.css";

export default function ChatInterface() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const threadIdInUrl = searchParams.get("threadId");
  const pathname = usePathname();
  const { replace } = useRouter();

  const threadListManager = useThreadListManager({
    fetchThreadList: () => {
      console.log('ChatInterface - fetchThreadList called (using service)');
      return getThreadList();
    },
    deleteThread: (threadId) => {
      console.log('ChatInterface - deleteThread called for:', threadId);
      return deleteThreadService(threadId);
    },
    updateThread: (t) => {
      console.log('ChatInterface - updateThread called for:', t);
      return updateThreadService({ threadId: t.threadId, name: t.title });
    },
    onSwitchToNew: () => {
      console.log('ChatInterface - onSwitchToNew called');
      replace(`${pathname}`);
    },
    onSelectThread: (threadId) => {
      console.log('ChatInterface - onSelectThread called for:', threadId);
      const newSearch = `?threadId=${threadId}`;
      replace(`${pathname}${newSearch}`);
    },
    createThread: (message) => {
      console.log('ChatInterface - createThread called with:', message);
      // Follow the example pattern - use message.message!
      const threadName = message.message || "New Chat";
      return createThreadService(threadName);
    },
  });

  const threadManager = useThreadManager({
    threadListManager,
    loadThread: async (threadId) => {
      console.log('ChatInterface - loadThread called for:', threadId);
      const messages = await getUIThreadMessages(threadId);
      // Convert our Message type to the SDK's expected format
      return messages.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: typeof msg.content === 'string' ? msg.content : "",
      }));
    },
    onUpdateMessage: async ({ message }) => {
      console.log('ChatInterface - onUpdateMessage called with:', message);
      console.log('ChatInterface - Current thread ID:', threadListManager.selectedThreadId);
      // Convert SDK message format to our format and save
      const convertedMessage = {
        id: message.id,
        role: message.role,
        content: message.content || "",
      };
      try {
        await updateMessageService(threadListManager.selectedThreadId!, convertedMessage);
        console.log('ChatInterface - Message saved successfully');
      } catch (error) {
        console.error('ChatInterface - Error saving message:', error);
      }
    },
    apiUrl: "/api/chat",
  });

  useEffect(() => {
    console.log('ChatInterface - useEffect triggered');
    console.log('ChatInterface - threadListManager.threads:', threadListManager.threads);
    console.log('ChatInterface - threadListManager.isLoading:', threadListManager.isLoading);
    console.log('ChatInterface - threadListManager.error:', threadListManager.error);
    
    if (threadIdInUrl && threadListManager.selectedThreadId !== threadIdInUrl) {
      threadListManager.selectThread(threadIdInUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add another effect to monitor thread changes
  useEffect(() => {
    console.log('ChatInterface - Threads changed:', threadListManager.threads.length, threadListManager.threads);
  }, [threadListManager.threads]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Please sign in to access the chat interface.</div>
      </div>
    );
  }

  const brandTheme : Theme = {...themePresets.classic.darkTheme,
      defaultChartPalette:  [" #fdc500", " #4682B4", " #00a8e8", " rgb(171, 58, 58)", " #0D1217",],
      pieChartPalette:  [" #4682B4", " #fdc500", " #00a8e8", " rgb(171, 58, 58)", " #0D1217",],
      barChartPalette: [" #fdc500", " #4682B4", " #00a8e8", " rgb(171, 58, 58)", " #0D1217",],
      lineChartPalette: [" #fdc500", " #4682B4", " #00a8e8", " rgb(171, 58, 58)", " #0D1217",],
      areaChartPalette: [" #fdc500", " #4682B4", " #00a8e8", " rgb(171, 58, 58)", " #0D1217",],
      radarChartPalette: [" #fdc500", " #4682B4", " #00a8e8", " rgb(171, 58, 58)", " #0D1217",],
      radialChartPalette: [" #fdc500", " #4682B4", "  #00a8e8", "rgb(171, 58, 58)", " #0D1217",],
  }

  return (
    <ThemeProvider theme={brandTheme}>
    <C1Chat
      agentName=""
      logoUrl='/favicon.ico'
      threadManager={threadManager}
      threadListManager={threadListManager}
    />
    </ThemeProvider>

  );
} 