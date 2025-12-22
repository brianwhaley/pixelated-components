import { templateDefinitions, TemplateSlots, TemplateVariant } from "@/components/sitebuilder/page-templates";
import siteConfigData from "@/data/site-config.json";
import { siteTemplates } from "@/components/sitebuilder";
import type { HeroSlot, NavSlot, FooterSlot } from "./types";

export interface PageAssignment {
  template: TemplateVariant;
  label: string;
  slots?: Partial<TemplateSlots>;
}

interface SiteThemeColors {
  primaryColor?: string;
  secondaryColor?: string;
  accent1Color?: string;
  accent2Color?: string;
  bgColor?: string;
  textColor?: string;
}

interface SiteThemeFonts {
  headerFont?: string;
  bodyFont?: string;
}

interface SiteTheme {
  colors?: SiteThemeColors;
  fonts?: SiteThemeFonts;
}

interface SiteConfigSchema {
  siteTemplate: string;
  contentSlots?: {
    hero?: HeroSlot;
    nav?: NavSlot;
    footer?: FooterSlot;
  };
  theme?: SiteTheme;
  pages: Record<string, PageAssignment>;
}

const siteConfig: SiteConfigSchema = siteConfigData as SiteConfigSchema;

const defaultTheme: SiteTheme = {
  colors: {
    primaryColor: "#369",
    secondaryColor: "#BCD",
    accent1Color: "#CCC",
    accent2Color: "#EEE",
    bgColor: "#fff",
    textColor: "#000",
  },
  fonts: {
    headerFont: "\"Montserrat\", Verdana, sans-serif",
    bodyFont: "\"Roboto\", Arial, sans-serif",
  },
};

function mergeTheme(base: SiteTheme, override?: SiteTheme): SiteTheme {
  if (!override) {
    return base;
  }
  return {
    colors: {
      ...base.colors,
      ...override.colors,
    },
    fonts: {
      ...base.fonts,
      ...override.fonts,
    },
  };
}

const siteTheme: SiteTheme = mergeTheme(defaultTheme, siteConfig.theme);

export function buildThemeCssVars(theme: SiteTheme): Record<string, string> {
  const cssVars: Record<string, string> = {};
  const { colors, fonts } = theme;
  if (colors?.primaryColor) cssVars["--primary-color"] = colors.primaryColor;
  if (colors?.secondaryColor) cssVars["--secondary-color"] = colors.secondaryColor;
  if (colors?.accent1Color) cssVars["--accent1-color"] = colors.accent1Color;
  if (colors?.accent2Color) cssVars["--accent2-color"] = colors.accent2Color;
  if (colors?.bgColor) cssVars["--bg-color"] = colors.bgColor;
  if (colors?.textColor) cssVars["--text-color"] = colors.textColor;
  if (fonts?.headerFont) cssVars["--header-font"] = fonts.headerFont;
  if (fonts?.bodyFont) cssVars["--body-font"] = fonts.bodyFont;
  return cssVars;
}

export const siteThemeStyles = buildThemeCssVars(siteTheme);

export const siteTemplateCatalog = siteTemplates;
export const activeSiteTemplateName: string = siteConfig.siteTemplate;
export const activeSiteTemplate =
  siteTemplateCatalog[activeSiteTemplateName] ?? siteTemplateCatalog.default;
export const contentSlots = siteConfig.contentSlots;
export const siteHero = siteConfig.contentSlots?.hero;
export const siteNav = siteConfig.contentSlots?.nav;
export const siteFooter = siteConfig.contentSlots?.footer;

export interface ResolvedPageAssignment extends PageAssignment {
  defaultSlots: TemplateSlots;
}

export function resolvePageAssignment(pathname: string): ResolvedPageAssignment {
  const assignment = siteConfig.pages[pathname] ?? siteConfig.pages["/"];
  const definition = templateDefinitions[assignment.template];
  return {
    ...assignment,
    defaultSlots: definition.defaultSlots,
  };
}
