/* eslint-disable @next/next/no-page-custom-font */
import { headers } from 'next/headers';
import { getRouteByKey } from '@brianwhaley/pixelated-components/server';
import { PixelatedServerConfigProvider } from '@brianwhaley/pixelated-components/server';
import LayoutClient from '@/app/elements/layout-client';
import Header from '@/app/elements/header';
import Nav from '@/app/elements/nav';
import Footer from '@/app/elements/footer';
import myRoutes from "@/app/data/routes.json";
import "@brianwhaley/pixelated-components/css/pixelated.global.css";
import "@brianwhaley/pixelated-components/css/pixelated.grid.scss";
import "@brianwhaley/pixelated-components/css/pixelated.font.scss";
import './globals.css';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

	const reqHeaders: Headers = await (headers() as Promise<Headers>);
	const path = reqHeaders.get("x-path") ?? "/";
	const origin = reqHeaders.get("x-origin");
	const url = reqHeaders.get("x-url") ?? `${origin}${path}`;
	const pathname = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
	const meta = getRouteByKey(myRoutes.routes, "path", pathname);

  return (
    <html lang="en">
			<LayoutClient />
			<head>
				<title>{meta?.title}</title>
				<meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
				<meta name="description" content={meta?.description} />
				<meta name="keywords" content={meta?.keywords} />
				<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no" />
				<meta property="og:site_name" content="Oaktree Landscaping" />
				<meta property="og:title" content={meta?.title} />
				<meta property="og:url" content={url} />
				<meta property="og:type" content="website" />
				<meta property="og:description" content={meta?.description} />
				<meta property="og:image" content="" />
				<meta property="og:image:width" content="512" />
				<meta property="og:image:height" content="512" />
				<meta itemProp="name" content="Oaktree Landscaping" />
				<meta itemProp="url" content={url} />
				<meta itemProp="description" content={meta?.description} />
				<meta itemProp="thumbnailUrl" content="" />
				<link rel="canonical" href={url} />
				{ /*  <link rel="alternate" href={url} hrefLang="en-us" /> */ }
				<link rel="icon" type="image/x-icon" href="/images/favicon.ico" />
				<link rel="shortcut icon" type="image/x-icon" href="/images/favicon.ico" />
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="preconnect" href="https://images.ctfassets.net/" />
				<link rel="preconnect" href="https://res.cloudinary.com/" />
				<link rel="preconnect" href="https://farm2.static.flickr.com" />
				<link rel="preconnect" href="https://farm6.static.flickr.com" />
				<link rel="preconnect" href="https://farm8.static.flickr.com" />
				<link rel="preconnect" href="https://farm66.static.flickr.com" />

				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" />
			</head>
			<body>
				<PixelatedServerConfigProvider>
					<header>
						<Header />
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
