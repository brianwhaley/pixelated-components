# 🚀 Pixelated Components Roadmap

This document outlines planned improvements and refactoring initiatives for the Pixelated Components library.

## Original Roadmap Items

### New Components
- [ ] **IN PROGRESS** - Testimonial Block (Nextdoor/Yelp/Google): ingest review feeds + render carousel/grid.
- [ ] **ON HOLD** LinkedIn Recommendations Integration (Not possible with current LinkedIn API)
- [ ] **ON HOLD** eBay Feedback Integration - requires user OAuth login
- [ ] **ON HOLD** Yelp Recommendations integration (Cost Prohibitive)
- [ ] Instagram Image Integration for Carousels
- [ ] Hero Banner: headline, subtext, CTA, background image/video, overlay.
- [ ] Map Based Project Component
- [ ] New Callout Variant based on https://onthespothome.com/services

### Component Improvements
- [ ] Implement minimal `createContentfulImageURLs` with single `/images` sitemap entry.
- [ ] Review Contentful helper functions for per-page mapping capability.
- [ ] Implement `createContentfulImageURLs` per-page mapping with `contentType` & `pageField` config.
- [ ] Align typography to `--font-sizeN` clamp variables.
- [ ] Provide Cloudinary transforms presets for image components.
- [ ] find a better solution than to generate image via build script in amplify for json for sitemap creation
- [ ] **SocialCards Component**: Fix state initialization to track prop changes properly.
- [ ] **Modal Component**: Clarify content source pattern (accepts both `modalContent` and `children`).
- [ ] **Carousel Component**: Fix active card state reset when `props.cards` changes.
- [ ] **NerdJoke Component**: Add props to useEffect dependencies if endpoint becomes configurable.
- [ ] **GoogleReviews Component**: Add carousel/grid display modes.
- [ ] **GoogleReviews Component**: Add API key to config provider instead of hardcoding.
- [ ] **Instagram Component**: Add accessToken and userId to config provider for centralized API credentials.
- [ ] **Critters Integration**: Explore adding critters CSS inlining tool for improved page load performance and critical CSS optimization.
- [ ] **SplitScroll Enhancement**: Improve scrolling behavior and image transitions to match [safariportal lookbook style](https://itineraries.safariportal.app/Mary-Ann-Sarao/1589988388230923612?type=lookbook) (smoother layering and focal point transitions).

### Platform Enhancements
- [ ] **Project Scaffolding CLI**: Interactive CLI tool that generates complete Next.js projects with pixelated-components pre-configured, including routes.json, layout.tsx, package.json, and basic page structure
- [ ] **Technical Site Assets**: Implement standard `src/app/loading.tsx` (Skeleton loaders), `src/app/global-error.tsx` (Branded error boundaries), `public/humans.txt`, and `public/.well-known/security.txt` in the starter template.
- [ ] **Static Search Index**: Build-time script to generate `search-index.json` from `routes.json` for serverless, instant client-side search.
- [ ] **AI-Driven Image & Meta Pipeline**: Integrate AI Vision APIs into `generate-site-images.js` to automatically generate alt text, SEO descriptions, and image captions.
- [ ] **Template Marketplace**: Pre-built industry-specific templates (restaurant, law firm, contractor, etc.) that users can clone and customize
- [ ] **Configuration Wizard**: Step-by-step setup wizard that collects business info, generates site configuration, and creates initial content structure
- [ ] **Content Migration Tools**: Automated importers for WordPress, Squarespace, Wix, and other platforms to migrate content to pixelated sites
- [ ] **Automated Security Scanner**: Regular security audits with vulnerability detection and automated fixes
- [ ] **GDPR Compliance Toolkit**: Automated cookie consent, data mapping, and privacy policy generation
- [ ] **API Gateway**: Unified API management for connecting to CRM, email marketing, payment processors, and other business tools
- [ ] **Webhook Automation**: Event-driven automation for form submissions, new content, user registrations, and business workflows
- [ ] **Documentation Auto-Generator**: Automatically generated API docs, component usage guides, and deployment instructions
- [ ] **Standardized Component Interface**: Create consistent component interfaces with `BaseComponentProps` and `InteractiveComponentProps` extending patterns.
- [ ] **Unified Configuration System**: Create centralized configuration with `ConfigContext.tsx`, `ConfigProvider.tsx`, `useConfig.ts` hook, and service-specific config modules.
- [ ] **Type-Safe Configuration**: Implement strict TypeScript interfaces with runtime validation for configuration objects.
- [ ] **CMS API Client**: Create standardized CMS API clients (`ContentfulClient.ts`, `WordPressClient.ts`) with base `ApiClient.ts` for consistent error handling.

### CI / CD Improvements
- [ ] Add CI workflow to run tests and lints on pull requests.
- [ ] **Transition to a Turborepo Monorepo**: Move all sites and components into a unified workspace with `pnpm` and `Turborepo` for instant builds and shared task orchestration.

## Admin Feature Enhancements

### High Priority Refactoring (Development Speed Focus)
- [ ] **API Client Abstraction**: Create centralized `ApiClient` class with consistent error handling, caching, and retry logic to eliminate repeated fetch/error patterns across components.
- [ ] **SEO Integration Modularization**: Split 1, 193-line monolithic file into focused modules: `page-analyzer.ts`, `site-crawler.ts`, `header-analyzer.ts`, and `metric-scorers.ts`.
- [ ] **Component Memoization**: Add `React.memo` and `useMemo` to reduce unnecessary re-renders by 30-50% in large components.

### Medium Priority Improvements
- [ IP ] **Standardized Component Architecture**: Establish consistent patterns for component props interfaces, error/loading state management, event handling, and styling approaches.
- [ IP ] **Shared Type Definitions**: Create centralized type definitions in `src/types/` directory to eliminate duplicated interfaces across components.
- [ ] **Bundle Optimization**: Implement dynamic imports and tree shaking optimizations to reduce large bundle sizes and enable code splitting.

## Contributing to Roadmap

This roadmap is a living document. To contribute:

1. Open an issue with the `enhancement` label
2. Propose changes via pull request
3. Discuss priorities in the project's discussions

See the [main README](../README.md) for contribution guidelines.

### Forms — Honeypot (MVP) ✅
- [x] Add `FormHoneypot` component (id=`winnie`, default name=`website`, inline off-screen styling, `aria-hidden`, `tabIndex=-1`, `autocomplete=off`) — MVP implemented.
- [ ] Add unit & integration tests covering client render + server-side early-return (emailFormData/emailJSON) — in progress.
- [ ] Future: configurable global honeypot name, timing/token checks, optional telemetry for spam signal analysis.

</content>
<parameter name="filePath">/Users/btwhaley/Git/pixelated-components/README.roadmap.md
