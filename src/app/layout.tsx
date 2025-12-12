import { headers } from "next/headers";
import { getRouteByKey } from "@pixelated-tech/components/server";
import { generateMetaTags } from "@pixelated-tech/components/server";
import { LocalBusinessSchema } from "@pixelated-tech/components";
import { PixelatedServerConfigProvider } from "@pixelated-tech/components/server";
import { LayoutClient } from "./elements/layoutclient";
import Header from "@/app/elements/header";
import Footer from "@/app/elements/footer";
import myRoutes from "@/app/data/routes.json";
import "@pixelated-tech/components/css/pixelated.global.css";
import "@pixelated-tech/components/css/pixelated.grid.scss";
import "@pixelated-tech/components/css/pixelated.font.scss";
import "@/app/globals.css";

export default async function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
	
	const reqHeaders: Headers = await (headers() as Promise<Headers>);
	const path = reqHeaders.get("x-path") ?? "/";
	const origin = reqHeaders.get("x-origin");
	const url = reqHeaders.get("x-url") ?? `${origin}${path}`;
	const pathname = path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
	const metadata = getRouteByKey(myRoutes.routes, "path", pathname);

	return (
		<>
			<LayoutClient />
			<html lang="en">
				<head>
					{ generateMetaTags({
						title: metadata?.title ?? "",
						description: metadata?.description ?? "",
						keywords: metadata?.keywords ?? "",
						site_name: "Palmetto Epoxy",
						email: "palmettoepoxy@gmail.com",
						origin: origin ?? "",
						url: url ?? "",
						image: "/images/palmetto-epoxy-logo.jpg",
						image_height: "1375",
						image_width: "851",
						favicon: "/images/favicon.ico"
					}) }
					<LocalBusinessSchema
						name="Palmetto Epoxy"
						streetAddress="116 Beckenridge Cir"
						addressLocality="Bluffton"
						addressRegion="SC"
						postalCode="29909"
						addressCountry="US"
						telephone="+1-516-510-8186"
						url="https://palmetto-epoxy.com"
						email="palmettoepoxy@gmail.com"
						image="/images/palmetto-epoxy-logo.jpg"
						priceRange="$"
						description="Professional epoxy flooring and coating services for residential and commercial properties in South Carolina."
						sameAs={[
							"https://www.facebook.com/palmettoepoxy",
							"https://www.instagram.com/palmettoepoxy",
							"https://x.com/palmetto_epoxy",
							"https://www.youtube.com/@PalmettoEpoxy",
							"https://www.yelp.com/biz/palmetto-epoxy-bluffton",
							"https://www.reddit.com/user/palmettoepoxy/",
							"https://nextdoor.com/pages/palmetto-epoxy-bluffton-sc/",
							"https://www.houzz.com/hznb/professionals/flooring-contractors/palmetto-epoxy-pfvwus-pf~1171449525",
							"https://www.votedlowcountrysbest.com/listing/palmetto-epoxy.html",
							"https://bni-sclowcountry.com/en-US/memberdetails?encryptedMemberId=nF5nozAX3%2BzPl0hTaNt4zQ%3D%3D"
						]}
					/>
					<link rel="preload" fetchPriority="high" as="image" type="image/webp" 
						href="https://www.palmetto-epoxy.com/images/palmetto-epoxy-logo.jpg" ></link>
				</head>
				<body>
					<PixelatedServerConfigProvider>
						<header><Header /></header>
						<main>{children}</main>
						<footer><Footer /></footer>
					</PixelatedServerConfigProvider>
				</body>
			</html>
		</>
	);
}
