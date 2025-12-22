/* eslint-disable @next/next/no-page-custom-font */
import { headers } from 'next/headers';
import { getRouteByKey } from '@pixelated-tech/components/server';
import { generateMetaTags } from "@pixelated-tech/components/server";
import { LocalBusinessSchema } from '@pixelated-tech/components/server';
import { PixelatedServerConfigProvider } from '@pixelated-tech/components/server';
import { VisualDesignStyles } from '@pixelated-tech/components/server';
import LayoutClient from '@/app/elements/layout-client';
import Header from '@/app/elements/header';
import Nav from '@/app/elements/nav';
import Footer from '@/app/elements/footer';
import UnderConstruction from './elements/underconstruction';
import myRoutes from "@/app/data/routes.json";
import "@pixelated-tech/components/css/pixelated.global.css";
import "@pixelated-tech/components/css/pixelated.grid.scss";
import './globals.css';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

	if (process.env.UNDER_CONSTRUCTION === 'true') {
		return <UnderConstruction />;
	}

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
					site_name: "Oaktree Landscaping",
					email: "oaktreelandscaper@gmail.com",
					origin: origin ?? "",
					url: url ?? "",
					image: "/images/pix/pix-bg-512.gif",
					image_height: "512",
					image_width: "512",
					favicon: "/images/favicon.ico"
				}) }
				<LocalBusinessSchema
					name="Oaktree Landscaping"
					streetAddress=""
					addressLocality="Bluffton"
					addressRegion="SC"
					postalCode="29909"
					addressCountry="US"
					telephone="+1-843-707-6481"
					url="https://oaktreelandscaping.com"
					email="oaktreelandscaper@gmail.com"
					image="/images/logo/oaktree-logo-vertical.jpg"
					priceRange="$"
					description="Professional landscaping and outdoor design services for residential and commercial properties."
					sameAs={[
						"https://www.facebook.com/oaktreelandscaping",
						"https://www.instagram.com/oaktreelandscaping"
					]}
				/>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" />
			</head>
			<body>
				<VisualDesignStyles visualdesign={myRoutes.visualdesign} />
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
