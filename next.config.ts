import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
    	optimizeCss: true,
  	},
	transpilePackages: ['@pixelated-tech/components'],
	trailingSlash: false,
	typescript: {
		ignoreBuildErrors: true,
	},

	env: {
		// Unified pixelated config: prefer supplying the full JSON or base64 blob
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
		return [
			{ source: '/cart', destination: '/', permanent: true, },
			{ source: '/home', destination: '/', permanent: true, },
			{ source: '/donate', destination: '/', permanent: true, },
			{ source: '/services-5', destination: '/', permanent: true, },
			{ source: '/blog', destination: '/', permanent: true, },
			{ source: '/projects/category/Culture', destination: '/projects', permanent: true, },
			{ source: '/projects/category/Health', destination: '/projects', permanent: true, },
			{ source: '/projects/category/Relationships', destination: '/projects', permanent: true, },
			{ source: '/projects/tag/Jobs', destination: '/projects', permanent: true, },
			{ source: '/projects/the-beauty-vault-salon-june-2024', destination: '/projects/the%20beauty%20vault%20salon%20june%202024', permanent: true, },
		];
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
