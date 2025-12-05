export const runtime = 'nodejs';

import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
// import { getFullPixelatedConfig } from "@brianwhaley/pixelated-components/server";
import { createPageURLs, createImageURLsFromJSON } from "@brianwhaley/pixelated-components/server";
// , createContentfulAssetURLs

import myRoutes from "@/app/data/routes.json";

/* const contentfulApiProps = {
	base_url: "https://cdn.contentful.com",
	space_id: "0b82pebh837v",
	environment: "master",
	delivery_access_token: "lA5uOeG6iPbrJ2J_R-ntwUdKQesrBNqrHi-qX52Bzh4",
}; */

// const config = getFullPixelatedConfig();

async function getOrigin(): Promise<string> {
	const headerList = await headers();
	const protocol = headerList.get('x-forwarded-proto') || 'http';
	const host = headerList.get('host') || 'localhost:3000';
	return `${protocol}://${host}`;
}

export default async function SiteMapXML(): Promise<MetadataRoute.Sitemap> {
	const origin = await getOrigin();
	const sitemap = [
		...(await createPageURLs(myRoutes.routes, origin)),
		...(await createImageURLsFromJSON(origin)),
	];
	return sitemap;
}