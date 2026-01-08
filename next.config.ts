import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
	experimental: {
    	optimizeCss: true,
  	},
	outputFileTracingIncludes: {
		'/**': ['./src/app/config/pixelated.config.json'],
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
		return [
			{ source: '/customsgallery.html', destination: '/customsgallery', permanent: true, },
			{ source: '/customsunglasses.html', destination: '/customsunglasses', permanent: true, },
			{ source: '/ebay', destination: '/store', permanent: true, },
			{ source: '/gallery.html', has: [ { type: 'query', key: 'tag', value: 'customsunglasses' } ], destination: '/customsunglasses', permanent: true, },
			{ source: '/gallery.html', has: [ { type: 'query', key: 'tag', value: 'pixelatedviewsgallery' } ], destination: '/photogallery', permanent: true, },
			{ source: '/index.html', destination: '/', permanent: true, },
			{ source: '/joke', destination: '/nerdjokes', permanent: true, },
			{ source: '/mycustoms.html', destination: '/mycustoms', permanent: true, },
			{ source: '/nerdjokes.html', destination: '/nerdjokes', permanent: true, },
			{ source: '/photogallery.html', destination: '/photogallery', permanent: true, },
			{ source: '/photography.html', destination: '/photography', permanent: true, },
			{ source: '/readme.html', destination: '/readme', permanent: true, },
			{ source: '/recipes.html', destination: '/recipes', permanent: true, },
			{ source: '/requests.html', destination: '/requests', permanent: true, },
			{ source: '/resume.html', destination: '/resume', permanent: true, },
			{ source: '/socialmedia.html', destination: '/socialmedia', permanent: true, },
			{ source: '/stkr.html', destination: '/stkr', permanent: true, },
			{ source: '/workportfolio.html', destination: '/workportfolio', permanent: true, },
		];
	},

	turbopack: {
		root: __dirname,
	},
	// webpack5: true,
	webpack: (config) => {
		config.resolve.fallback = {
			fs: false,
			path: false
		};
		config.resolve.alias = {
			...(config.resolve?.alias || {}),
			'@': path.resolve(__dirname, 'src'),
		};
		return config;
	},

};

export default nextConfig;
