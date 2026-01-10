"use client";

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import './login.css';

export default function Login() {
	const [loading, setLoading] = useState(false);
	const searchParams = useSearchParams();
	const rawCallbackUrl = searchParams.get('callbackUrl') || '/';
  
	// Prevent redirect loops by ensuring callbackUrl doesn't point to login page
	const callbackUrl = rawCallbackUrl.startsWith('/login') ? '/' : rawCallbackUrl;

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
			<div className="login-inner-container">
				<h1 className="login-title">Login to Pixelated Admin</h1>
      
				<div className="login-card">
					<div className="login-form">
						<button
							onClick={handleGoogleSignIn}
							disabled={loading}
							className="login-signin-btn"
						>
							{loading ? 'Signing in...' : 'Sign in with Google'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}