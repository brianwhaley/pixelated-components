/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Route } from "@brianwhaley/pixelated-components";


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


import fs from 'fs';
import path from 'path';

/* interface ImageInfo {
    loc: string;
    title?: string,
    caption?: string;
    license?: string,
    geo_location?: string,
} */

export function getAllImages() {
	// const imagePaths: ImageInfo[] = [];
	const imagePaths: string[] = [];
	const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp']; 
	const publicDir = './public';
	
	function walk (currentDir: string) {
		fs.readdirSync(currentDir).forEach(file => {
			const filePath = path.join(currentDir, file);
			const fileStat = fs.statSync(filePath);
			if (fileStat.isDirectory()) {
				walk(filePath); // Recursive call for subdirectories
			} else {
				if (fs.statSync(filePath).isFile() && (imageExtensions.some(ext => file.endsWith(ext))) ) {
					// Found an image!
					// const imageURL = `/${filePath.replace('./public/', '')}`; // Construct URL
					// Add to your image data list (e.g., { url: imageURL, alt: "description" })
					const relativePath = path.relative(publicDir, filePath).replace(/\\/g, '/');
					const fullPath = `/${relativePath}`;
					// imagePaths.push({loc: fullPath});
					imagePaths.push(fullPath);
				}
			}
		});
	};
	walk(publicDir);
	// return JSON.stringify(imagePaths);
	return imagePaths;
}
/* 
<image:image>
    <image:loc>https://example.com/images/sample.jpg</image:loc>
    <image:title>Example Image</image:title>
    <image:caption>This is an example image.</image:caption>
    <image:geo_location>New York City</image:geo_location>
    <image:license></image:license>
</image:image>
https://developers.google.com/search/blog/2022/05/spring-cleaning-sitemap-extensions
*/



export type Metadata = {
	title?: string;
	description?: string;
	keywords?: string;
	[key: string]: any;
};

export const getMetadata = (routes: any, key: string = "name", value: string = "Home" ) => {
	// const allRoutes = getAllRoutes(routes, "routes");
	// const foundObject = allRoutes.find((obj: { [x: string]: string; }) => obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key as keyof typeof obj] === value);
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


export const setClientMetadata = ({title, description, keywords}: {title: string, description: string, keywords: string}) => {
	const titleElem = document.querySelector('title');
	if (titleElem) {
		titleElem.innerText = title;
	}
	const metaDesc = document.querySelector("meta[name='description']");
	if (metaDesc) {
		metaDesc.setAttribute('content', description);
	}
	const metaKeywords = document.querySelector("meta[name='keywords']");
	if (metaKeywords) {
		metaKeywords.setAttribute('content', keywords);
	}
};

export const setServerMetadata = ({key, value}: { key: string; value: string }) => {
	const myMetaData = getMetadata({key, value});
	return {
		title: myMetaData.title,
		description: myMetaData.description,
		keywords: myMetaData.keywords
	};
};


export function getAccordionMenuData(myRoutes: Route) {
	/* const menuItems = myRoutes.map((thisRoute) => (
		{ [thisRoute.name]: thisRoute.path } 
	)).reduce((obj, item) => {
		Object.assign(obj, item);
		return obj; 
	}); */
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
