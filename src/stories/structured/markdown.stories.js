import React from 'react';
import { Markdown } from '@/components/general/markdown';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import markdowndata from '@/data/readme.md';
import '@/css/pixelated.global.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

export default {
	title: 'Structured',
	component: Markdown,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const ReadMeMarkdown = {
	args: {
		markdowndata
	}
};
