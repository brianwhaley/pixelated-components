import type { ComponentType, ReactNode } from "react";

export type TemplateVariant = "hero" | "grid";
export type TemplateSlots = {
  heroHeadline?: string;
  heroCopy?: string;
  heroCta?: string;
  features?: string[];
  gridItems?: string[];
};

export interface TemplateDefinition {
  variant: TemplateVariant;
  label: string;
  defaultSlots: TemplateSlots;
}

export const templateDefinitions: Record<TemplateVariant, TemplateDefinition> = {
  hero: {
    variant: "hero",
    label: "Hero Template",
    defaultSlots: {
      heroHeadline: "Shine Online with Pixelated",
      heroCopy:
        "Launch a new marketing page in minutes by choosing a template, filling in your story, and publishing without touching layout code.",
      heroCta: "Start a project",
      features: [
        "Config-driven chrome selection",
        "Composable page templates",
        "Rapid iteration with layout.tsx",
      ],
    },
  },
  grid: {
    variant: "grid",
    label: "Grid Template",
    defaultSlots: {
      heroHeadline: "Showcase multiple stories",
      heroCopy: "Let each card breathe with its own layout while the chrome stays consistent.",
      heroCta: "See gallery",
      gridItems: ["Services", "Case Studies", "Testimonials", "Resources"],
    },
  },
};

interface TemplateRendererProps {
  variant: TemplateVariant;
  slots: TemplateSlots;
  children: ReactNode;
}

type TemplateComponentProps = Omit<TemplateRendererProps, "variant">;

const templateRegistry: Record<TemplateVariant, ComponentType<TemplateComponentProps>> = {
  hero: HeroTemplate,
  grid: GridTemplate,
};

export function TemplateRenderer({ variant, slots, children }: TemplateRendererProps) {
  const Component = templateRegistry[variant] ?? DefaultTemplate;
  return (
    <Component slots={slots}>
      {children}
    </Component>
  );
}

function HeroTemplate({ slots, children }: TemplateComponentProps) {
  return (
    <section className="template template-hero">
      <div className="hero-content">
        <p className="eyebrow">Configurable Template</p>
        <h1>{slots.heroHeadline ?? "A quick hero section"}</h1>
        <p>{slots.heroCopy ?? "Describe the value proposition for this page."}</p>
        <button type="button">{slots.heroCta ?? "Try it"}</button>
        {slots.features && (
          <ul className="feature-list">
            {slots.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="hero-children">{children}</div>
    </section>
  );
}

function GridTemplate({ slots, children }: TemplateComponentProps) {
  return (
    <section className="template template-grid">
      <div className="grid-hero">
        <h2>{slots.heroHeadline ?? "Grid template"}</h2>
        <p>{slots.heroCopy ?? "Use this template for multi-card layouts."}</p>
        <button type="button">{slots.heroCta ?? "Explore"}</button>
      </div>
      <div className="grid-items">
        {(slots.gridItems ?? []).map((item) => (
          <article key={item}>
            <h3>{item}</h3>
            <p>Describe the {item} card and keep it reusable.</p>
          </article>
        ))}
      </div>
      <div className="grid-children">{children}</div>
    </section>
  );
}

function DefaultTemplate({ slots, children }: TemplateComponentProps) {
  return (
    <section className="template template-default">
      <h2>{slots.heroHeadline ?? "Default"}</h2>
      <p>Fallback template description.</p>
      <div>{children}</div>
    </section>
  );
}
