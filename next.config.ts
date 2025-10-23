import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  
	/* config options here */
	transpilePackages: ['@brianwhaley/pixelated-components'],
	trailingSlash: false,
	typescript: {
		ignoreBuildErrors: true,
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

	turbopack: {},
	// webpack5: true,
	webpack: (config) => {
		config.resolve.fallback = { 
			fs: false,
			path: false
		};
		return config;
	},
	// output:'export'

};

export default nextConfig;
