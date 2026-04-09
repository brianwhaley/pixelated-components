import React from 'react';
import { Tab } from '@/components/general/tab';

export default {
	title: 'General',
	component: Tab,
	argTypes: {
		orientation: {
			control: { type: 'select' },
			options: ['top', 'bottom', 'left', 'right'],
			description: 'Tab orientation',
		},
		defaultActiveTab: {
			control: { type: 'select' },
			options: ['tab1', 'tab2', 'tab3'],
			description: 'Default active tab',
		},
		onTabChange: {
			action: 'tabChanged',
			description: 'Callback when tab changes',
		},
	},
};

export const TabPlayground = {
	args: {
		tabs: [
			{ id: 'tab1', label: 'Tab 1', content: <div>Content for Tab 1</div> },
			{ id: 'tab2', label: 'Tab 2', content: <div>Content for Tab 2</div> },
			{ id: 'tab3', label: 'Tab 3', content: <div>Content for Tab 3</div> },
		],
		orientation: 'top',
		defaultActiveTab: 'tab1',
	},
};