import React from 'react';
import { EbayRateLimitsVisualizer } from '@/components/shoppingcart/ebay.components';

export default {
	title: 'ShoppingCart',
	component: EbayRateLimitsVisualizer,
	argTypes: {
		token: { control: 'text' },
	},
	args: {
		token: 'MOCK_TOKEN',
	},
};

export const RateLimits: any = (args: any) => (
	<EbayRateLimitsVisualizer 
		token={args.token} 
		apiProps={{ ...args.apiProps }} 
	/>
);
RateLimits.storyName = 'Ebay Rate Limits Visualizer';
