# 🧪 Testing Documentation

This document provides comprehensive information about the testing setup, coverage, and testing strategies for the Pixelated Components library.

## Overview

**Current Status**: ✅ 2,387 tests passing across 79 test files

| Metric | Value |
|--------|-------|
| Test Files | 79 |
| Total Tests | 2,387 |
| Coverage (Statements) | 77.13% |
| Coverage (Lines) | 79.73% |
| Coverage (Functions) | 77.98% |
| Coverage (Branches) | 67.55% |
| Test Framework | Vitest 4.x |
| Testing Library | @testing-library/react + jsdom |

## Quick Start

```bash
npm run test              # Watch mode
npm run test:ui          # Interactive UI dashboard
npm run test:coverage    # Generate coverage reports
npm run test:run         # Single run (for CI)
```

## Component Coverage

**Component Coverage Summary**

### Component Coverage (Sorted by Statement Coverage)
- **site-health-cache.ts**: 100% statements *(new shared caching utility)*
- **sites.integration.ts**: 100% statements *(new site management functions)*
- **site-health-indicators.ts**: 100% statements
- **tiles.tsx**: 100% statements
- **google.reviews.functions.ts**: 100% statements
- **accordion.tsx**: 100% statements
- **modal.tsx**: 100% statements
- **tab.tsx**: 100% statements
- **ComponentPropertiesForm.tsx**: 100% statements
- **ComponentSelector.tsx**: 100% statements
- **ComponentTree.tsx**: 100% statements
- **formvalidations.tsx**: 100% statements
- **googlesearch.tsx**: 100% statements
- **schema-localbusiness.tsx**: 100% statements
- **schema-recipe.tsx**: 100% statements
- **schema-services.tsx**: 100% statements
- **faq-accordion.tsx**: 100% statements
- **schema-website.tsx**: 100% statements
- **schema-blogposting.tsx**: 100% statements
- **buzzwordbingo.tsx**: 100% statements
- **markdown.tsx**: 100% statements
- **timeline.tsx**: 100% statements
- **config.client.tsx**: 100% statements
- **sidepanel.tsx**: 97.5% statements
- **config.ts**: 96.55% statements
- **google.reviews.components.tsx**: 95.83% statements
- **schema-blogposting.tsx**: 95.24% statements
- **recipe.tsx**: 94.59% statements
- **resume.tsx**: 94.38% statements
- **contentful.delivery.ts**: 92.5% statements
- **css.tsx**: 91.43% statements
- **functions.ts**: 90.91% statements
- **menu-expando.tsx**: 90.12% statements
- **site-health-cloudwatch.tsx**: 88% statements
- **loading.tsx**: 85.71% statements
- **SaveLoadSection.tsx**: 84.85% statements
- **table.tsx**: 84.48% statements
- **ConfigBuilder.tsx**: 83.52% statements
- **cloudinary.ts**: 83.33% statements
- **formcomponents.tsx**: 83.33% statements
- **form.tsx**: 83.2% statements
- **shoppingcart.functions.ts**: 81.7% statements
- **callout.tsx**: 80% statements
- **microinteractions.tsx**: 80% statements
- **smartimage.tsx**: 82.75% statements
- **sitemap.ts**: 76.06% statements
- **manifest.tsx**: 75% statements
- **carousel.tsx**: 71.7% statements
- **nerdjoke.tsx**: 69.44% statements
- **menu-accordion.tsx**: 68.47% statements
- **semantic.tsx**: 63.51% statements
- **componentMap.tsx**: 60% statements
- **propTypeIntrospection.tsx**: 60% statements
- **wordpress.functions.ts**: 51.43% statements
- **config.server.tsx**: 50% statements
- **PageEngine.tsx**: 48% statements
- **componentGeneration.tsx**: 38.89% statements
- **socialcard.tsx**: 29.51% statements
- **PageBuilderUI.tsx**: 26.67% statements

## Testing Next Steps

### Integration Testing Gaps
- [ ] **Cross-component interactions** - Test how components work together (e.g., forms with validation, carousels with loading states)
- [ ] **Form validation edge cases** - Test URL validation, required fields, and complex validation rules under various conditions
- [ ] **CMS API integrations** - Test API failures, rate limiting, authentication errors, and network timeouts
- [ ] **Responsive design breakpoints** - Test component behavior across different screen sizes and device types
- [ ] **Accessibility (a11y) compliance** - Test keyboard navigation, screen reader compatibility, and ARIA attributes

## Test Configuration

**Coverage Targets** (configured in `vitest.config.ts`):
- **Statements**: 70% threshold
- **Lines**: 70% threshold
- **Functions**: 70% threshold
- **Branches**: 60% threshold

**Coverage Thresholds in vitest.config.ts**:
- Lines: 70% threshold
- Functions: 70% threshold
- Branches: 60% threshold
- Statements: 70% threshold

**Test Environment**: jsdom with @testing-library/react  
**Test Pattern**: Data-focused validation + behavioral testing

## Tools & Dependencies

| Tool | Purpose |
|------|---------|
| Vitest 4.x | Test runner |
| @testing-library/react | Component testing utilities |
| jsdom | DOM environment for tests |
| v8 | Coverage reporting |

---

See the [main README](../README.md) for general project information and contribution guidelines.