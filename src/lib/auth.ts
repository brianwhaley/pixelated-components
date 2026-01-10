import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getFullPixelatedConfig } from '@pixelated-tech/components/server';

const cfg = getFullPixelatedConfig();
const googleCfg = cfg.google;
if (!googleCfg || !googleCfg.client_id || !googleCfg.client_secret) {
	throw new Error('Google OAuth credentials not configured in pixelated.config.json');
}

const googleProviderConfig = {
	clientId: googleCfg.client_id!,
	clientSecret: googleCfg.client_secret!,
};
const googleProvider = GoogleProvider(googleProviderConfig);
// Expose clientId/clientSecret on the provider object for easier testing and debugging
(googleProvider as any).clientId = googleCfg.client_id!;
(googleProvider as any).clientSecret = googleCfg.client_secret!;

export const authOptions = {
	providers: [googleProvider],
	pages: {
		signIn: '/login',
	},
};

export default NextAuth(authOptions);