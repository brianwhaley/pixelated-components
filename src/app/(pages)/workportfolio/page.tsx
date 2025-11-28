"use client";

import React, { useState, useEffect } from "react";
import { PageSection } from "@brianwhaley/pixelated-components";
import { PageHeader } from "@brianwhaley/pixelated-components";
import { Carousel, FlickrWrapper } from "@brianwhaley/pixelated-components";
import type { CarouselCardType } from "@brianwhaley/pixelated-components";
import { getFullConfig } from '@brianwhaley/pixelated-components/server';

export default function Gallery() {

	const config = getFullConfig();
	const [ flickrCards, setFlickrCards ] = useState<CarouselCardType[]>([]);
	const props = { 
		api_key: config.flickr?.urlProps.api_key ?? "",
		user_id: config.flickr?.urlProps.user_id ?? "",
		tags: "", // "workportfolio"
		method: config.flickr?.urlProps.method ?? "flickr.photosets.getPhotos",
		photoset_id: config.flickr?.urlProps.photoset_id ?? "72177720326903710",
		photoSize: config.flickr?.urlProps.photoSize ?? "Large",
		callback: getFlickrCards
	};
	function getFlickrCards(cards: CarouselCardType[]) {
		const myCards = cards.sort((a, b) => ((a.imageAlt ?? '') < (b.imageAlt ?? '')) ? 1 : -1);
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
			<PageSection columns={1} id="gallery-section">
				<PageHeader title="Work Portfolio Gallery" />
				<Carousel 
					cards={flickrCards} 
					draggable={true}
					imgFit="contain" />
			</PageSection>
		</>
	);
}