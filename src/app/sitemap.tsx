
import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createPageURLs, createEbayItemURLs, createWordPressURLs, createImageURLs } from "@/app/components/sitemap/pixelated.sitemap";
// import { createPageURLs, createWordPressURLs, createImageURLs } from "@brianwhaley/pixelated-components";
// import type { SitemapEntry } from '@brianwhaley/pixelated-components/dist/types';
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
		...(await createEbayItemURLs(origin)),
		...(await createWordPressURLs()),
		...(await createImageURLs(origin)),
	];
	return sitemap;
}