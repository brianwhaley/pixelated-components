import React from 'react';
import { getRouteByKey } from '../components/metadata/pixelated.metadata';
import myRoutes from '../data/routes.json';
import '../components/callout/pixelated.callout.css';
import '../css/pixelated.grid.scss';

export default {
	title: 'Metadata',
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

export const Primary = {
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
