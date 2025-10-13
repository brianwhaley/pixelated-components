
import { getAllRoutes, getAllImages } from "../metadata/pixelated.metadata";
import type { SitemapEntry } from "@brianwhaley/pixelated-components";
// import myRoutes from "../../data/routes.json";

/* 
TODO #10 Sitemap Component : Build out v1 of this component
*/



/* 
type SitemapEntry = {
	url: string;
	lastModified: string;
	changeFrequency: "hourly";
	priority: number;
};
*/


/* 
function getOrigin() {
	return window.location.origin;
}
*/


/* 
import { headers } from 'next/headers';
async function getOrigin(): Promise<string> {
	const headerList = await headers();
	const protocol = headerList.get('x-forwarded-proto') || 'http';
	const host = headerList.get('host') || 'localhost:3000';
	return `${protocol}://${host}`;
}
*/



export async function createPageURLs(myRoutes: { path: string }[], origin: string) {
	const sitemap: SitemapEntry[] = [];
	// const origin = await getOrigin();
	const allRoutes = getAllRoutes(myRoutes, "routes");
	for ( const route of allRoutes ){
		sitemap.push({
			url: `${origin}${route.path}` ,
			lastModified: (new Date()).toISOString(),
			changeFrequency: "hourly" as const,
			priority: 1.0,
		});			
	}
	return sitemap;
}



export async function createImageURLs(origin: string){
	const sitemap = [];
	// const origin = await getOrigin();
	const images = getAllImages();
	const newImages = images.map((image)=>{return (`${origin}${image}`);});
	sitemap.push({
		url: `${origin}/images`, // Provide a valid URL for the images
		images: newImages,
	});
	return sitemap;
}



const blogPostSite = "pixelatedviews.wordpress.com";
const blogPostPath = "/posts?number=100";
const blogPostsURL = "https://public-api.wordpress.com/rest/v1/sites/" + blogPostSite + blogPostPath ; 
export async function getWordPressItems(){
	const posts = [];
  		let page = 1;
  		let totalPages = 1;  // Initialize to 1 for the first request
  		while (page <= totalPages) {
    		try {
      			const response = await fetch(`${blogPostsURL}&page=${page}`);				
			const data = await response.json();
			// Check for total pages on the first page
			if (page === 1) {
				totalPages = Math.ceil(data.found / 100); // Assuming 100 posts per page
			}
			posts.push(...data.posts);
			page++; // Increment gets next page or breaks the while loop
		} catch (error) {
			console.error("Error fetching posts:", error);
			return;
		}
	}
	return posts; // Return the complete list of posts
}

export async function createWordPressURLs(){
	const sitemap: SitemapEntry[] = [];
	const blogPosts = await getWordPressItems();
	for await (const post of blogPosts ?? []) {
		sitemap.push({
			url: post.URL ,
			lastModified: post.modified,
			changeFrequency: "hourly" as const,
			priority: 1.0,
		});
	}
	return sitemap;
}


/* 
const defaultEbayProps = {
	proxyURL: "https://proxy.pixelated.tech/prod/proxy?url=",
	baseTokenURL: 'https://api.ebay.com/identity/v1/oauth2/token',
	tokenScope: 'https://api.ebay.com/oauth/api_scope',
	baseSearchURL : 'https://api.ebay.com/buy/browse/v1/item_summary/search',
	qsSearchURL: '?q=sunglasses&fieldgroups=full&category_ids=79720&aspect_filter=categoryId:79720&filter=sellers:{pixelatedtech}&sort=newlyListed&limit=200',
	baseItemURL: 'https://api.ebay.com/buy/browse/v1/item',
	qsItemURL: '/v1|295959752403|0?fieldgroups=PRODUCT,ADDITIONAL_SELLER_DETAILS',
	appId: 'BrianWha-Pixelate-PRD-1fb4458de-1a8431fe', // clientId
	appCertId: 'PRD-fb4458deef01-0d54-496a-b572-a04b', // clientSecret
	sbxAppId: 'BrianWha-Pixelate-SBX-ad482b6ae-8cb8fead', // Sandbox
	sbxAppCertId: '',
	globalId: 'EBAY-US',
};
export async function createEbayItemURLs(origin: string){
	const sitemap: SitemapEntry[] = [];
	await getEbayAppToken({apiProps: defaultEbayProps})
		.then(async (response: any) => {
			await getEbayItemsSearch({ apiProps: defaultEbayProps, token: response })
				.then( (items: any) => {
					for (const item of items.itemSummaries) {
						sitemap.push({
							url: `${origin}/store/${item.legacyItemId}` ,
							lastModified: item.itemCreationDate,
							changeFrequency: "hourly" as const,
							priority: 1.0,
						});
					}
				});
		});
	return sitemap;
}
*/



/* export async function createContentfulURLs(origin: string){
	const sitemap: SitemapEntry[] = [];
	// const origin = await getOrigin();
	const contentType = "carouselCard"; 
	const contentfulHeaders = await getContentfulCardTitles(contentType);
	for ( const header of contentfulHeaders ){
		sitemap.push({
			url: `${origin}/projects/${encodeURIComponent(header)}` ,
			lastModified: (new Date()).toISOString(),
			changeFrequency: "hourly" as const,
			priority: 1.0,
		});			
	}
	return sitemap;
} */



export function jsonToSitemapEntries(entries: SitemapEntry[]){
	return entries.map(
		(entry: SitemapEntry) => 
			`<url>
				<loc>${entry.url}</loc>
				<lastmod>${entry.lastModified}</lastmod>
				<changefreq>${entry.changeFrequency}</changefreq>
				<priority>${entry.priority}</priority>
			</url>`
	).join('');
}



/* 
import React, { useEffect, useState } from 'react';
export function SitemapXML(props: any) {
	const [ sitemap , setSitemap ] = useState<SitemapEntry[]>([]);
	const origin = getOrigin();
	useEffect(() => {
		async function makeSitemap() {
			const sitemap = [];
			const pageUrls = await createPageURLs(props.routes);
			sitemap.push(...pageUrls);
			// const imageUrls = await createImageURLs();
			// sitemap.push(...imageUrls);
			// const wpUrls = await createWordPressURLs();
			// sitemap.push(...wpUrls);
			// const contentfulUrls = await createContentfulURLs();
			// sitemap.push(...contentfulUrls);
			console.log(sitemap);
			setSitemap(sitemap);
		}
		makeSitemap();
	}, []);
	return (
		`<?xml version="1.0" encoding="UTF-8"?>
		<?xml-stylesheet type="text/xsl" href=${origin}${props.xsl}?>
		<urlset 
			xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
			xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
		>
			${ jsonToSitemapEntries(sitemap) }
		</urlset>`
	);
}
*/
