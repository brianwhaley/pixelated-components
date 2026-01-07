import React, { useState, useEffect } from 'react';
import { Tiles } from "@/components/general/tiles";
import { FlickrWrapper } from "@/components/general/flickr";
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import '@/css/pixelated.global.css';

const mockConfig = {
	cloudinary: {
		product_env: 'dlbon7tpq',
		baseUrl: 'https://res.cloudinary.com',
		transforms: 'f_auto,c_limit,q_auto,dpr_auto',
	},
};

export default {
	title: 'Carousel',
	component: Tiles,
	decorators: [
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(Story) => (
			<PixelatedClientConfigProvider config={mockConfig}>
				<Story />
			</PixelatedClientConfigProvider>
		),
	],
};

const sampleTiles = [
	{
		index: 0, cardIndex: 0, cardLength: 3,
		link: "https://www.linkedin.com",
		image: "https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto,dpr_auto/https://www.pixelated.tech/images/logos/linkedin-logo.png",
		imageAlt: "Linkedin",
	},
    {
		index: 1, cardIndex: 1, cardLength: 3,
		link: "https://www.facebook.com",
		image: "https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto,dpr_auto/https://www.pixelated.tech/images/logos/facebook-logo.png",
		imageAlt: "Facebook",
	},
	{
		index: 2, cardIndex: 2, cardLength: 3,
		link: "https://www.instagram.com",
		image: "https://res.cloudinary.com/dlbon7tpq/image/fetch/f_auto,q_auto,dpr_auto/https://www.pixelated.tech/images/logos/instagram-logo.jpg",
		imageAlt: "Instagram",
	}, 
];

const FlickrTiles = () => {
	const [ flickrCards, setFlickrCards ] = useState([]);
	const props = { 
		method: "flickr.photosets.getPhotos", 
		api_key: '882cab5548d53c9e6b5fb24d59cc321d',
		user_id: '15473210@N04',
		tags: "", // "pixelatedviewsgallery"
		photoset_id: "72157712416706518",
		photoSize: "Large", 
		callback: setFlickrCards 
	};
	useEffect(() => {
		async function fetchGallery() {
			await FlickrWrapper(props);
		}
		fetchGallery();
	}, [flickrCards]); 
	return (
		<>
			<section id="customflickrtiles-section">
				<div className='section-container'>
					<Tiles cards={sampleTiles} rowCount={3}/>
				</div>
			</section>

			<section id="flickrtiles-section">
				<div className='section-container'>
					<Tiles cards={flickrCards} rowCount={3}/>
				</div>
			</section>
		</>
	);
};

export const TilesStory = () => <FlickrTiles />;
