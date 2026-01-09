import React, { useState, useEffect } from 'react';
import { Tiles } from "@/components/general/tiles";
import { FlickrWrapper } from "@/components/general/flickr";
import { usePixelatedConfig } from '@/components/config/config.client';
import '@/css/pixelated.global.css';

export default {
	title: 'Carousel',
	component: Tiles,
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
	const config = usePixelatedConfig();

	useEffect(() => {
		async function fetchGallery() {
			if (!config?.flickr) return;
			const props = { 
				method: "flickr.photosets.getPhotos", 
				api_key: config.flickr.urlProps.api_key,
				user_id: config.flickr.urlProps.user_id,
				tags: "", // "pixelatedviewsgallery"
				photoset_id: "72157712416706518", // Specific set
				photoSize: "Large", 
				callback: setFlickrCards 
			};
			await FlickrWrapper(props);
		}
		fetchGallery();
	}, [config]); 

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
