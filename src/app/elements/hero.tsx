"use client";

import React, { useState, useEffect } from "react";
import { Carousel } from "@brianwhaley/pixelated-components";
import { GetFlickrData, GenerateFlickrCards } from '@brianwhaley/pixelated-components';
import type { CarouselCardType } from "@brianwhaley/pixelated-components";
import { getCloudinaryRemoteFetchURL } from "@/app/components/pixelated.cloudinary";
import './hero.css';


export default function Hero() {

	const [flickrCards, setFlickrCards] = useState<CarouselCardType[]>([]);

	useEffect(() => {
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
						photoSize: 'Large',
						nojsoncallback: 'true',
					}
				} 
			});
			const myFlickrImages = await myPromise;
			const myFlickrCards = GenerateFlickrCards({flickrImages: myFlickrImages, photoSize: 'Medium'});
			// REMOVE LINKS
			const myScrubbedFlickrCards = myFlickrCards.map((obj: CarouselCardType) => {
				delete obj.link;
				delete obj.bodyText;
				obj.image = getCloudinaryRemoteFetchURL(obj.image, "dlbon7tpq");
				return obj;
			});
			setFlickrCards(myScrubbedFlickrCards);
		}
		getFlickrCards();
	}, []); // Empty dependency array to run only once


	return (
		<div id="page-hero">
			<Carousel 
				cards={flickrCards} 
				draggable={false}
				imgFit="cover" />
		</div>
	);
}
