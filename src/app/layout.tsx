
"use client"; 

import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import type { Metadata } from "@brianwhaley/pixelated-components";
import { getRouteByKey } from "@brianwhaley/pixelated-components";
import { MicroInteractions } from "@brianwhaley/pixelated-components";
import { loadAllImagesFromCloudinary } from "@brianwhaley/pixelated-components";
import { deferAllCSS } from "@brianwhaley/pixelated-components";
import { preloadImages } from "@brianwhaley/pixelated-components";
import Header from "@/app/elements/header";
import Nav from "@/app/elements/nav";
import Footer from '@/app/elements/footer';
import myRoutes from "@/app/data/routes.json";
import "@brianwhaley/pixelated-components/css/pixelated.global.css";
import "@brianwhaley/pixelated-components/css/pixelated.grid.scss";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	
	useEffect(() => {
		MicroInteractions({ 
			buttonring: true,
			formglow: true,
			imgtwist: true,
			simplemenubutton: true,
			scrollfadeElements: '.callout , .calloutSmall , .carouselContainer',
		});
	}, []);

	const pathname = usePathname();
	const [ metadata, setMetadata ] = useState<Metadata | null>();
	useEffect(() => {
		const myMetadata = getRouteByKey(myRoutes.routes, "path", pathname);
		setMetadata(myMetadata);
	}, [pathname]);

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

	return (
		<html lang="en">
			<head>
				<title>{metadata?.title}</title>
				<meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
				<meta name="description" content={metadata?.description} />
				<meta name="keywords" content={metadata?.keywords} />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
				<meta property="og:site_name" content="InformationFocus" />
				<meta property="og:title" content={metadata?.title} />
				<meta property="og:url" content={url} />
				<meta property="og:type" content="website" />
				<meta property="og:description" content={metadata?.description} />
				<meta property="og:image" content="/images/pixelvivid/pix-512.gif" />
				<meta property="og:image:width" content="512" />
				<meta property="og:image:height" content="512" />
				<meta itemProp="name" content="InformationFocus" />
				<meta itemProp="url" content={url} />
				<meta itemProp="description" content={metadata?.description} />
				<meta itemProp="thumbnailUrl" content="/images/pixelvivid/pix-512.gif" />
				<link rel="canonical" href={url} />
				{ /* <link rel="alternate" href={url} hrefLang="en-us" /> */ }
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
			<body>
				<header><Header /></header>
				<nav><Nav /></nav>
				<main>{children}</main>
				<footer><Footer /></footer>
			</body>
		</html>
	);
}
