'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-2xl font-bold text-white mb-4">
                  Dashboard
                </h1>
                <UserInfo />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function UserInfo() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-600 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-white">User Information</h3>
        <div className="mt-2 space-y-2">
          <p className="text-sm text-gray-300">
            <span className="font-medium">ID:</span> {user.id}
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-medium">Name:</span> {user.name}
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-medium">Email:</span> {user.email || 'Not provided'}
          </p>
          <p className="text-sm text-gray-300">
            <span className="font-medium">Created:</span>{' '}
            {new Date(user.created_at * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 