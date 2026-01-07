import React from 'react';
import { GoogleAnalytics } from '@/components/general/googleanalytics';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';

const mockConfig = {
	googleAnalytics: {
		id: 'G-MOCK123456',
		adId: 'AW-MOCK789012',
	},
};

export default {
	title: 'SEO',
	component: GoogleAnalytics,
	decorators: [
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const Google_Analytics_Config = {
	args: {},
};

export const Google_Analytics_Props = {
	args: {
		id: "G-1J1W90VBE1",
	},
	decorators: [
		(Story) => (
			<PixelatedClientConfigProvider config={{}}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};
