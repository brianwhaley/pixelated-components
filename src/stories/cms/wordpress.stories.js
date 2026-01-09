import React from 'react';
import { BlogPostList } from '@/components/general/wordpress.components';

export default {
	title: 'CMS/WordPress',
	component: BlogPostList,
	argTypes: {
		count: {
			control: { type: 'number', min: 0 },
			description: 'Number of posts to display. Clear the value or set to 0 to fetch all available posts.',
		},
		showCategories: {
			control: 'boolean',
			description: 'Show or hide post categories',
		},
		site: {
			control: 'text',
			description: 'WordPress site URL (e.g., blog.pixelated.tech)',
		},
	},
	args: {
		count: 3,
		showCategories: true,
	},
};

const Template = (args) => <BlogPostList {...args} />;

export const WordPressBlogList = Template.bind({});
WordPressBlogList.storyName = 'WordPress Blog List';
WordPressBlogList.args = {
	count: 3,
};
