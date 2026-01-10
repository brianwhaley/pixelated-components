
import Nav from "./components/Nav";
import { Providers } from "./components/providers";
import LayoutClient from "./components/layout-client";
import { headers } from "next/headers";
import { getRouteByKey } from "@pixelated-tech/components/server";
import { generateMetaTags } from "@pixelated-tech/components/server";
import type { SiteInfo } from "@pixelated-tech/components/server";
import { WebsiteSchema, LocalBusinessSchema, ServicesSchema } from "@pixelated-tech/components/server";
import { VisualDesignStyles, PixelatedServerConfigProvider } from "@pixelated-tech/components/server";
import myRoutes from "@/app/data/routes.json";
import "@pixelated-tech/components/css/pixelated.global.css";
import "@pixelated-tech/components/css/pixelated.grid.scss";
import "./globals.css";
import { redirect } from "next/navigation";
import { authOptions } from "./lib/auth";
import { getServerSession } from "next-auth";

export default async function RootLayout({
	children,
}: Readonly<{
  children: React.ReactNode;
}>) {

	const reqHeaders = await headers();
	const path = reqHeaders.get("x-path") ?? "/";
	const origin = reqHeaders.get("x-origin");
	const url = reqHeaders.get("x-url") ?? `${origin}${path}`;
	const pathname = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
	const metadata = getRouteByKey(myRoutes.routes, "path", pathname);

	// Check if running on localhost
	const hostname = reqHeaders.get("host")?.split(':')[0];
	const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

	// Restrict new deployment page to localhost only
	if (pathname === '/newdeployment' && !isLocalhost) {
		// Check if user is authenticated
		let session;
		try {
			session = await getServerSession(authOptions);
		} catch (error) {
			console.error('Session check failed:', error);
			session = null;
		}
		
		// If authenticated, redirect to home; if not, redirect to login
		if (session) {
			redirect('/');
		} else {
			redirect('/login');
		}
	}

	// Check authentication for all routes (except login page)
	if (pathname !== '/login') {
		let session;
		try {
			session = await getServerSession(authOptions);
		} catch (error) {
			console.error('Session check failed:', error);
			session = null;
		}
		if (!session) {
			redirect('/login');
		}
	}

	// Coerce siteInfo to the components package SiteInfo type
	const siteInfo = myRoutes.siteInfo as SiteInfo;

	return (
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
				<WebsiteSchema siteInfo={siteInfo} />
				<LocalBusinessSchema siteInfo={siteInfo} />
				<ServicesSchema siteInfo={siteInfo} />
				<VisualDesignStyles visualdesign={myRoutes.visualdesign} />
			</head>
			<body>
				<PixelatedServerConfigProvider>
					<Providers>
						<LayoutClient />
						<Nav />
						{children}
					</Providers>
				</PixelatedServerConfigProvider>
			</body>
		</html>
	);
}
