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
import "./site-template-minimal.css";

function MinimalChrome({ label, hero, nav, footer, children }: ChromeShellProps) {
  const heroHeadline = hero?.headline ?? label;

  return (
    <div className="chrome chrome-minimal">
      <header className="minimal-header">
        <PageTitleHeader title={label} />
      </header>
      <PageHeader headline={heroHeadline} description={hero?.copy} />
      <PageNav orientation="vertical" links={nav?.links} className="minimal-nav" />
      <PageSection className="template minimal-section" columns={1}>
        {children}
      </PageSection>
      <PageFooter className="minimal-footer" text={footer?.text} links={footer?.links} />
    </div>
  );
}

const minimalSiteTemplate: SiteTemplateDefinition = {
  name: "minimal",
  chrome: "minimal" as ChromeVariant,
  label: "Pixelated Docs",
  description: "Minimal chrome for documentation sections.",
  defaultPageTemplate: templateDefinitions.hero.variant,
  chromeShell: MinimalChrome,
};

export default minimalSiteTemplate;
