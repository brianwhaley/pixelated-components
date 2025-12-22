import type { ChromeShellProps, ChromeVariant, SiteTemplateDefinition } from "../types";
import { templateDefinitions } from "../page-templates";
import {
  PageFooter,
  PageHeader,
  PageNav,
  PageSection,
  PageTitleHeader,
  PageGridItem,
} from "@pixelated-tech/components";
import "./base-styles";
import "./site-template-magazine-grid.css";

function MagazineGridChrome({ label, hero, nav, footer, children }: ChromeShellProps) {
  const heroHeadline = hero?.headline ?? label;
  return (
    <div className="chrome magazine-grid-chrome">
      <PageHeader eyebrow="Editorial" headline={heroHeadline} description={hero?.copy} />
      <PageNav links={nav?.links} className="magazine-nav" />
      <PageSection className="magazine-layout" columns={6} gap="2rem">
        <PageGridItem columnSpan={4}>
          <section className="magazine-main">
            <PageTitleHeader title={label} />
            {children}
          </section>
        </PageGridItem>
        <PageGridItem columnSpan={2}>
          <aside className="magazine-sidebar">
            <h3>Featured Stories</h3>
            <ul>
              <li>Market insights</li>
              <li>Product spotlights</li>
              <li>Creator notes</li>
            </ul>
            <div className="magazine-cta">
              <p>Stay inspired</p>
              <button type="button">Subscribe</button>
            </div>
          </aside>
        </PageGridItem>
      </PageSection>
      <PageFooter className="magazine-footer" text={footer?.text} links={footer?.links} />
    </div>
  );
}

const magazineGridSiteTemplate: SiteTemplateDefinition = {
  name: "magazine-grid",
  chrome: "standard" as ChromeVariant,
  label: "Magazine Grid",
  description: "Editorial chrome with alternating accent blocks and a sticky CTA column.",
  defaultPageTemplate: templateDefinitions.grid.variant,
  chromeShell: MagazineGridChrome,
};

export default magazineGridSiteTemplate;
