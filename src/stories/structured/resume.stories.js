import React from 'react';
import { Resume } from '@/components/general/resume';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import ResumeData from '@/data/resume.json';
import ReferencesData from '@/data/references.json';
import '@/css/pixelated.global.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

ResumeData.items[0].properties.references = ReferencesData.items[0].properties.references;

export default {
	title: 'Structured',
	component: Resume,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

export const BTW_Resume = {
	args: {
		data: { items: ResumeData.items }
	}
};

