
import { headers } from "next/headers";
import { getRouteByKey, SiteInfo } from "@pixelated-tech/components/server";
import { generateMetaTags } from "@pixelated-tech/components/server";
import { WebsiteSchema, LocalBusinessSchema, ServicesSchema } from "@pixelated-tech/components/server";
import { VisualDesignStyles } from "@pixelated-tech/components/server";
import LayoutClient from "@/app/elements/layoutclient";
import Header from "@/app/elements/header";
import Nav from "@/app/elements/nav";
import Footer from '@/app/elements/footer';
import myRoutes from "@/app/data/routes.json";
import "@pixelated-tech/components/css/pixelated.global.css";
import "@pixelated-tech/components/css/pixelated.grid.scss";
import "./globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	
	const reqHeaders: Headers = await (headers() as Promise<Headers>);
	const path = reqHeaders.get("x-path") ?? "/";
	const origin = reqHeaders.get("x-origin");
	const url = reqHeaders.get("x-url") ?? `${origin}${path}`;
	const pathname = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
	const metadata = getRouteByKey(myRoutes.routes, "path", pathname);

	const siteInfo = myRoutes.siteInfo;

	return (
		<>
			<LayoutClient />
			<html lang="en">
				<head>
					{ generateMetaTags({
						title: metadata?.title ?? "",
						description: metadata?.description ?? "",
						keywords: metadata?.keywords ?? "",
						origin: origin ?? "",
						url: url ?? "",
						siteInfo: siteInfo
					}) }
					<WebsiteSchema siteInfo={siteInfo as SiteInfo} />
					<LocalBusinessSchema siteInfo={siteInfo} />
					<ServicesSchema siteInfo={siteInfo} />
					<VisualDesignStyles visualdesign={myRoutes.visualdesign} />
				</head>
				<body>
					<header><Header /></header>
					<nav><Nav /></nav>
					<main>{children}</main>
					<footer><Footer /></footer>
				</body>
			</html>
		</>
	);
}
