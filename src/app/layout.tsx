
"use client"; 

import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import type { Metadata } from "@/app/components/metadata/pixelated.metadata";
import { getRouteByKey } from "@brianwhaley/pixelated-components";
import { MicroInteractions } from "@brianwhaley/pixelated-components";
import "@brianwhaley/pixelated-components/dist/css/pixelated.global.css";
import "@brianwhaley/pixelated-components/dist/css/pixelated.grid.scss";
import Header from "@/app/elements/header";
import Nav from "@/app/elements/nav";
import Footer from '@/app/elements/footer';
import myRoutes from "@/app/data/routes.json";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {

	const pathname = usePathname();
	const [ origin, setOrigin ] = useState<string | null>(null);
	const [ metadata, setMetadata ] = useState<Metadata | null>();
	// const [ host, setHost ] = useState<string | null>(null);
	
	useEffect(() => {
		MicroInteractions({ 
			buttonring: true,
			formglow: true,
			imgtwist: true,
			simplemenubutton: true,
			scrollfadeElements: '.callout , .calloutSmall , .carouselContainer',
		});
	}, []);

	useEffect(() => {
		const myMetadata = getRouteByKey(myRoutes.routes, "path", pathname);
		setMetadata(myMetadata);
		setOrigin(window.location.href || null);
		// setOrigin(window.location.origin || null);
		// setHost(window.location.host || null);
	}, [pathname]);

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
				<meta property="og:url" content={origin ?? undefined} />
				<meta property="og:type" content="website" />
				<meta property="og:description" content={metadata?.description} />
				<meta property="og:image" content="/images/pixelvivid/pix-512.gif" />
				<meta property="og:image:width" content="512" />
				<meta property="og:image:height" content="512" />
				<meta itemProp="name" content="InformationFocus" />
				<meta itemProp="url" content={origin ?? undefined} />
				<meta itemProp="description" content={metadata?.description} />
				<meta itemProp="thumbnaillUrl" content="/images/pixelvivid/pix-512.gif" />
				<link rel="alternate" href={origin ?? undefined} hrefLang="en-us" />
				<link rel="canonical" href={origin ?? undefined} />
				<link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="shortcut icon" type="image/x-icon" href="/images/favicon.ico" />
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
