import type { ComponentType, ReactNode } from "react";
import type { TemplateVariant } from "./page-templates";

export type ChromeVariant = "standard" | "minimal";

export interface ChromeShellProps {
  label: string;
  hero?: HeroSlot;
  nav?: NavSlot;
  footer?: FooterSlot;
  children: ReactNode;
}

export interface HeroSlot {
  headline?: string;
  copy?: string;
  cta?: string;
  image?: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface NavSlot {
  links: NavLink[];
}

export interface FooterSlot {
  text?: string;
  links?: NavLink[];
}

export interface SiteTemplateDefinition {
  name: string;
  chrome: ChromeVariant;
  label: string;
  description: string;
  defaultPageTemplate: TemplateVariant;
  chromeShell: ComponentType<ChromeShellProps>;
}
