import React from 'react';
import { FourOhFour } from "@/components/general/404";
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import data404 from "@/data/404-data.json";
import '@/css/pixelated.global.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

const images = data404.images;

export default {
    title: 'SEO',
    component: FourOhFour,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const NotFound = {
    args: {
        images: images
    }
};
