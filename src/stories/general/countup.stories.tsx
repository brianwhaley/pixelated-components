import React from 'react';
import { CountUp } from '@/components/general/countup';

export default {
	title: 'General/CountUp',
	component: CountUp,
	argTypes: {
		start: { control: 'number', description: 'Starting number' },
		end: { control: 'number', description: 'Ending number' },
		duration: { control: 'number', description: 'Duration in ms' },
		decimals: { control: 'number', description: 'Decimal places' },
		pre: { control: 'text' },
		post: { control: 'text' },
		content: { control: 'text' },
	}
};

const Template = (args: any) => <CountUp {...args} />;

export const Play = {
	render: Template,
	args: {
		id: 'countup-story',
		start: 0,
		end: 2.5,
		duration: 2000,
		decimals: 1,
		pre: '',
		post: 'K+',
		content: 'Happy Customers',
	}
};