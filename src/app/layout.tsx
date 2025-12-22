
import Nav from "./components/Nav";
import { headers } from "next/headers";
import { getRouteByKey } from "@pixelated-tech/components/server";
import { generateMetaTags } from "@pixelated-tech/components/server";
import { LocalBusinessSchema } from "@pixelated-tech/components/server";
import { VisualDesignStyles } from "@pixelated-tech/components/server";
import myRoutes from "@/app/data/routes.json";
import "@pixelated-tech/components/css/pixelated.global.css";
import "@pixelated-tech/components/css/pixelated.grid.scss";
import "./globals.css";

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
	const metadata = getRouteByKey(myRoutes.routes, "path", pathname);

  return (
    <html lang="en">
      <head>
		{ generateMetaTags({
			title: metadata?.title ?? "",
			description: metadata?.description ?? "",
			keywords: metadata?.keywords ?? "",
			origin: origin ?? "",
			url: url ?? ""
		}) }
		<LocalBusinessSchema siteInfo={myRoutes.siteInfo} />
        <VisualDesignStyles visualdesign={myRoutes.visualdesign} />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
