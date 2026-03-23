import React from 'react';
import { getRouteByKey } from '@/components/general/metadata.functions';
import myRoutes from '@/data/routes.json';
import '@/css/pixelated.grid.scss';

export default {
	title: 'General',
	component: getRouteByKey
};


// Parent Component
const PageMetadata = () => {
	return (
		<>
			{JSON.stringify(getRouteByKey(myRoutes, 'name', 'Home'))}
		</>
	);
};

export const Metadata = {
	render: () => <PageMetadata /> ,
	args: {
		routes: myRoutes,
		key: 'name',
		value: 'Home',
	},
	argTypes: {
		value: {
			options: ['Home', 'Resume', "ReadMe", "Work Portfolio", "Photo Gallery", "Social Media",
				"Recipes", "Custom Sunglasses", "Customs Gallery", "Customs on eBay", "Customs Request",
				"My Customs", "NerdJokes", "Joke", "Stkr", "Form", "Form Build", "Form Extract", 
				"buzzword Bingo"
			],
			control: { type: 'select' },
		}
	}
};
