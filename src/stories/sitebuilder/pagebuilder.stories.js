import React from 'react';
import { PageBuilderUI } from '@/components/sitebuilder/page/components/PageBuilderUI';

export default {
	title: 'Admin/SiteBuilder/Page',
	component: PageBuilderUI,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: 'Visual page builder for creating component-based layouts with drag-and-drop functionality. Features PropTypes introspection for automatic form generation.',
			},
		},
	},
};

export const Default = {
	name: 'PageBuilder UI',
	render: () => <PageBuilderUI />,
	parameters: {
		docs: {
			description: {
				story: 'The complete PageBuilder interface with component selector, properties form, component tree, and live preview.',
			},
		},
	},
};
