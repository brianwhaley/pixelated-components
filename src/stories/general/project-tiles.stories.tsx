import React from 'react';
import { ProjectTiles } from '@/components/general/tiles';

export default {
	title: 'General',
	component: ProjectTiles,
};

const sampleCards = [
	{ index: 0, cardIndex: 0, cardLength: 6, image: 'https://images.ctfassets.net/kcm01cmyxlgq/528AoRBZk9eqvHCRyHbhgJ/72ea3aa814871aea495380bec4856fbd/img_5435.jpg', imageAlt: 'One' },
	{ index: 1, cardIndex: 1, cardLength: 6, image: 'https://images.ctfassets.net/kcm01cmyxlgq/528AoRBZk9eqvHCRyHbhgJ/72ea3aa814871aea495380bec4856fbd/img_5435.jpg', imageAlt: 'Two' },
	{ index: 2, cardIndex: 2, cardLength: 6, image: 'https://images.ctfassets.net/kcm01cmyxlgq/528AoRBZk9eqvHCRyHbhgJ/72ea3aa814871aea495380bec4856fbd/img_5435.jpg', imageAlt: 'Three' },
	{ index: 3, cardIndex: 3, cardLength: 6, image: 'https://images.ctfassets.net/kcm01cmyxlgq/528AoRBZk9eqvHCRyHbhgJ/72ea3aa814871aea495380bec4856fbd/img_5435.jpg', imageAlt: 'Four' },
	{ index: 4, cardIndex: 4, cardLength: 6, image: 'https://images.ctfassets.net/kcm01cmyxlgq/528AoRBZk9eqvHCRyHbhgJ/72ea3aa814871aea495380bec4856fbd/img_5435.jpg', imageAlt: 'Five' },
	{ index: 5, cardIndex: 5, cardLength: 6, image: 'https://images.ctfassets.net/kcm01cmyxlgq/528AoRBZk9eqvHCRyHbhgJ/72ea3aa814871aea495380bec4856fbd/img_5435.jpg', imageAlt: 'Six' },
];

export const Default = () => (
	<div style={{ padding: 20 }}>
		<ProjectTiles title="Example Projects" description="A sample project gallery" tileCards={sampleCards} />
	</div>
);

Default.storyName = 'ProjectTiles — default';