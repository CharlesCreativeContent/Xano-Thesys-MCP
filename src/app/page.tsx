"use client";

import "@crayonai/react-ui/styles/index.css";
import Navigation from "@/components/Navigation";
import ChatInterface from "@/components/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-700 rounded-lg">
              <ChatInterface />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
