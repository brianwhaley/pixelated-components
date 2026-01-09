import React, { useState, useEffect } from 'react';
import { Carousel } from '@/components/general/carousel';
import { GetFlickrData, GenerateFlickrCards } from '@/components/general/flickr';
import { usePixelatedConfig } from '@/components/config/config.client';
import '@/css/pixelated.global.css';
import './carousel.stories.css';

export default {
	title: 'Carousel',
	component: Carousel,
};

const FlickrPortfolioCarousel = (args) => {
	const config = usePixelatedConfig();
	const [cards, setCards] = useState([]);

	useEffect(() => {
		async function getFlickrCards() {
			const myPromise = GetFlickrData({
				flickr: {
					...config?.flickr,
					urlProps: {
						...config?.flickr?.urlProps,
						tags: 'workportfolio'
					}
				}
			});
			const myFlickrImages = await myPromise;
			const myFlickrCards = GenerateFlickrCards({flickrImages: myFlickrImages, photoSize: 'Medium'});
			// REMOVE LINKS
			const myScrubbedFlickrCards = myFlickrCards.map(obj => {
				const newObj = { ...obj };
				delete newObj.link;
				delete newObj.bodyText;
				return newObj;
			});
			setCards(myScrubbedFlickrCards);
		}
		getFlickrCards();
	}, [config]);

	return <Carousel {...args} cards={cards} />;
};

export const CarouselWorkPortfolio = {
	render: (args) => <FlickrPortfolioCarousel {...args} />,
	args: {
		draggable: true,
		imgFit: "contain",
	}
};
