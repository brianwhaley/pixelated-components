 

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



export const getMetadata = (routes: any, key: string = "name", value: string = "Home" ) => {
	// const allRoutes = getAllRoutes(routes, "routes");
	// const foundObject = allRoutes.find((obj: { [x: string]: string; }) => obj && Object.prototype.hasOwnProperty.call(obj, key) && obj[key as keyof typeof obj] === value);
	const foundObject = getRouteByKey(routes, key, value);
	if (foundObject) {
		return {
			title: foundObject.title,
			description: foundObject.description,
			keywords: foundObject.keywords,
		};
	} else {
		return {
			title: "",
			description: "",
			keywords: "",
		} ;
	}
};


export const setClientMetadata = ({title, description, keywords}: {title: string, description: string, keywords: string}) => {
	document.title = title;
	(document.querySelector("meta[property='og:title']"))?.setAttribute('content', title);
	(document.querySelector("meta[name='description']"))?.setAttribute('content', description);
	(document.querySelector("meta[property='og:description']"))?.setAttribute('content', description);
	(document.querySelector("meta[itemprop='description']"))?.setAttribute('content', description);
	(document.querySelector("meta[name='keywords']"))?.setAttribute('content', keywords);
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
