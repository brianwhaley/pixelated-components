import { headers } from "next/headers";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { TemplateRenderer } from "@/components/sitebuilder/page-templates";
import { activeSiteTemplate, resolvePageAssignment, siteHero, siteNav, siteFooter, siteThemeStyles } from "@/components/sitebuilder/site-config";
import "./sitetemplates/site-template-globals.css";

export const metadata: Metadata = {
  title: "Pixelated Template MVP",
  description: "Demonstration of configuration-driven chrome and page templates.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-nextjs-pathname") ?? "/";
  const pageAssignment = resolvePageAssignment(pathname);
  const mergedSlots = {
    ...pageAssignment.defaultSlots,
    ...(pageAssignment.slots ?? {}),
  };
  const ChromeShell = activeSiteTemplate.chromeShell;

  const themeStyles = siteThemeStyles as CSSProperties;
  return (
    <html lang="en">
      <body style={themeStyles}>
        <ChromeShell label={activeSiteTemplate.label} hero={siteHero} nav={siteNav} footer={siteFooter}>
          <TemplateRenderer
            variant={pageAssignment.template}
            slots={mergedSlots}
          >
            {children}
          </TemplateRenderer>
        </ChromeShell>
      </body>
    </html>
  );
}
