"use client";

import React, { useEffect } from "react";
import { MicroInteractions } from "@brianwhaley/pixelated-components";
// import { loadAllImagesFromCloudinary } from "@brianwhaley/pixelated-components";
import { preloadAllCSS } from "@brianwhaley/pixelated-components";
import { preloadImages } from "@brianwhaley/pixelated-components";

export function LayoutClient() {

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
			scrollfadeElements: '.callout , .calloutSmall , .carouselContainer',
		});
	}, []);

	return ( <></> );
}