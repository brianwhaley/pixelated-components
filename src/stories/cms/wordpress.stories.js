import React from 'react';
import { BlogPostList } from '@/components/general/wordpress.components';

export default {
	title: 'CMS/WordPress',
	component: BlogPostList,
	argTypes: {
		count: {
			control: { type: 'number', min: 1, max: 20 },
			description: 'Number of posts to display',
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
