import React from 'react';
import { Carousel } from '@/components/general/carousel';
import '@/css/pixelated.global.css';
import './carousel.stories.css';

export default {
	title: 'Carousel',
	component: Carousel,
};

const mycards = [
	{
		headerText: "\"Palmetto Epoxy installed durable, slip-resistant flooring in our garage that has totally exceeded our expectations.  Highly recommended!\"",
		bodyText: " - Laurie Ellis",
	} , {
		headerText: "\"I highly recommend Palmetto Epoxy for any commercial flooring needs.  They were professional, efficient, and exceeded our expectations.\"",
		bodyText: " - Jamie Bingham",
	} , {
		headerText: "\"Palmetto Epoxy did an exceptional job sealing our patio pavers.  They now look incredible and are so much easier to maintain.  We highly recommend their services for anyone looking to enhance and protect their outdoor spaces!\"",
		bodyText: " - Lindsey Kim",
	} 
];

export const CarouselReviews = {
	args: {
		cards: mycards ,
		draggable: true,
		imgFit: "contain",
	},
	argTypes: {
		imgFit: {
			options: ['contain', 'cover', 'fill'],
			control: { type: 'select' },
		},
		draggable: {
			options: [true, false],
			control: { type: 'select' },
		}
	}
};
