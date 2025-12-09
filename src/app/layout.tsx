import { headers } from "next/headers";
import { getRouteByKey } from "@pixelated-tech/components/server";
import { generateMetaTags } from "@pixelated-tech/components/server";
import { PixelatedServerConfigProvider } from "@pixelated-tech/components/server";
import LayoutClient from "./elements/layout-client";
import Header from "./elements/header";
import Hero from "./elements/hero";
import Nav from "./elements/nav";
import Search from './elements/search';
import Footer from './elements/footer';
import myRoutes from "@/app/data/routes.json";
import "@pixelated-tech/components/css/pixelated.global.css";
import "@pixelated-tech/components/css/pixelated.grid.scss";
// LOAD THIS AS LAST CSS FILE
import "./globals.css";

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
	
	const reqHeaders: Headers = await (headers() as Promise<Headers>);
	const path = reqHeaders.get("x-path") ?? "/";
	const origin = reqHeaders.get("x-origin");
	const url = reqHeaders.get("x-url") ?? `${origin}${path}`;
	const pathname = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
	const metadata = getRouteByKey(myRoutes.routes, "path", pathname);

	return (
		<html lang="en">
			<LayoutClient />
			<head>
				{ generateMetaTags({
					title: metadata?.title ?? "",
					description: metadata?.description ?? "",
					keywords: metadata?.keywords ?? "",
					site_name: "Brian Whaley",
					email: "brian.whaley@gmail.com",
					origin: origin ?? "",
					url: url ?? "",
					image: "/images/pix/pix-bg-bw-big.gif",
					image_height: "512",
					image_width: "512",
					favicon: "/images/favicon.ico"
				}) }
				<meta name="google-site-verification" content="t2yy9wL1bXPiPQjBqDee2BTgpiGQjwVldlfa4X5CQkU" />
				<meta name="google-site-verification" content="l7D0Y_JsgtACBKNCeFAXPe-UWqo13fPTUCWhkmHStZ4" />
			</head>
			<body>
				<PixelatedServerConfigProvider>
					<header>
						<div id="page-header" className="fixed-header"><Header /></div>
						<div id="fixed-header-spacer"></div>
						{ ( pathname === '/' ) ? <div><Hero /></div> : null }
						<div id="page-search" className="no-mobile"><Search id="009500278966481927899:bcssp73qony" /></div>
					</header>
					<nav>
						<Nav />
					</nav>
					<main>
						{children}
					</main>
					<footer>
						<Footer />
					</footer>
				</PixelatedServerConfigProvider>
			</body>
		</html>
	);
}
