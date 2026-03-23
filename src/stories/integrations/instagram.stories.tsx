import React from 'react';
import { InstagramTiles } from '@/components/integrations/instagram.components';

export default {
	title: 'General',
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

export const InstagramDefault: any = Template.bind({});
InstagramDefault.storyName = 'Instagram Grid';

export const InstagramWithCaptions: any = Template.bind({});
InstagramWithCaptions.args = {
	limit: 9,
	includeCaptions: true,
};
InstagramWithCaptions.storyName = 'Instagram with Captions';
