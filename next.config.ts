import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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

};

export default nextConfig;
