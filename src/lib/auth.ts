import type { Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getFullPixelatedConfig } from '@pixelated-tech/components/server';

type NextAuthConfig = {
	secret?: string;
};

type GoogleConfig = {
	client_id?: string;
	client_secret?: string;
};

const fullConfig = getFullPixelatedConfig();
const nextAuthCfg = (fullConfig.nextAuth ?? {}) as NextAuthConfig;
const googleCfg = (fullConfig.google ?? {}) as GoogleConfig;

if (!nextAuthCfg.secret) {
	throw new Error('nextAuth.secret not configured in pixelated.config.json');
}
if (!googleCfg.client_id || !googleCfg.client_secret) {
	throw new Error('Google OAuth credentials not configured in pixelated.config.json');
}

const googleProvider = GoogleProvider({
	clientId: googleCfg.client_id,
	clientSecret: googleCfg.client_secret,
	authorization: { params: { scope: 'openid email profile' } },
});
(googleProvider as any).clientId = googleCfg.client_id;
(googleProvider as any).clientSecret = googleCfg.client_secret;

export const authOptions: NextAuthOptions = {
	secret: nextAuthCfg.secret,
	providers: [googleProvider],
	pages: {
		signIn: '/login',
		error: '/login',
	},
	session: {
		strategy: 'jwt',
		maxAge: 24 * 60 * 60,
	},
	callbacks: {
		async jwt({ token, account }: { token: JWT; account?: any }) {
			if (account?.access_token) {
				(token as any).accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }: { session: Session; token: JWT }) {
			if ((token as any).accessToken) {
				(session as any).accessToken = (token as any).accessToken;
			}
			return session;
		},
		async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
			if (url.startsWith(baseUrl)) return url;
			if (url.startsWith('/')) return `${baseUrl}${url}`;
			return baseUrl;
		},
	},
};
