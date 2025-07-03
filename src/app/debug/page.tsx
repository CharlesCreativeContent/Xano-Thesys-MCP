'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import * as apiClient from '@/apiClient';

export default function DebugPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFetchThreads = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Debug - Testing thread fetch...');
      const result = await apiClient.getThreadList();
      console.log('Debug - Thread fetch result:', result);
      setThreads(result);
    } catch (err) {
      console.error('Debug - Thread fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testCreateThread = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Debug - Testing thread creation...');
      const result = await apiClient.createThread('Test Thread');
      console.log('Debug - Thread creation result:', result);
      // Refresh the list
      await testFetchThreads();
    } catch (err) {
      console.error('Debug - Thread creation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Debug Page</h1>
        
        <div className="space-y-6">
          {/* Authentication Status */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Authentication Status</h2>
            <div className="space-y-2 text-gray-300">
              <p><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
            </div>
          </div>

          {/* API Testing */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">API Testing</h2>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={testFetchThreads}
                  disabled={loading || !isAuthenticated}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Loading...' : 'Fetch Threads'}
                </button>
                <button
                  onClick={testCreateThread}
                  disabled={loading || !isAuthenticated}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded"
                >
                  {loading ? 'Loading...' : 'Create Test Thread'}
                </button>
              </div>
              
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-300 p-4 rounded">
                  <strong>Error:</strong> {error}
                </div>
              )}
            </div>
          </div>

          {/* Threads Display */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Threads ({threads.length})</h2>
            {threads.length > 0 ? (
              <div className="space-y-2">
                {threads.map((thread, index) => (
                  <div key={thread.threadId || index} className="bg-gray-700 p-3 rounded text-gray-300">
                    <p><strong>ID:</strong> {thread.threadId}</p>
                    <p><strong>Title:</strong> {thread.title}</p>
                    <p><strong>Created:</strong> {thread.createdAt ? new Date(thread.createdAt).toLocaleString() : 'Unknown'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No threads found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 