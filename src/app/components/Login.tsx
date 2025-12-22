"use client";

import { signIn, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Login() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        window.location.href = '/';
      }
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn('google');
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    await signIn('apple');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Pixelated Admin</h1>
        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>
          <button
            onClick={handleAppleSignIn}
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in with Apple'}
          </button>
        </div>
      </div>
    </div>
  );
}