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

export const WithDescription = {
	name: 'PageBuilder Usage Guide',
	render: () => (
		<div>
			<div style={{ padding: '2rem', background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
				<h2 style={{ marginTop: 0 }}>PageBuilder V2 - How to Use</h2>
				<ol style={{ lineHeight: '1.8' }}>
					<li><strong>Select a Component:</strong> Choose from the dropdown (Page Header, Callout, Page Section, etc.)</li>
					<li><strong>Configure Properties:</strong> Fill in the auto-generated form based on the component's PropTypes</li>
					<li><strong>Add to Page:</strong> Click "Add [Component]" to add it to the root level</li>
					<li><strong>Nest Components:</strong> Click the green "➕ Child" button on layout components (Page Section, Grid Item, Flex Item) to add children</li>
					<li><strong>Edit Components:</strong> Click the blue "✏️ Edit" button to modify existing components</li>
					<li><strong>Delete Components:</strong> Click the red "🗑️ Delete" button to remove components</li>
					<li><strong>View Live Preview:</strong> See your changes in real-time in the right panel</li>
				</ol>
				<h3>Features</h3>
				<ul style={{ lineHeight: '1.8' }}>
					<li>✅ <strong>PropTypes Introspection:</strong> Automatically generates forms from component PropTypes</li>
					<li>✅ <strong>Nested Components:</strong> Support for complex hierarchical layouts</li>
					<li>✅ <strong>Live Preview:</strong> Real-time rendering of your page structure</li>
					<li>✅ <strong>Component Tree:</strong> Visual hierarchy with edit, delete, and child buttons</li>
					<li>✅ <strong>Type Safety:</strong> Full TypeScript support with InferProps</li>
					<li>✅ <strong>Select Dropdowns:</strong> PropTypes.oneOf([...]) automatically creates dropdown menus</li>
				</ul>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'PageBuilder with comprehensive usage instructions and feature list.',
			},
		},
	},
};

