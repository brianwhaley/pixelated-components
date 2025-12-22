import registry from "./registry.json";
import defaultSiteTemplate from "./sitetemplates/site-template-default";
import minimalSiteTemplate from "./sitetemplates/site-template-minimal";
import heroSidebarSiteTemplate from "./sitetemplates/site-template-hero-sidebar";
import utilityBarSiteTemplate from "./sitetemplates/site-template-utility-bar";
import magazineGridSiteTemplate from "./sitetemplates/site-template-magazine-grid";
import drawerFloatingSiteTemplate from "./sitetemplates/site-template-drawer-floating";
import type { SiteTemplateDefinition } from "./types";

export const siteTemplateRegistry = registry;
export const siteTemplates: Record<string, SiteTemplateDefinition> = {
  default: defaultSiteTemplate,
  minimal: minimalSiteTemplate,
  "hero-sidebar": heroSidebarSiteTemplate,
  "utility-bar": utilityBarSiteTemplate,
  "magazine-grid": magazineGridSiteTemplate,
  "drawer-floating": drawerFloatingSiteTemplate,
};
