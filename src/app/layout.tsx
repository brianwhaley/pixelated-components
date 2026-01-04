
import Nav from "./components/Nav";
import { Providers } from "./components/providers";
import { headers } from "next/headers";
import { getRouteByKey } from "@pixelated-tech/components/server";
import { generateMetaTags } from "@pixelated-tech/components/server";
import { LocalBusinessSchema } from "@pixelated-tech/components/server";
import { VisualDesignStyles } from "@pixelated-tech/components/server";
import myRoutes from "@/app/data/routes.json";
import "@pixelated-tech/components/css/pixelated.global.css";
import "@pixelated-tech/components/css/pixelated.grid.scss";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

	const reqHeaders: Headers = await (headers() as Promise<Headers>);
	const path = reqHeaders.get("x-path") ?? "/";
	const origin = reqHeaders.get("x-origin");
	const url = reqHeaders.get("x-url") ?? `${origin}${path}`;
	const pathname = path.split('?')[0]; // Strip query parameters
	const pathnameOnly = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
	const metadata = getRouteByKey(myRoutes.routes, "path", pathnameOnly);

	const host = reqHeaders.get("host") ?? "";
	const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
	const isAllowedDomain = isLocalhost || host.includes('pixelated.tech'); // Replace with actual domain
	const session = await getServerSession(authOptions);
	const isLoginPage = pathnameOnly === '/login';
	if (!session && !isLoginPage) {
		redirect(`/login?callbackUrl=${encodeURIComponent(pathnameOnly)}`);
	}
	if (pathnameOnly === '/newdeployment' && !isAllowedDomain) {
		redirect('/');
	}

  return (
    <html lang="en">
      <head>
		{ generateMetaTags({
			title: metadata?.title ?? "",
			description: metadata?.description ?? "",
			keywords: metadata?.keywords ?? "",
			origin: origin ?? "",
			url: url ?? "",
			siteInfo: myRoutes.siteInfo
		}) }
		<LocalBusinessSchema siteInfo={myRoutes.siteInfo} />
        <VisualDesignStyles visualdesign={myRoutes.visualdesign} />
      </head>
      <body>
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
