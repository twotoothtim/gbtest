'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser, currentUser } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Already signed in? Send them straight to their dashboard.
  if (currentUser()) {
    router.replace('/dashboard');
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginUser(username.trim(), password);
    if (!result.ok) return setError(result.error ?? 'Login failed.');
    router.push('/dashboard');
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Log in</h1>
        <p className="text-sm text-gray-600 mb-6">Access your group buy reservations and payment status.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="peptidelab42"
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-gray-700 mb-1">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border rounded-lg px-3 py-2.5 text-sm"
            />
          </label>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow">
            Log In
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-5 text-center">
          New here?{' '}
          <Link href="/register" className="text-indigo-600 hover:underline font-medium">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
