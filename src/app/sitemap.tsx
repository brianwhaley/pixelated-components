
import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createPageURLs, createImageURLsFromJSON } from "@pixelated-tech/components/server";
// import { createPageURLs, createWordPressURLs, createImageURLs } from "@pixelated-tech/components";
// import type { SitemapEntry } from '@pixelated-tech/components/dist/types';
import myRoutes from "@/app/data/routes.json";

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