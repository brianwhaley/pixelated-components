import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
    	optimizeCss: true,
  	},
	outputFileTracingIncludes: {
		'/**': ['./src/app/config/pixelated.config.json.enc'],
	},
	transpilePackages: ['@pixelated-tech/components'],
	trailingSlash: false,
	typescript: {
		ignoreBuildErrors: true,
	},
	env: {
		PIXELATED_CONFIG_KEY: process.env.PIXELATED_CONFIG_KEY,
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

	turbopack: {
		root: __dirname,
	},
	webpack: (config) => {
		config.resolve.fallback = { 
			fs: false,
			path: false
		};
		return config;
	},

};

export default nextConfig;
