"use client"; 

import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { getRouteByKey } from "@brianwhaley/pixelated-components";
import { MicroInteractions } from "@brianwhaley/pixelated-components";
import { loadAllImagesFromCloudinary } from "@brianwhaley/pixelated-components";
import { deferAllCSS } from "@brianwhaley/pixelated-components";
import { preloadImages } from "@brianwhaley/pixelated-components";
// import { getRouteByKey } from "@brianwhaley/pixelated-components";
// import { getMetadata } from "@brianwhaley/pixelated-components";
import "@brianwhaley/pixelated-components/css/pixelated.global.css";
import "@brianwhaley/pixelated-components/css/pixelated.grid.scss";
import HomeLayout from "@/app/layouts/home-layout";
import PageLayout from "@/app/layouts/page-layout";
import myRoutes from "@/app/data/routes.json";
import "./globals.css";

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
	const pathname = usePathname();
	const metadata = getRouteByKey(myRoutes.routes, "path", pathname);
	let layout;
	if (pathname === '/') {
		layout = <HomeLayout>{children}</HomeLayout> ;
	} else {
		layout = <PageLayout>{children}</PageLayout> ;
	}

	const [ url, setURL ] = useState<string>();
	useEffect(() => {
		document.addEventListener('DOMContentLoaded', deferAllCSS);
		preloadImages();
		deferAllCSS();
		if (typeof window !== "undefined" ) setURL(window.location.href);
		loadAllImagesFromCloudinary({ 
			origin: window.location.origin,
			product_env: "dlbon7tpq"
		});
	}, []);

	useEffect(() => {
		MicroInteractions({ 
			buttonring: true,
			formglow: true,
			grayscalehover: true,
			imgtwist: true,
			scrollfadeElements: '.callout , .calloutSmall , .carouselContainer',
		});
	}, []);

	return (
		<html lang="en">
			<head>
				<title>{metadata?.title}</title>
				<meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
				<meta name="description" content={metadata?.description} />
				<meta name="keywords" content={metadata?.keywords} />
				<meta name="google-site-verification" content="t2yy9wL1bXPiPQjBqDee2BTgpiGQjwVldlfa4X5CQkU" />
				<meta name="google-site-verification" content="l7D0Y_JsgtACBKNCeFAXPe-UWqo13fPTUCWhkmHStZ4" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
				<meta property="og:site_name" content="Pixelated" />
				<meta property="og:title" content={metadata?.title} />
				<meta property="og:url" content={url} />
				<meta property="og:type" content="website" />
				<meta property="og:description" content={metadata?.description} />
				<meta property="og:image" content="/images/pix/pix-bg-512.gif" />
				<meta property="og:image:width" content="512" />
				<meta property="og:image:height" content="512" />
				<meta itemProp="name" content="Pixelated" />
				<meta itemProp="url" content={url} />
				<meta itemProp="description" content={metadata?.description} />
				<meta itemProp="thumbnailUrl" content="/images/pix-bg-512.gif" />
				<link rel="canonical" href={url} />
				{ /*  <link rel="alternate" href={url} hrefLang="en-us" /> */ }
				<link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
				<link rel="shortcut icon" type="image/x-icon" href="/images/favicon.ico" />
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="preconnect" href="https://images.ctfassets.net/" />
				<link rel="preconnect" href="https://res.cloudinary.com/" />
				<link rel="preconnect" href="https://farm2.static.flickr.com" />
				<link rel="preconnect" href="https://farm6.static.flickr.com" />
				<link rel="preconnect" href="https://farm8.static.flickr.com" />
				<link rel="preconnect" href="https://farm66.static.flickr.com" />
			</head>
			<body>{layout}</body>
		</html>
	);
}
