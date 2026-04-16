import React from 'react';
import { SmartVideo } from '@/components/general/smartvideo';

export default {
	title: 'General/SmartVideo',
	component: SmartVideo,
	argTypes: {
		src: { control: 'text' },
		poster: { control: 'text' },
		variant: { control: { type: 'select' }, options: ['cloudinary', 'html'] },
		autoPlay: { control: 'boolean' },
		muted: { control: 'boolean' },
		loop: { control: 'boolean' },
		controls: { control: 'boolean' },
		playsInline: { control: 'boolean' },
		preload: { control: { type: 'select' }, options: ['auto', 'metadata', 'none'] },
		aboveFold: { control: 'boolean' },
	},
};

const Template = (args: any) => (
	<div style={{ maxWidth: 1280, margin: '0 auto', padding: '1rem' }}>
		<SmartVideo {...args} style={{ width: '100%', maxHeight: 640, borderRadius: 10 }} />
	</div>
);

export const Default: any = Template.bind({});
Default.args = {
	src: 'https://www.w3schools.com/html/mov_bbb.mp4',
	poster: 'https://via.placeholder.com/1280x720.png?text=Video+Poster',
	variant: 'html',
	controls: true,
	playsInline: true,
	autoPlay: false,
	loop: false,
	preload: 'metadata',
};

export const AutoPlayMuted: any = Template.bind({});
AutoPlayMuted.args = {
	...Default.args,
	variant: 'html',
	autoPlay: true,
	muted: true,
	loop: true,
};
