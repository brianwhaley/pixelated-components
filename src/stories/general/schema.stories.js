import React from 'react';
import { LocalBusinessSchema } from '@/components/general/schema-localbusiness';
import { WebsiteSchema } from '@/components/general/schema-website';

export default {
	title: 'General',
	component: LocalBusinessSchema,
};

export const Schema_LocalBusiness_From_Config = {
	render: () => (
		<div>
			<h3>LocalBusiness Schema (using routes.json data)</h3>
			<p>This component automatically pulls business data from the siteInfo section of routes.json</p>
			<LocalBusinessSchema />
		</div>
	),
};

export const Schema_LocalBusiness_Custom_Props = {
	render: () => (
		<div>
			<h3>LocalBusiness Schema (with custom props)</h3>
			<p>Custom props override the default config data</p>
			<LocalBusinessSchema
				name="Custom Business Name"
				description="A custom description for this business"
			/>
		</div>
	),
};

export const Schema_Website_From_Config = {
	render: () => (
		<div>
			<h3>Website Schema (using routes.json data)</h3>
			<p>This component automatically pulls website data from the siteInfo section of routes.json</p>
			<WebsiteSchema />
		</div>
	),
};

export const Schema_Website_With_Search = {
	render: () => (
		<div>
			<h3>Website Schema (with search functionality)</h3>
			<p>Includes search action for enhanced SEO</p>
			<WebsiteSchema
				potentialAction={{
					'@type': 'SearchAction',
					target: {
						'@type': 'EntryPoint',
						urlTemplate: 'https://pixelated.tech/search?q={search_term_string}'
					},
					'query-input': 'required name=search_term_string'
				}}
			/>
		</div>
	),
};