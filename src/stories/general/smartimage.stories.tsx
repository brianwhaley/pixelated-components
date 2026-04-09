import React from 'react';
import { SmartImage, SmartImageType } from '@/components/general/smartimage';

export default {
	title: 'General',
	component: SmartImage,
	argTypes: {
		variant: {
			control: 'radio',
			options: ['cloudinary', 'nextjs', 'img'],
			description: 'Rendering variant for the image component',
			table: { defaultValue: { summary: 'cloudinary' } }
		},
		src: {
			control: 'text',
			description: 'Image source URL',
		},
		alt: {
			control: 'text',
			description: 'Alt text for accessibility',
		},
		width: {
			control: 'number',
			description: 'Image width in pixels',
		},
		height: {
			control: 'number',
			description: 'Image height in pixels',
		},
		aboveFold: {
			control: 'boolean',
			description: 'Whether the image is above the fold for performance optimization',
			table: { defaultValue: { summary: 'false' } }
		},
		quality: {
			control: 'number',
			min: 1,
			max: 100,
			description: 'Image quality (1-100)',
		},
		loading: {
			control: 'radio',
			options: ['lazy', 'eager'],
			description: 'Loading strategy',
			table: { defaultValue: { summary: 'lazy' } }
		},
	}
};

const Template: React.FC<SmartImageType & React.ImgHTMLAttributes<HTMLImageElement>> = (args) => (
	<SmartImage {...args} />
);

// --- Stories ---

export const SmartImagePlayground = {
	render: Template,
	args: {
        src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
        alt: 'Mountain landscape',
        width: 800,
        height: 600,
        variant: "img"
    },
};