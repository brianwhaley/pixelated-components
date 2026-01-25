/** @type { import('@storybook/react-webpack5').StorybookConfig } */

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import webpack from "webpack";
// import { sharedRulesConfig } from "../webpack.config.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
    addons: [
        // '@storybook/addon-controls', // consildated into main bundle as part of Storybook 9
        "@storybook/preset-scss",
    ],
    core: {
        builder: {
            name: "@storybook/builder-webpack5",
            options: { fsCache: false },
        },
        enableCrashReports: false,
    },
    features: {
        experimentalRSC: true,
    },
    framework: {
        name: "@storybook/react-webpack5",
        options: {},
    },
    staticDirs: [/* "../dist", */ "../src"],
    stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

    webpackFinal: async (config) => {
        // config.module.rules = sharedRulesConfig;

        config.module.rules.push(
            {
                test: /\.(js|jsx|mjs|cjs|mjsx|cjsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                    },
                },
            },
            {
                test: /\.(ts|tsx|mts|cts|mtsx|ctsx)$/,
                exclude: /node_modules/,
                use: "ts-loader",
            },
            {
                test: /\.(bmp|gif|jpg|jpeg|png|svg|webp)$/,
                exclude: /node_modules/,
                type: "asset/resource",
                use: ["url-loader", "file-loader"],
            }
        );

        config.resolve.extensions.push(
            ".js",
            ".jsx",
            ".mjs",
            ".cjs",
            ".mjsx",
            ".cjsx"
        );
        config.resolve.extensions.push(
            ".ts",
            ".tsx",
            ".mts",
            ".cts",
            ".mtsx",
            ".ctsx"
        );
        config.resolve.extensions.push(".sass", ".scss");
        config.resolve.extensions.push(".css");
        config.resolve.extensions.push(
            ".bmp",
            ".gif",
            ".jpg",
            ".jpeg",
            ".png",
            ".svg",
            ".webp"
        );

        // ALIASES - More robust for different environments
        config.resolve.alias = {
            "/images": path.resolve(__dirname, "../src/images"),
            images: path.resolve(__dirname, "../src/images"),
            "@": path.resolve(__dirname, "../src"),
            // Resolve the package import to the package's compiled dist folder
            "@pixelated-tech/components": path.resolve(
                __dirname,
                "../dist"
            ),
        };

        config.plugins = config.plugins || [];
        // Define only the specific env keys we need to avoid conflicting with other DefinePlugin usages
        config.plugins.push(
				new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
				'globalThis.__NEXT_IMAGE_OPTS': JSON.stringify({
					deviceSizes: [640, 768, 1024, 1280, 1536],
					imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
					loader: 'default',
					path: '',
					domains: ['blog.pixelated.tech','res.cloudinary.com'],
					unoptimized: true,
				}),
				'process.env.__NEXT_IMAGE_OPTS': JSON.stringify({
					deviceSizes: [640, 768, 1024, 1280, 1536],
					imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
					loader: 'default',
					path: '',
					domains: ['blog.pixelated.tech','res.cloudinary.com'],
					unoptimized: true,
				}),
			})
		);

        // Removed NormalModuleReplacementPlugin to avoid dist/ dependency

        return config;
    },
};
export default config;
