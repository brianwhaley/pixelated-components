import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  /* config options here */
	transpilePackages: ['@brianwhaley/pixelated-components'],
	trailingSlash: false,
	typescript: {
		ignoreBuildErrors: true,
	},

	async redirects() {
		return [];
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
