"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@brianwhaley/pixelated-components";
import { Carousel, FlickrWrapper } from "@brianwhaley/pixelated-components";
import type { CarouselCardType } from "@brianwhaley/pixelated-components";

export default function Gallery() {

	const [ flickrCards, setFlickrCards ] = useState<CarouselCardType[]>([]);
	const props = { 
		api_key: '882cab5548d53c9e6b5fb24d59cc321d',
		user_id: '15473210@N04',
		tags: "", // "workportfolio"
		method: "flickr.photosets.getPhotos", 
		photoset_id: "72177720326903710",
		photoSize: "Large", 
		callback: getFlickrCards
	};
	function getFlickrCards(cards: CarouselCardType[]) {
		console.log("Flickr Cards:", flickrCards);
		const myCards = cards.sort((a, b) => ((a.imageAlt ?? '') < (b.imageAlt ?? '')) ? 1 : -1);
		console.log("Sorted Flickr Cards:", myCards);
		setFlickrCards(myCards);
	}
	useEffect(() => {
		async function fetchGallery() {
			await FlickrWrapper(props);
		}
		fetchGallery();
	}, []); 

	return (
		<>
			<section id="gallery-section">
				<div className="section-container">
					<PageHeader title="Work Portfolio Gallery" />
					<Carousel 
						cards={flickrCards} 
						draggable={true}
						imgFit="contain" />
				</div>
			</section>
		</>
	);
}