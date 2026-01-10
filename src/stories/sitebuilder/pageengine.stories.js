import React from 'react';
import { PageEngine } from '@/components/sitebuilder/page/components/PageEngine';
import '@/css/pixelated.global.css';

export default {
	title: 'Admin/SiteBuilder/Page',
	component: PageEngine,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: 'Visual page builder for creating component-based layouts with drag-and-drop functionality. Features PropTypes introspection for automatic form generation.',
			},
		},
	},
};

export const PageEngineExample = {
	name: 'Page Engine',
	render: () => {
		const samplePageData = {
			"components": [
				{
					"component": "Page Header",
					"props": {
						"type": "Page Header",
						"title": "Pixelated Technologies"
					},
					"children": [],
					"path": "root[1763566515616]"
				},
				{
					"component": "Callout",
					"props": {
						"type": "Callout",
						"style": "boxed",
						"boxShape": "squircle",
						"layout": "horizontal",
						"direction": "left",
						"img": "https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto,dpr_auto/https://www.pixelated.tech/images/pix/pix-bg-512.png",
						"imgAlt": "Pixelated Technologies",
						"title": "Pixelated Technologies",
						"content": "Pixelated Technologies is a Digital Services company that specializes in transforming small businesses through custom IT solutions, including web development, social media marketing, search engine optimization, content management, eCommerce solutions, and small business modernization. Our mission is to empower small businesses to thrive in the digital age by providing tailored technology services that drive growth and efficiency."
					},
					"children": [],
					"path": "root[1763566611327]"
				}
			]
		};
		
		return <PageEngine pageData={samplePageData} />;
	},
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				story: 'Example of PageEngine rendering components from JSON data without the pagebuilder UI.',
			},
		},
	},
};
