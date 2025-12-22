import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  	serverExternalPackages: ['ssh2'],

	experimental: {
    	optimizeCss: false,
  	},
	transpilePackages: ['@pixelated-tech/components'],
	trailingSlash: false,
	typescript: {
		ignoreBuildErrors: true,
	},
	env: {
		PIXELATED_CONFIG_JSON: process.env.PIXELATED_CONFIG_JSON,
		PIXELATED_CONFIG_B64: process.env.PIXELATED_CONFIG_B64,
	},

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
