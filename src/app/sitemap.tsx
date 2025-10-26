
import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { createPageURLs, createWordPressURLs, createImageURLs } from "@brianwhaley/pixelated-components/server";
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
	type Route = { path?: string; routes?: Route[] };
	const flattenRoutes = (routes: Route[]): { path: string }[] =>
		routes.flatMap(route =>
			route.path
				? [{ path: route.path }] : route.routes
					? flattenRoutes(route.routes) : []
		);

	const sitemap = [
		...(await createPageURLs(flattenRoutes(myRoutes.routes), origin)),
		...(await createWordPressURLs()),
		...(await createImageURLs(origin)),
	];
	return sitemap;
}