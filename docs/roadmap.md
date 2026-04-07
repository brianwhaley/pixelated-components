# 🚀 Pixelated Components Roadmap

This document outlines planned improvements and refactoring initiatives for the Pixelated Components library.

## Original Roadmap Items

### New Components
- [ ] **IN PROGRESS** - Testimonial Block (Nextdoor/Yelp/Google): ingest review feeds + render carousel/grid.
- [ ] **ON HOLD** LinkedIn Recommendations Integration (Not possible with current LinkedIn API)
- [ ] **ON HOLD** eBay Feedback Integration - requires user OAuth login
- [ ] **ON HOLD** Yelp Recommendations integration (Cost Prohibitive)
- [ ] Instagram Image Integration for Carousels
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
- [ ] **FormHoneypot**: Future - configurable global honeypot name, timing/token checks, optional telemetry for spam signal analysis.


### Platform Enhancements
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


### WORKSPACE Enhancements

- [  ] **Convert to a monorepo/workspaces setup** - Use npm workspaces, pnpm workspaces, or Yarn workspaces. Define root-level package.json with workspaces for:  packages/pixelated-components, apps/pixelvivid, apps/pixelated-admin etc. Replace manual copy2... scripts with workspace dependency linking: @pixelated-tech/components can be a workspace package.

- [  ] **Share common Next.js config** Create a shared next.config.shared.ts or package export and import it from each app. Common config to extract: transpilePackages, typescript.ignoreBuildErrors, env settings, images.remotePatterns, outputFileTracingIncludes, any identical turbopack/webpack boilerplate

- [  ] **Share base TypeScript & ESLint config** - Introduce root/base configs: tsconfig.base.json, .eslintrc.base.cjs or .eslintrc.json.  Have apps extend the shared base instead of duplicating config.  This reduces per-app config drift and improves consistency across builds.

- [  ] **Standardize app scripts** - Move repeated script definitions into shared tooling if possible. Example: config:encrypt, config:decrypt, generate-site-images, update. With workspaces, apps can run shared scripts from the component package without repeating them.

- [  ] **Simplify build targets** - If the apps are all using the same @pixelated-tech/components package, consider: prebuilding pixelated-components once, then building apps. This is faster than rebuilding or copying component outputs for every app independently.


### Shopping Cart Enhancements

#### SCALING BLOCKERS

##### Single Payment Provider
1. Only PayPal integration
1. No abstraction layer for payment processors
1. Hard to add Stripe, Square, or other gateways

##### Zero Backend Integration
1. All cart/shipping data stored in browser localStorage only
1. No server-side persistence or session management
1. Order data sent via simple emailJSON call — no real order processing system
1. No inventory management or stock tracking
1. No order history or customer accounts

##### No Multi-Tenancy Support
1. Shipping options are generic USPS rates (hardcoded array) not configurable per site
1. Discount codes loaded from single Contentful space
1. No site-specific pricing, tax rates, or shipping rules

##### Limited Tax & Shipping
1. No real tax calculation engine
1. Shipping costs are static (hardcoded USPS rates)
1. No integration with real carrier APIs (no live rate shopping)

##### No User/Order Management
1. All purchases anonymous — no customer accounts or authentication
1. No order tracking or history
1. No abandoned cart recovery
1. No customer communication workflows

##### Weak Form Handling
1. Form submission uses direct DOM manipulation (document.getElementById)
1. Shipping form fields must match exact names in localStorage
1. No client-side validation exposed to cart
1. No retry logic if form save fails

#### RECOMMENDATIONS FOR SCALE

##### Architecture Redesign

1. Create Payment Abstraction Layer

	* Interface-based payment gateway system
	* Support PayPal, Stripe, Square simultaneously
	* Route selection based on site config

1. Implement Backend Order Service

	* REST API for cart operations (add/remove/update)
	* Persistent order storage with customer reference
	* Real-time inventory management
	* Order status tracking (pending → confirmed → shipped → delivered)

1. Multi-Tenant Configuration

	* Config-driven payment providers, shipping rules, tax rates
	* Per-site discount code repositories

1. Session & Persistence

	* User authentication (optional: anonymous sessions with tracking)
	* Cart recovery across browser sessions
	* Order history and tracking
	* Wishlist support

##### Feature Additions

1. Real Carrier Integration

	* Live shipping rate calculation (EasyPost, ShipStation)
	* Tracking integration
	* Multi-carrier selection UI

1. Tax Engine

	* Integrate TaxJar or similar
	* Support multiple jurisdictions
	* Real-time tax calculation during checkout
	* Compliance reporting

1. Analytics & Monitoring

	* Cart abandonment tracking
	* Conversion funnels
	* Error logging
	* Payment gateway reconciliation

1. Advanced Checkout

	* Guest + registered checkout flows
	* Saved payment methods
	* Address book
	* Order notes/special requests
	* Coupon/loyalty point support

##### Code Improvements

1. Refactor State Management

	* Move from localStorage → Context API + Redux/Zustand
	* Tie to backend API calls
	* Proper error handling and retries
	* Loading states and optimistic updates

1. Type Safety & Testing

	* Expand TypeScript coverage (remove @ts-nocheck)
	* Decouple from localStorage for unit testing
	* Integration tests with mock payment gateways
	* E2E checkout flow tests

1. Component Isolation

	* Extract payment UI into separate component
	* Form builder for dynamic checkout fields
	* Separate concerns: cart display → shipping form → payment → thanks
	* Make each composable and reusable

1. Security

	* PCI compliance (never handle raw card data)
	* Tokenization for saved payments
	* CSRF protection
	* Rate limiting on checkout API
	* Webhook signature verification

##### Configuration

1. Site Configuration Schema

	store:
	name: "Site Name"
	currency: "USD"
	tax:
		provider: "taxjar"
		apiKey: "..."
	shipping:
		provider: "easypost"
		methods: [STANDARD, EXPRESS]
	payments:
		providers: [paypal, stripe]
		default: stripe

1. Environment Variables

	* Support secrets rotation
	* Feature flags for payment methods per site



### CI / CD Improvements
- [ ] Add CI workflow to run tests and lints on pull requests.
- [ ] **Transition to a Turborepo Monorepo**: Move all sites and components into a unified workspace with `pnpm` and `Turborepo` for instant builds and shared task orchestration.

## Admin Feature Enhancements

### High Priority Refactoring (Development Speed Focus)
- [ ] **API Client Abstraction**: Create centralized `ApiClient` class with consistent error handling, caching, and retry logic to eliminate repeated fetch/error patterns across components.
- [ ] **SEO Integration Modularization**: Split 1, 193-line monolithic file into focused modules: `page-analyzer.ts`, `site-crawler.ts`, `header-analyzer.ts`, and `metric-scorers.ts`.
- [ ] **Component Memoization**: Add `React.memo` and `useMemo` to reduce unnecessary re-renders by 30-50% in large components.
- [ ] **Remove unused `formutils.generateFieldJSON`** (short-term)
  - Owner: @pixelated-tech/ui
  - Rationale: duplicate implementation; currently unused in-repo and exported unintentionally which caused bundler export collisions during Storybook builds.
  - Plan: stop exporting (done), keep implementation as deprecated alias for one minor release, provide codemod + remove in next major.
  - Acceptance: no downstream import failures; Storybook and package builds succeed.

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

</content>
<parameter name="filePath">/Users/btwhaley/Git/pixelated-components/README.roadmap.md
