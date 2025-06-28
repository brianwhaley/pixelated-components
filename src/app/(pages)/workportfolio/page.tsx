"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/general/pixelated.general";
import { Carousel } from "@brianwhaley/pixelated-components";
import GalleryWrapper from "@/app/elements/gallerywrapper";
import type { CarouselCardType } from "@brianwhaley/pixelated-components";

export default function Gallery() {

	const [ flickrCards, setFlickrCards ] = useState<CarouselCardType[]>([]);
	const props = { 
		tags: "", // "workportfolio"
		method: "flickr.photosets.getPhotos", 
		photoset_id: "72177720326903710",
		photoSize: "Large", 
		callback: setFlickrCards 
	};
	useEffect(() => {
		async function fetchGallery() {
			await GalleryWrapper(props);
		}
		fetchGallery();
	}, []); 

	return (
		<>
			<section id="customs-section">
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