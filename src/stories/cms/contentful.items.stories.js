import React from 'react';
import { ContentfulItems } from '@/components/general/contentful.items.components';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import '@/css/pixelated.global.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

export default {
	title: 'CMS',
	component: ContentfulItems,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const ContentfulItemsGrid = {
	args: {
		apiProps: {
			proxyURL: 'https://proxy.pixelated.tech/prod/proxy?url=',
			base_url: "https://cdn.contentful.com",
			space_id: "soi9w77t7027",
			environment: "master",
			access_token: "muY9LfpCt4qoXosDsnRkkoH3DAVVuUFEuB0WRKRdBUM",
		},
		cloudinaryProductEnv: "dzjibwmev",
	}
};
