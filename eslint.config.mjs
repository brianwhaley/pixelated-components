import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
// import pluginJs from "@eslint/js";
// import pluginReact from "eslint-plugin-react";
import eslint from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

import parser from '@typescript-eslint/parser';

export default defineConfig([
	{ 
		files: ['**/*.{js,jsx,mjs,mjsx,cjs,cjsx,ts,tsx,mts,mtsx,cts,ctsx}'],
		languageOptions: { 
			globals: globals.browser 
		}, 
		plugins: {
			'@next/next': pluginNext,
		},
		extends: [
			eslint.configs.recommended,
			tseslint.configs.recommended,
		],
		rules: {
			...pluginNext.configs.recommended.rules,
			'indent': ['error', 'tab'],
			'no-tabs': 'off', // Optional: If you strictly want to allow only tabs
			"semi": ["error", "always"],
			"@next/next/no-img-element": "off",
			"@next/next/no-html-link-for-pages": "off",
		},
	},
	globalIgnores([
		".next/",
		"certificates/",
		"node-modules/*", 
		"/*", 
		"!/src",
		"src/tests/",
		"eslint.config.mjs",
  	]),
]);