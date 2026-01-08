## AI Agent Communication Guidelines

### When to Answer vs. When to Code
**Answer questions directly** - Do not write code unless specifically asked to implement something. Users ask questions to get information, not code implementations.

**Common Question Patterns:**
- "How does X work?" → Explain the concept, don't rewrite the code
- "What does Y do?" → Describe functionality, don't create new implementations  
- "Why is Z structured this way?" → Explain architectural decisions, don't refactor
- "Can you show me..." → Provide code snippets only when demonstrating existing patterns
- "Help me understand..." → Give clear explanations, not code solutions

**When Code Implementation IS Appropriate:**
- "Create a new component for..."
- "Implement feature X"
- "Fix this bug in..."
- "Add functionality to..."
- "Build a solution for..."

**Response Patterns:**
- For questions about existing code: Reference specific files/lines, explain logic flows
- For questions about architecture: Describe patterns, cite examples from codebase
- For questions about processes: Walk through workflows, explain rationale
- For questions about problems: Analyze issues, suggest approaches, but don't implement unless asked

### Question-Answering Priority
1. **Direct Answers First** - Provide the requested information immediately
2. **Contextual Examples** - Reference existing code when relevant
3. **Actionable Next Steps** - Suggest what to do, but don't do it unless instructed
4. **Code Only When Asked** - Wait for explicit implementation requests

## Project Overview
Pixelated Components is a comprehensive React component library built for Next.js applications, specializing in CMS integrations, UI components, SEO optimization, and accessibility-first design. The library provides production-ready components for building modern web applications with integrations for Contentful, WordPress, Cloudinary, and other services.

## Related Projects

### Pixelated Admin
A Next.js application for managing Pixelated CMS sites with AI-powered content optimization:
- **AI Integration**: Google Gemini API for intelligent SEO recommendations
- **Dynamic Forms**: ConfigBuilder with JSON schema-driven form generation
- **Modal UI**: User-friendly recommendation acceptance with individual checkboxes
- **Authentication**: NextAuth.js with Google and Apple OAuth providers

### Development Workflow Across Projects
- **Shared Standards**: All projects follow the coding conventions in /docs/coding-conventions.md
- **Component Reuse**: Build new features using existing components from this library
- **Iterative Development**: Small iterations with regular linting, testing, building, and Storybook validation
- **Cross-Project Consistency**: Maintain consistent patterns and standards across all Pixelated projects

## Coding Conventions & Standards

**📋 Important**: This project follows specific coding conventions documented in /docs/coding-conventions.md. Please review these standards before implementing new features.

### Key Standards to Follow:
- **PropTypes & TypeScript**: Use `PropTypes` with `InferProps<typeof Component.propTypes>` for type safety
- **API Services**: Create thin service classes in `utilities/` directory with proper error handling
- **Component Structure**: Functional components with hooks, named exports, kebab-case file names
- **File Organization**: Group related components, co-locate CSS, use index files for clean imports
- **Error Handling**: Try/catch blocks, typed error responses, graceful degradation

### Before implementing:
1. Check existing patterns in the codebase
2. Follow the established conventions
3. Add appropriate TypeScript types and PropTypes
4. Include comprehensive error handling
5. Update documentation

## Architecture & Key Concepts

### Component Organization
- **General Components**: Reusable UI primitives (Accordion, Modal, Table, etc.)
- **CMS Integration**: Headless CMS components (Contentful, WordPress, Flickr, Instagram)
- **Site Builder**: Dynamic configuration and page building tools (ConfigBuilder, PageBuilderUI)
- **SEO & Schema**: Structured data and search optimization components
- **Third-Party Integrations**: Calendly, HubSpot, PayPal, eBay, etc.

### Configuration System
Components rely on a centralized config system:
- Server-side: `getFullPixelatedConfig()` reads from `src/app/config/pixelated.config.json` and uses `PIXELATED_CONFIG_KEY` for decryption.
- Client-side: `getClientOnlyPixelatedConfig()` strips secrets (tokens, keys, passwords)
- Config types defined in `config.types.ts` for integrations like Contentful, Cloudinary, HubSpot

### Component Patterns
- Use `'use client'` directive for client-side components
- Combine PropTypes with `InferProps<typeof Component.propTypes>` for TypeScript types
- Accessibility-first: Prefer native elements (`<details>` for accordions), include ARIA labels
- CSS co-located with components or in separate `.css` files
- Export all components from `src/index.js` using named exports

## Development Workflows

### Custom Build Process (Component Library)
Unlike web applications, this component library uses a specialized build pipeline designed for npm package distribution:

```bash
npm run build  # Multi-step process:
               # 1. validate-exports: Ensures all exports in index.js are valid
               # 2. buildClean: Removes dist/ directory
               # 3. tsc: TypeScript compilation to dist/types/
               # 4. rsync: Copies CSS/SCSS files from src/ to dist/
               # 5. tscClean: Removes temporary .tsbuildinfo files
```

**Key Differences from App Builds:**
- **ESM Output**: Produces ES modules for tree-shaking, not bundled JS
- **Type Declarations**: Generates `.d.ts` files for TypeScript consumers
- **Asset Copying**: Manually syncs CSS/SCSS files (no bundling)
- **Dual Exports**: Separate client/server exports in package.json
- **Validation**: Pre-build export validation prevents broken releases

**Alternative Build:**
```bash
npm run build-webpack  # Webpack-based build for complex scenarios
```

### Testing Tools & Coverage
Comprehensive testing setup with Vitest and strict coverage requirements:

```bash
npm run test           # Watch mode with hot reload
npm run test:ui        # Interactive dashboard at http://localhost:51204
npm run test:coverage  # Generates coverage reports (text, json, html, lcov)
npm run test:run       # Single run for CI pipelines
```

**Testing Configuration (`vitest.config.ts`):**
- **Environment**: jsdom for DOM simulation
- **Coverage Provider**: v8 for accurate metrics
- **Coverage Thresholds**: 
  - Statements: 70%
  - Lines: 70% 
  - Functions: 70%
  - Branches: 60%
- **Test Discovery**: `src/**/*.{test,spec}.{ts,tsx}`
- **Exclusions**: Stories, node_modules, dist, coverage reports
- **Setup File**: `src/tests/setup.ts` for global test configuration

**Testing Library Stack:**
- `@testing-library/react` for component testing
- `@testing-library/user-event` for user interaction simulation
- `@testing-library/dom` for DOM assertions
- `jsdom` environment for browser API mocking

### Linting with ESLint
Strict code quality enforcement with comprehensive ESLint configuration:

```bash
npm run lint  # Auto-fix enabled, runs on all source files
```

**ESLint Configuration (`eslint.config.mjs`):**
- **Parser**: TypeScript parser with project-aware type checking
- **Plugins**: 
  - `@typescript-eslint`: TypeScript-specific rules
  - `eslint-plugin-react`: React best practices
  - `eslint-plugin-import`: Import/export validation
  - `eslint-plugin-jsx-a11y`: Accessibility linting
- **Key Rules**:
  - Tab indentation, semicolons required
  - React recommended rules + accessibility checks
  - TypeScript strict rules (except `no-explicit-any` disabled)
- **File Patterns**: `**/*.{js,jsx,ts,tsx}` (excludes stories, dist, node_modules)
- **Globals**: Browser + Node.js environments available

### Storybook Development Environment
Interactive component development and documentation platform:

```bash
npm run storybook      # Starts dev server at http://localhost:6006
npm run buildStorybook # Produces static build for deployment
```

**Storybook Configuration (`.storybook/main.js`):**
- **Framework**: React with Webpack 5 builder
- **Stories**: Auto-discovers `../src/**/*.stories.@(js|jsx|mjs|ts|tsx)`
- **Addons**: SCSS preset for styling
- **Static Assets**: Serves from `../src` directory
- **Webpack Integration**: Custom rules for TypeScript, Babel, SCSS
- **Features**: Experimental React Server Components support

**Story File Pattern:**
```tsx
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { /* props */ },
};
```

### Documentation Structure
Comprehensive documentation across multiple README files:

**Main README.md:**
- Project overview and architecture
- Installation and setup instructions
- Component categories and descriptions
- Usage examples and quick start guide
- Contributing guidelines and license
- Testing status and coverage metrics
- Roadmap and feature backlog

**README.COMPONENTS.md (Component Reference):**
- Detailed API documentation for all components
- Props interfaces and TypeScript types
- Usage examples with code samples
- Integration patterns and best practices
- Accessibility features and compliance notes
- Cross-references to related components

**Documentation Workflow:**
- Keep API examples in README.COMPONENTS.md
- Update main README.md for architectural changes
- Reference pixelated-admin as working implementation
- Include coverage metrics and testing status in main README

### Local Development
- Copy built components to local projects: `npm run copy2[project]` (e.g., `copy2pixelated`)
- Reference implementation: [pixelated-admin](https://github.com/brianwhaley/pixelated-admin)

## Key Files & Directories

### Core Structure
- `src/components/` - All component implementations
- `src/index.js` - Main export file (add new components here)
- `src/data/` - JSON forms and default configs (routes.json, siteinfo-form.json)
- `dist/` - Built output (ESM modules + assets)

### Configuration Examples
- `src/components/config/config.ts` - Config loading logic
- `src/components/config/config.types.ts` - TypeScript interfaces for all integrations
- `src/components/sitebuilder/config/ConfigBuilder.tsx` - Visual config builder

### Component Examples
- `src/components/general/accordion.tsx` - Simple component with accessibility
- `src/components/cms/contentful.delivery.ts` - CMS integration pattern
- `src/components/sitebuilder/page/PageEngine.tsx` - Complex page rendering

## Integration Patterns

### CMS Components
- Accept config via props or context
- Handle API errors gracefully
- Use proxy URLs for client-side API calls (defined in config)

### Form Components
- Use FormEngine for dynamic form rendering
- Validation via formvalidator and formfieldvalidations
- Email sending through formemailer

### Image Components
- SmartImage component handles Cloudinary transforms
- Support for lazy loading and optimization
- Fallback to standard img tags

## Code Style & Conventions

### TypeScript
- Strict typing with interfaces for component props
- Use `paths: { "@/*": ["./src/*"] }` for imports
- Target ESNext with moduleResolution: "node"

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility with proper ARIA
- Focus management and semantic HTML

### Error Handling
- Graceful degradation when config is missing
- Console warnings for missing required props
- Fallback UI states for loading/errors

## Common Patterns

### Config-Dependent Components
```tsx
import { useConfig } from '../config/config.client';

function MyComponent() {
  const config = useConfig();
  if (!config?.contentful) return <div>Contentful not configured</div>;
  // ... component logic
}
```

### Component Export
Add to `src/index.js`:
```js
export * from './components/mycomponent/mycomponent';
```

### Testing Setup
```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent prop="value" />);
  expect(screen.getByText('expected text')).toBeInTheDocument();
});
```

## Deployment & Publishing
- Published to npm as `@pixelated-tech/components`
- Uses TypeScript declarations and ESM exports
- Peer dependencies: React 19+, Next.js 16+
- Build output includes CSS, images, and type definitions</content>
<parameter name="filePath">/Users/btwhaley/Git/pixelated-components/.github/copilot-instructions.md