import React from 'react';
import { Carousel } from '@/components/general/carousel';
import { GetFlickrData, GenerateFlickrCards } from '@/components/general/flickr';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import '@/css/pixelated.global.css';
import './carousel.stories.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

export default {
	title: 'Carousel',
	component: Carousel,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

/* ========== FLICKR HANDLER ========== */
async function getFlickrCards() {
	const myPromise = GetFlickrData({
		flickr : {
			baseURL: 'https://api.flickr.com/services/rest/?',
			urlProps: {
				method: 'flickr.photos.search',
				api_key: '882cab5548d53c9e6b5fb24d59cc321d',
				user_id: '15473210@N04',
				tags: 'pixelatedviewsgallery',
				extras: 'date_taken,description,owner_name',
				sort: 'date-taken-desc',
				per_page: 500,
				format: 'json',
				photoSize: 'Medium',
				nojsoncallback: 'true' /*,
				startPos: 0 */
			}
		} 
	});
	const myFlickrImages = await myPromise;
	const myFlickrCards = GenerateFlickrCards({flickrImages: myFlickrImages, photoSize: 'Medium'});
	// console.log('Flickr Cards:', myFlickrCards);
	// REMOVE LINKS
	const myScrubbedFlickrCards = myFlickrCards.map(obj => {
		delete obj.link;
		delete obj.bodyText;
		return obj;
	});
	return myScrubbedFlickrCards;
}

export const Carousel2 = {
	args: {
		cards: await getFlickrCards() ,
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
