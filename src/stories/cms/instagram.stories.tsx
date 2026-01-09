import React from 'react';
import { InstagramTiles } from '@/components/general/instagram.components';

export default {
	title: 'CMS/Instagram',
	component: InstagramTiles,
	argTypes: {
		limit: { control: { type: 'number', min: 1, max: 50 } },
		rowCount: { control: { type: 'number', min: 1, max: 6 } },
		includeVideos: { control: 'boolean' },
		includeCaptions: { control: 'boolean' },
		useThumbnails: { control: 'boolean' },
		accessToken: { control: 'text' },
		userId: { control: 'text' },
	},
	args: {
		limit: 12,
		rowCount: 3,
		includeVideos: true,
		includeCaptions: false,
		useThumbnails: true,
	},
};

const Template = (args: any) => <InstagramTiles {...args} />;

export const Default: any = Template.bind({});
Default.storyName = 'Instagram Grid';

export const WithCaptions: any = Template.bind({});
WithCaptions.args = {
	limit: 9,
	includeCaptions: true,
};
WithCaptions.storyName = 'Instagram with Captions';
