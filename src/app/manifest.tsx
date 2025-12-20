
import { Manifest, SiteInfo } from "@pixelated-tech/components/server";
import myRoutes from "@/app/data/routes.json";

export default function manifest() {
	return Manifest({ siteInfo: myRoutes.siteInfo as SiteInfo });
}