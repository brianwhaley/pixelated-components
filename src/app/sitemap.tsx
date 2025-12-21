export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import type { MetadataRoute } from 'next';
import { generateSitemap, type SitemapConfig, getOriginFromNextHeaders } from "@pixelated-tech/components/server";
import { getFullPixelatedConfig } from "@pixelated-tech/components/server";
import myRoutes from "@/app/data/routes.json";

const config = getFullPixelatedConfig();
const contentfulApiProps = {
	base_url: config.contentful?.base_url ?? "",
	space_id: config.contentful?.space_id ?? "",
	environment: config.contentful?.environment ?? "",
	delivery_access_token: config.contentful?.delivery_access_token ?? "",
};

export default async function SiteMapXML(): Promise<MetadataRoute.Sitemap> {
	const origin = await getOriginFromNextHeaders();
	
	const config: SitemapConfig = {
		createPageURLs: true,
		createImageURLsFromJSON: true,
		createContentfulURLs: true,
		contentful: contentfulApiProps,
		routes: myRoutes.routes,
	};
	const sitemap = await generateSitemap(config, origin);
	return sitemap;
}