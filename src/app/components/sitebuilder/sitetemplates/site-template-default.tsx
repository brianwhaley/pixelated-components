import type { ChromeShellProps, SiteTemplateDefinition, ChromeVariant } from "../types";
import {
  PageFooter,
  PageHeader,
  PageNav,
  PageSection,
  PageTitleHeader,
} from "@pixelated-tech/components";
import "./base-styles";
import "./site-template-default.css";

function DefaultChrome({ label, hero, nav, footer, children }: ChromeShellProps) {
  const heroHeadline = hero?.headline ?? label;
  const heroCopy = hero?.copy;
  return (
    <div className="chrome chrome-standard">
      <PageHeader
        eyebrow="Pixelated Layout Lab"
        headline={heroHeadline}
        description={heroCopy}
      />
      <PageNav links={nav?.links} className="standard-nav" />
      <PageSection className="template standard-section" columns={1}>
        <PageTitleHeader title={label} />
        {children}
      </PageSection>
      <PageFooter text={footer?.text} links={footer?.links} />
    </div>
  );
}

const defaultSiteTemplate: SiteTemplateDefinition = {
  name: "default",
  chrome: "standard" as ChromeVariant,
  label: "Pixelated Template Studio",
  description: "Header, nav, and footer chrome for marketing sites.",
  defaultPageTemplate: "hero",
  chromeShell: DefaultChrome,
};

export default defaultSiteTemplate;
