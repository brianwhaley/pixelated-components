import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  	serverExternalPackages: ['ssh2'],

	experimental: {
    	optimizeCss: false,
  	},
	outputFileTracingIncludes: {
		'/**': ['./src/app/config/pixelated.config.json'],
	},
	transpilePackages: ['@pixelated-tech/components'],
	trailingSlash: false,
	typescript: {
		ignoreBuildErrors: true,
	},
	// Environment variables removed for secrets.
	// All runtime configuration (Google creds, NextAuth secrets) should be provided via `src/app/config/pixelated.config.json` and accessed with `getFullPixelatedConfig()`.
	// If you need to expose non-secret values to the client, use a server helper that returns `getClientOnlyPixelatedConfig()`.
	env: {},

	images: {
		remotePatterns: [
			{
				protocol: 'https', // Or 'http' if needed, but 'https' is recommended
				hostname: '**', // Allows any hostname
				port: '', // Optional: specify port if needed
				pathname: '**', // Optional: allows any pathname
			},
		],
	},

	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-Frame-Options',
						value: 'DENY',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'strict-origin-when-cross-origin',
					},
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=()',
					},
				],
			},
		];
	},

	async redirects() {
		return [];
	},

	turbopack: {},
	webpack: (config) => {
		config.resolve.fallback = {
			fs: false,
			path: false
		};
		return config;
	},


};

export default nextConfig;
