"use client";

import React, { useEffect } from "react";
import { MicroInteractions } from "@brianwhaley/pixelated-components";
import { preloadAllCSS } from "@brianwhaley/pixelated-components";
import { preloadImages } from "@brianwhaley/pixelated-components";

export default function LayoutClient() {

	useEffect(() => {
		preloadImages();
		preloadAllCSS();
	}, []);

	useEffect(() => {
		MicroInteractions({ 
			buttonring: true,
			formglow: true,
			imgscale: true,
			scrollfadeElements: '.callout , .calloutSmall , .carouselContainer',
		});
	}, []);

	return ( <></> );
}