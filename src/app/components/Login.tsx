"use client";

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(true);
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/';
  
  // Prevent redirect loops by ensuring callbackUrl doesn't point to login page
  const callbackUrl = rawCallbackUrl.startsWith('/login') ? '/' : rawCallbackUrl;

  useEffect(() => {
    // Check if running on localhost
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="max-w-2xl w-full mx-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Login to Pixelated Admin</h1>
      
      {!isLocalhost && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          <strong>Localhost Only:</strong> This application is only accessible from localhost (127.0.0.1) for security reasons.
        </div>
      )}
      
      <div className="login-card">
        <div className="login-form">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !isLocalhost}
            className="login-signin-btn"
          >
            {loading ? 'Signing in...' : !isLocalhost ? 'Access Restricted' : 'Sign in with Google'}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}