# Coding Conventions

This document outlines the coding standards and conventions used in the pixelated-components project.

## General

### Indentation
- Use tabs for indentation with tab size 4
- Do not use spaces for indentation

## TypeScript & React

### PropTypes & Type Inference
- Use PropTypes for runtime validation
- Use `InferProps<typeof Component.propTypes>` for TypeScript types
- Define PropTypes before the component function
- Example:
```typescript
Component.propTypes = {
	propName: PropTypes.string.isRequired,
	optionalProp: PropTypes.number
};
export type ComponentType = InferProps<typeof Component.propTypes>;
export function Component(props: ComponentType) { ... }
```

### Component Structure
- Use functional components with hooks
- Export both the component and its type
- Use named exports over default exports
- Place PropTypes definition immediately before the component

### File Organization
- Group related components in feature directories
- Use kebab-case for file names: `component-name.tsx`
- Place CSS files alongside components: `component-name.css`
- Use index files for clean imports

## APIs & Services

### API Service Structure
- Create thin API services that handle external integrations
- Separate business logic from API calls
- Use TypeScript interfaces for API request/response types
- Handle errors gracefully with proper typing

### Service File Naming
- Use descriptive names: `gemini-api.ts`, `analytics-service.ts`
- Place in appropriate directories (utilities, services, etc.)
- Export functions and types clearly

### Error Handling
- Use try/catch blocks for async operations
- Return typed error responses
- Log errors appropriately
- Provide user-friendly error messages

## Configuration & environment variables
- Prefer a single source-of-truth config file: `pixelated.config.json` (server-side) and access it via the `PixelatedClientConfigProvider` / `getFullPixelatedConfig()` APIs.
- Environment variables must be avoided at all costs. The config provider exists so teams can use developer-friendly, code-first, and versioned configuration instead of brittle, environment-variable-based wiring — always explore provider-driven, build-time, or feature-flagging alternatives before considering an env var.
- Secrets must be injected into `pixelated.config.json.enc` and surfaced via the config loader; do **not** read secrets from ad-hoc `process.env` in application code. Consumer components must read configuration from the config provider (`useConfig()` / `usePixelatedConfig()`), not `process.env` directly — this ensures consistent defaulting, secret-stripping for client bundles, and server/client parity.

Exception (allowed env usage — single, narrowly-scoped):
- `PIXELATED_CONFIG_KEY` — only to decrypt `pixelated.config.json.enc` in local/CI debugging; prefer injecting the key via the CI/platform secrets manager. This is the only permitted environment variable for application configuration in the codebase unless an explicit, documented approval and migration plan is provided.

> ⚠️ Migration rule: any existing `process.env` references (other than `PIXELATED_CONFIG_KEY`) must include a migration PR that maps the value into `pixelated.config.json` and updates `config.types.ts` (no silent roll-forwards).

Enforcement & best practices:
- Wrap any dev-only env reads in clear helpers and document them in `/docs`.
- Add a CI check that reports any new references to `process.env` in `src/components` (denylist) unless explicitly approved.
- Example (preferred):
```ts
// server-side: canonical config loader
import { getFullPixelatedConfig } from '../config/config';
const cfg = getFullPixelatedConfig();
// client-safe: use provider to avoid leaking secrets
const clientCfg = getClientOnlyPixelatedConfig(cfg);
```

## CSS

### Naming Convention
- Use kebab-case for class names
- Use BEM methodology when appropriate
- Prefix component-specific classes: `.component-name__element`

### CSS Variables
- Use CSS custom properties for theming
- Define variables at the root level when possible
- Use semantic variable names: `--font-size5`, `--color-primary`

## Testing

### Test File Structure
- Place tests in the `src/tests` directory: `component-name.test.tsx`
- Use descriptive test names
- Test both success and error cases

## Documentation

### Code Comments
- Use JSDoc for function documentation
- Comment complex logic
- Keep comments up to date

### README Files
- Include usage examples
- Document props and types
- Provide setup instructions

## Development Workflow

### Before Implementing New Features
1. **Use Existing Components**: Build on existing components rather than creating new ones from scratch
2. **Small Iterations**: Implement features in small, incremental steps
3. **Regular Quality Checks**: Run linting, testing, and building frequently during development
4. **Storybook Testing**: Test components in Storybook to ensure proper functionality and appearance

### Implementation Process
- Start with existing component patterns
- Make small changes and validate each step
- Use linting tools to maintain code quality
- Test in Storybook for visual and functional verification
- Run build process regularly to catch issues early

### Debugging & debug-only code
- Use a single, explicit debug flag per module when needed: `const debug = false` (set true only in local/dev runs).
- Wrap debug-only behavior in `if (debug) { ... }` so it can be removed by minifiers/treeshaking in production.
- Never ship persistent debug traces, sensitive dumps, or verbose stacks to production logs.
- Prefer a dev-only logger API that is a no-op in production (e.g. `logger.debug(...)`) instead of ad-hoc `console.*` calls.
- One-shot diagnostics (for reproducing rare races) must be clearly labeled, gated behind `debug` and removed or feature-flagged before release.

Examples:
```ts
// local-only diagnostic (must be false in prod)
const debug = process.env.NODE_ENV !== 'production' && false;
if (debug) {
  // debug-only instrumentation (stack-capture, MutationObserver, etc.)
}
```

Acceptance criteria:
- All `if (debug)` blocks are eliminated or `debug` is `false` in production builds (checked by CI).
- No persistent `console.log`/`console.debug` calls in production bundles (enforce via lint rule).
- One-shot diagnostics are documented and gated behind explicit opt-in.

## Versioning & releases — Semantic Versioning
- This project follows [Semantic Versioning 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`.
  - MAJOR: incompatible API changes (breaking changes)
  - MINOR: backward-compatible new features and new public APIs
  - PATCH: backward-compatible bug fixes and documentation/test updates
- Deprecation policy:
  - Mark API as deprecated in docs and types with the version it will be removed in.
  - Provide migration notes and a codemod if the change is non-trivial.
  - Keep deprecated behavior supported for at least one MINOR cycle where feasible.

Release checklist (must-pass before publishing):
- Tests: all unit/integration/e2e passing
- Lint: no errors (warnings reviewed)
- Changelog: add entry following Conventional Commits (type/scope/summary)
- Compatibility: update `peerDependencies` table in README/docs if applicable
- Docs: update `docs/` with migration notes for breaking or deprecated changes

Version bump guidance (practical):
- Bump PATCH for bug fixes, tests, docs, and non-behavioral changes.
- Bump MINOR for new features, new public API, or additions that are backwards-compatible.
- Bump MAJOR for breaking API changes (document migration + deprecation window).

Automation & enforcement:
- Use CI to validate changelog + required changelog entry for releases.
- Fail release job if changelog or migration notes are missing for MAJOR/MINOR bumps.

## Git & Workflow

### Commit Messages
- Use conventional commit format
- Write clear, descriptive messages
- Reference issues when applicable

### Branch Naming
- Use feature branches: `feature/component-name`
- Use bugfix branches: `bugfix/issue-description`
- Use kebab-case for branch names