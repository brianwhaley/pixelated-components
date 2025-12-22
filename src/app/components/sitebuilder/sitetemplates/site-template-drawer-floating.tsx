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
import "./site-template-drawer-floating.css";

function DrawerFloatingChrome({ label, hero, nav, footer, children }: ChromeShellProps) {
  const heroHeadline = hero?.headline ?? label;
  return (
    <div className="chrome drawer-floating">
      <nav className="drawer-panel">
        <PageTitleHeader title="Launchboard" />
        <ul>
          <li>Overview</li>
          <li>Workflows</li>
          <li>Insights</li>
        </ul>
      </nav>
      <div className="drawer-content">
        <header>
          <p className="eyebrow">High-touch navigation</p>
          <PageTitleHeader title={label} />
        </header>
        <PageHeader headline={heroHeadline} description={hero?.copy} ctaLabel={hero?.cta} />
        <PageSection className="template drawer-section" columns={1}>
          {children}
        </PageSection>
        <PageNav links={nav?.links} className="drawer-nav" orientation="vertical" />
        <PageFooter className="drawer-footer" text={footer?.text} links={footer?.links} />
        <button type="button" className="floating-cta">Launch Template</button>
      </div>
    </div>
  );
}

const drawerFloatingSiteTemplate: SiteTemplateDefinition = {
  name: "drawer-floating",
  chrome: "standard" as ChromeVariant,
  label: "Drawer + CTA",
  description: "Expandable drawer navigation with a floating CTA for high-touch actions.",
  defaultPageTemplate: templateDefinitions.hero.variant,
  chromeShell: DrawerFloatingChrome,
};

export default drawerFloatingSiteTemplate;
