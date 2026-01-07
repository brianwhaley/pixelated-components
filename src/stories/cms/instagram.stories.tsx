import React from 'react';
import { InstagramTiles } from '@/components/general/instagram.components';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

export default {
	title: 'CMS',
	component: InstagramTiles,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story: any) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const InstagramGrid = () => (
	<InstagramTiles
		limit={12}
		rowCount={3}
		includeVideos={true}
		includeCaptions={false}
		useThumbnails={true}
	/>
);
InstagramGrid.storyName = 'Instagram Tiles Grid';

export const InstagramWithCaptions = () => (
	<InstagramTiles
		limit={9}
		rowCount={3}
		includeVideos={true}
		includeCaptions={true}
		useThumbnails={true}
	/>
);
InstagramWithCaptions.storyName = 'Instagram with Captions';
