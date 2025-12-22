import type { ChromeShellProps, ChromeVariant, SiteTemplateDefinition } from "../types";
import { templateDefinitions } from "../page-templates";
import {
  PageFooter,
  PageHeader,
  PageNav,
  PageSection,
  PageTitleHeader,
} from "@pixelated-tech/components";
import "./base-styles";
import "./site-template-utility-bar.css";

function UtilityBarChrome({ label, hero, nav, footer, children }: ChromeShellProps) {
  const heroHeadline = hero?.headline ?? label;
  return (
    <div className="chrome utility-bar">
      <div className="utility-top">
        <span>Search</span>
        <span>Notifications</span>
        <span>Account</span>
      </div>
      <header className="utility-header">
        <PageTitleHeader title={label} />
        <PageNav links={nav?.links} className="utility-nav" />
      </header>
      <PageHeader eyebrow="Utility" headline={heroHeadline} description={hero?.copy} />
      <PageSection className="template utility-section" columns={1}>
        {children}
      </PageSection>
      <PageFooter className="utility-footer" text={footer?.text} links={footer?.links} />
    </div>
  );
}

const utilityBarSiteTemplate: SiteTemplateDefinition = {
  name: "utility-bar",
  chrome: "standard" as ChromeVariant,
  label: "Utility Bar",
  description: "Top navigation with a thin utility bar for search, account, and quick links.",
  defaultPageTemplate: templateDefinitions.hero.variant,
  chromeShell: UtilityBarChrome,
};

export default utilityBarSiteTemplate;
