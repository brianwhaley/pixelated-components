import React from "react";

export function descriptionToKeywords(descriptionText: string, numKeywords = 5, customStopWords: string[] = []) {
  	if (!descriptionText) {
    	return [];
  	}
  	// Define a default list of common English stop words
  	const defaultStopWords = new Set([
    	'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for', 'if', 'in', 'into',
    	'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such', 'that', 'the', 'their',
    	'then', 'there', 'these', 'they', 'this', 'to', 'was', 'will', 'with'
  	]);
  	const allStopWords = new Set([...defaultStopWords, ...customStopWords]);
	// Pre-process the text: make lowercase and remove punctuation
	const cleanedText = descriptionText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
	// Tokenize the text into individual words
	const words = cleanedText.split(/\s+/);
	// Count word frequencies, excluding stop words
	const wordFrequency = words.reduce((counts: Record<string, number>, word) => {
		if (word.length > 2 && !allStopWords.has(word)) {
			counts[word] = (counts[word] || 0) + 1;
		}
		return counts;
	}, {} as Record<string, number>);
	// Sort words by frequency and get the top N keywords
	const sortedKeywords = Object.keys(wordFrequency).sort((a, b) => wordFrequency[b] - wordFrequency[a]);
	// Return the top N keywords
	return sortedKeywords.slice(0, numKeywords);
}

export type Route = {
	name?: string;
	path?: string;
	title?: string;
	description?: string;
	keywords?: string;
	routes?: Route[];
	[key: string]: any;
}

export function getRouteByKey(obj: any, key: string, value: any): any {
	if (typeof obj !== 'object' || obj === null) {
		return null;
	}
	if (obj[key] && obj[key] === value) {
		return obj;
	}
	for (const prop in obj) {
		if (obj[prop] && typeof obj[prop] === 'object') {
	  		const result = getRouteByKey(obj[prop], key, value);
	  		if (result) {
				return result;
	  		}
		}
	}
	return null;
}

export function getAllRoutes(routes: Route, key: string) {
	const result: any[] = [];
	function traverse(obj: any[] | Route | null) {
		if (typeof obj !== 'object' || obj === null) {
			return;
		}
		if (Array.isArray(obj)) {
			obj.forEach(item => traverse(item));
		} else {
			if (obj[key]) {
				traverse(obj[key]);
			} else {
				result.push(obj);
			}
		}
	}
	traverse(routes);
	return result;
}

export type Metadata = {
	title?: string;
	description?: string;
	keywords?: string;
	[key: string]: any;
};

export const getMetadata = (routes: any, key: string = "name", value: string = "Home" ) => {
	// Validate the routes blob early to fail fast if invalid
	assertRoutes(routes);
	const foundObject = getRouteByKey(routes, key, value);
	if (foundObject) {
		const metadata: Metadata = {
			title: foundObject.title,
			description: foundObject.description,
			keywords: foundObject.keywords,
		};
		return metadata;
	} else {
		const metadata: Metadata = {
			title: "",
			description: "",
			keywords: "",
		};
		return metadata;
	}
};

export function getAccordionMenuData(myRoutes: Route) {
	const menuItems = myRoutes.map((thisRoute: Route) => (
		thisRoute.routes
			? { [thisRoute.name as string]: thisRoute.routes.map((subRoute: Route) => ({ [subRoute.name as string]: subRoute.path })) }
			: { [thisRoute.name as string]: thisRoute.path }
	)).reduce((obj: any[], item: any[]) => {
		if( typeof Object.values(item)[0] == "object") {
			// Nested Object
			const subitems = Object.values(item)[0];
			const newSubitems = subitems.reduce((obj2: any[], item2: any[]) => {
				Object.assign(obj2, item2);
				return obj2;
			});
			Object.assign(obj, { [Object.keys(item)[0]]: newSubitems } );
			return obj;
		} else {
			// String
			Object.assign(obj, item);
			return obj;
		}
	});
	return menuItems;
}

import { assertSiteInfo, assertRoutes } from '../config/config.validators';
import type { SiteInfo } from '../config/config.types';

export type GenerateMetaTagsProps = {
	title: string;
	description: string;
	keywords: string;
	origin: string;
	url: string;
	site_name?: string;
	email?: string;
	image?: string;
	image_height?: string;
	image_width?: string;
	favicon?: string;
	siteInfo?: SiteInfo;
};

export function generateMetaTags(props: GenerateMetaTagsProps) {

	const { title, description, keywords, origin, url, site_name: prop_site_name, email: prop_email, image: prop_image, image_height: prop_image_height, image_width: prop_image_width, favicon: prop_favicon, siteInfo } = props;

	const safeOrigin = typeof origin === 'string' && origin.length > 0 ? origin : '';
	const safeUrl = typeof url === 'string' && url.length > 0 ? url : '';
	let newOrigin: string | undefined;
	try {
		newOrigin = safeOrigin ? new URL(safeOrigin).hostname : undefined;
	} catch {
		newOrigin = undefined;
	}

	// Validate siteInfo strictly so downstream sites must provide the contract
	assertSiteInfo(siteInfo);

	// Use props if provided, otherwise fall back to siteInfo
	const site_name = prop_site_name || siteInfo?.name;
	const email = prop_email || siteInfo?.email;
	const image = prop_image || siteInfo?.image;
	const image_height = prop_image_height || siteInfo?.image_height;
	const image_width = prop_image_width || siteInfo?.image_width;
	const favicon = prop_favicon || siteInfo?.favicon;
	return (
		<>
			<title>{title}</title>

			<meta charSet="UTF-8" />
			<meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
			<meta httpEquiv='Expires' content='0' />
			<meta httpEquiv='Pragma' content='no-cache' />
			<meta httpEquiv='Cache-Control' content='no-cache' />

			<meta name="application-name" content={site_name} />
			<meta name="author" content={site_name + ", " + email} />
			<meta name='copyright' content={site_name} />
			<meta name="creator" content={site_name} />
			<meta name="description" content={description} />
			<meta name="keywords" content={keywords} />
			<meta name='language' content='EN' />
			<meta name='owner' content={site_name} />
			<meta name="publisher" content={site_name} />
			<meta name='rating' content='General' />
			<meta name='reply-to' content={email} />
			<meta name="robots" content="index, follow" />
			<meta name='url' content={url} />
			<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />

			<meta property="og:description" content={description} />
			<meta property='og:email' content={email} />
			<meta property="og:image" content={image} />
			<meta property="og:image:height" content={image_height != null ? String(image_height) : undefined} />
			<meta property="og:image:width" content={image_width != null ? String(image_width) : undefined} />
			<meta property="og:locale" content="en_US" />
			<meta property="og:site_name" content={site_name} />
			<meta property="og:title" content={title} />
			<meta property="og:type" content="website" />
			<meta property="og:url" content={url} />

			<meta itemProp="name" content={site_name} />
			<meta itemProp="url" content={url} />
			<meta itemProp="description" content={description} />
			<meta itemProp="thumbnailUrl" content={image} />

			<meta property="twitter:domain" content={newOrigin} />
			<meta property="twitter:url" content={url} />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:creator" content={site_name} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={image} />
			<meta name="twitter:image:height" content={image_height != null ? String(image_height) : undefined} />
			<meta name="twitter:image:width" content={image_width != null ? String(image_width) : undefined} />
			<meta name="twitter:title" content={title} />

			{/* <link rel="alternate" href={url} hrefLang="en-us" /> */}
			<link rel="author" href="humans.txt" />
			<link rel="canonical" href={url} />
			<link rel="icon" type="image/x-icon" href={favicon} />
			<link rel="shortcut icon" type="image/x-icon" href={favicon} />
			<link rel="manifest" href="/manifest.webmanifest" />

			<link rel="preconnect" href="https://images.ctfassets.net/" />
			<link rel="preconnect" href="https://res.cloudinary.com/" />
			<link rel="preconnect" href="https://farm2.static.flickr.com" />
			<link rel="preconnect" href="https://farm6.static.flickr.com" />
			<link rel="preconnect" href="https://farm8.static.flickr.com" />
			<link rel="preconnect" href="https://farm66.static.flickr.com" />

		</>
	);
}