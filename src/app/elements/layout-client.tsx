"use client";

import React, { useEffect } from "react";
import { MicroInteractions } from "@pixelated-tech/components";
import { preloadAllCSS } from "@pixelated-tech/components";
import { preloadImages } from "@pixelated-tech/components";

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