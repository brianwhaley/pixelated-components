"use client";

import React, { useEffect } from "react";
import { MicroInteractions } from "@pixelated-tech/components";
// import { loadAllImagesFromCloudinary } from "@pixelated-tech/components";
import { preloadAllCSS } from "@pixelated-tech/components";
import { preloadImages } from "@pixelated-tech/components";

export default function LayoutClient() {

	useEffect(() => {
		preloadImages();
		preloadAllCSS();
		/* loadAllImagesFromCloudinary({ 
			origin: window.location.origin,
			product_env: "dlbon7tpq"
		}); */
	}, []);

	useEffect(() => {
		MicroInteractions({ 
			buttonring: true,
			formglow: true,
			grayscalehover: true,
			imgscale: true,
			scrollfadeElements: '.callout , .calloutSmall , .carousel-container',
		});
	}, []);

	return ( <></> );
}