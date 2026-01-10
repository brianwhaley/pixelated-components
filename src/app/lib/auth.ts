import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getFullPixelatedConfig } from '@pixelated-tech/components/server';

// Read unified config at module init and fail fast if required values are missing
const fullConfig = getFullPixelatedConfig();
const nextAuthCfg = fullConfig.nextAuth;
if (!nextAuthCfg || !nextAuthCfg.secret) {
	throw new Error('nextAuth.secret not configured in pixelated.config.json');
}
const googleCfg = fullConfig.google;
if (!googleCfg || !googleCfg.client_id || !googleCfg.client_secret) {
	throw new Error('Google OAuth credentials not configured in pixelated.config.json');
}

const googleProviderConfig = {
	clientId: googleCfg.client_id,
	clientSecret: googleCfg.client_secret,
	authorization: {
		params: {
			scope: 'openid email profile',
		},
	},
};
const googleProvider = GoogleProvider(googleProviderConfig);
(googleProvider as any).clientId = googleCfg.client_id;
(googleProvider as any).clientSecret = googleCfg.client_secret;

import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';

export const authOptions = {
	secret: nextAuthCfg.secret,
	providers: [googleProvider],
	pages: {
		signIn: '/login',
		error: '/login',
	},
	session: {
		strategy: 'jwt' as const,
		maxAge: 24 * 60 * 60, // 24 hours
	},
	callbacks: {
		async jwt({ token, account }: { token: JWT; account?: any }) {
			if (account) {
				(token as any).accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			(session as any).accessToken = (token as any).accessToken;
			return session;
		},
		async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
			// Prevent open redirect vulnerabilities
			if (url.startsWith(baseUrl)) return url;
			if (url.startsWith('/')) return `${baseUrl}${url}`;
			return baseUrl;
		},
	},
	events: {
		async signIn({ user }: { user: User }) {
			// Log successful sign-ins for audit
			console.log(`User signed in: ${user.email} at ${new Date().toISOString()}`);
		},
		async signOut() {
			// Log sign-outs for audit
			console.log(`User signed out at ${new Date().toISOString()}`);
		},
	},
};

export default NextAuth(authOptions);