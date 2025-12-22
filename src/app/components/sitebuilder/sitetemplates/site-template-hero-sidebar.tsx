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
import "./site-template-hero-sidebar.css";

function HeroSidebarChrome({ label, hero, nav, footer, children }: ChromeShellProps) {
  return (
    <div className="chrome hero-sidebar">
      <aside className="hero-sidebar-aside">
        <p className="eyebrow">Utility</p>
        <h3>Quick actions</h3>
        <ul>
          <li>Create project</li>
          <li>Share board</li>
          <li>Export deck</li>
        </ul>
        <PageNav orientation="vertical" links={nav?.links} className="hero-sidebar-nav" />
      </aside>
      <div className="hero-sidebar-main">
        <div className="hero-sidebar-header">
          <p className="eyebrow">Split layout</p>
          <PageTitleHeader title={label} />
        </div>
        <PageHeader
          eyebrow="Hero Slot"
          headline={hero?.headline ?? label}
          description={hero?.copy}
          ctaLabel={hero?.cta}
        />
        <PageSection className="template hero-sidebar-content" columns={1}>
          {children}
        </PageSection>
        <PageFooter className="hero-sidebar-footer" text={footer?.text} links={footer?.links} />
      </div>
    </div>
  );
}

const heroSidebarSiteTemplate: SiteTemplateDefinition = {
  name: "hero-sidebar",
  chrome: "standard" as ChromeVariant,
  label: "Hero with Sidebar",
  description: "Large hero with a utility sidebar for quick actions or stats.",
  defaultPageTemplate: templateDefinitions.hero.variant,
  chromeShell: HeroSidebarChrome,
};

export default heroSidebarSiteTemplate;
