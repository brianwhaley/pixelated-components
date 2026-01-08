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

export const CalloutWithChildren = {
	render: () => (
		<Callout
			variant='default'
			direction='left'
			img='https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png'
			imgShape="squircle"
			imgAlt='Rich content example'
			title='Rich Content with Components'
			subtitle='Using children prop for custom layouts'
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
				<p style={{ margin: 0 }}>
					This callout uses the <strong>children</strong> prop instead of the content string.
				</p>
				<div style={{ 
					padding: '1rem', 
					backgroundColor: '#f0f0f0', 
					borderRadius: '8px',
					border: '2px solid #333'
				}}>
					<h4 style={{ margin: '0 0 0.5rem 0' }}>Custom Component Example</h4>
					<ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
						<li>Rich formatting</li>
						<li>Nested components</li>
						<li>Custom layouts</li>
					</ul>
				</div>
				<button style={{ 
					padding: '0.5rem 1rem', 
					backgroundColor: '#007bff', 
					color: 'white',
					border: 'none',
					borderRadius: '4px',
					cursor: 'pointer'
				}}>
					Custom Button Component
				</button>
			</div>
		</Callout>
	)
};

export const CalloutSplitWithChildren = {
	render: () => (
		<Callout
			variant='split'
			img='https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png'
			imgAlt='Split variant with rich content'
			title='Split Layout with Children'
		>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem 0' }}>
				<section>
					<h3 style={{ marginTop: 0 }}>Section 1</h3>
					<p>This demonstrates the split variant with rich content on the right side.</p>
				</section>
				<section style={{ 
					padding: '1.5rem', 
					backgroundColor: '#f8f9fa', 
					borderLeft: '4px solid #007bff' 
				}}>
					<h3 style={{ marginTop: 0 }}>Section 2</h3>
					<p>You can include any React components or HTML here.</p>
				</section>
				<section>
					<h3>Section 3</h3>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
						<div style={{ padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
							Grid Item 1
						</div>
						<div style={{ padding: '1rem', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
							Grid Item 2
						</div>
					</div>
				</section>
			</div>
		</Callout>
	)
};
