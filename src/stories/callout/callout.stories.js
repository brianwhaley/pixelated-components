import React from 'react';
import { Callout } from '@/components/general/callout';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import '@/css/pixelated.grid.scss';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

export default {
	title: 'Callout',
	component: Callout,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const CalloutStory = {
	title: 'Callout',
	args: {
		style: 'default',
		layout: 'horizontal',
		boxShape: 'bevel',
		direction: 'left',
		gridColumns: { left: 1, right: 3 },
		url: 'https://www.linkedin.com/in/brianwhaley',
		img: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
		imgShape: "squircle",
		imgAlt: 'Hooray for LinkedIn!',
		title: 'LinkedIn Profile',
		subtitle: 'LinkedIn Profiles are good for anyone who is looking for a new job.',
		content: 'My LinkedIn Profile - Work History, Education, Volunteer Work, Honors and Awards, Certifications, Skills, and more.',
	},
	argTypes: {
		style: {
			options: ['default' , 'boxed' , 'boxed grid' , 'full' , 'grid' , 'overlay' , 'split'],
			control: { type: 'select' },
		},
		direction: {
			options: ['left', "right"],
			control: { type: 'select' },
		},
		layout: {
			options: ['horizontal', "vertical"],
			control: { type: 'select' },
		},
		imgShape: {
			options: ['round', 'bevel', 'squircle', 'square'],
			control: { type: 'select' },
		},
	}
};
