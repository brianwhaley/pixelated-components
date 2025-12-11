import globals from "globals";
import eslint from "@eslint/js";
import pluginNext from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import parser from "@typescript-eslint/parser";

export default [
	{
		ignores: [
			".next/",
			"certificates/",
			"node_modules/**",
			"dist/",
		],
	},
	{
		files: ["**/*.{js,jsx,mjs,mjsx,cjs,cjsx,ts,tsx,mts,mtsx,cts,ctsx}"],
		languageOptions: {
			parser,
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				jsx: true,
			},
		},
		plugins: {
			"@next/next": pluginNext,
			"@typescript-eslint": tseslint.plugin,
		},
		rules: {
			...eslint.configs.recommended.rules,
			...tseslint.configs.recommended[0].rules,
			...tseslint.configs.recommended[1].rules,
			...pluginNext.configs.recommended.rules,
			"indent": ["error", "tab"],
			"no-tabs": "off",
			"semi": ["error", "always"],
			"@next/next/no-img-element": "off",
			"@next/next/no-html-link-for-pages": "off",
		},
	},
];