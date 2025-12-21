export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import type { MetadataRoute } from 'next';
import { generateSitemap, type SitemapConfig, getOriginFromNextHeaders } from "@pixelated-tech/components/server";
import myRoutes from "@/app/data/routes.json";

export default async function SiteMapXML(): Promise<MetadataRoute.Sitemap> {
	const origin = await getOriginFromNextHeaders();
	const config: SitemapConfig = {
		createPageURLs: true,
		createImageURLsFromJSON: true,
		createWordPressURLs: true,
		routes: myRoutes.routes,
	};
	const sitemap = await generateSitemap(config, origin);
	return sitemap;
}