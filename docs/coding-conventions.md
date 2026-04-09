# Coding Conventions

This document outlines the coding standards and conventions used in the pixelated-components project.

## AI Agent & Code Review Discipline

**For AI agents and code reviewers:**
- Never recommend changes based on assumptions about library/framework behavior
- All claims must be backed by actual code analysis, testing, or documentation
- Always provide documentation URLs when claiming something about a tool or library
- If unsure about behavior: test it first or explicitly state the uncertainty
- Read actual type definitions (node_modules) and official docs before claiming "X doesn't support Y"
- Verify changes work by running tests before recommending them

Example: Don't say "vitest v8 doesn't support coverage thresholds" — test it first or link to the actual vitest docs proving it.

## Terminal Command Output - CRITICAL Rule for AI Agents

**🚫 NEVER pipe command output to files or use grep/tail/head to filter results**

- All command output MUST display directly to stdout/stderr in the terminal
- User must be able to see all output in the terminal
- Transparency is required - do not hide, filter, or pre-process execution details
- **FORBIDDEN patterns**:
  - `npm run test | grep "FAIL"` - user can't see full output
  - `npm run build > build.log` - user can't see results
  - `command 2>&1 | tail -100` - user doesn't see beginning
  - Any piping to files or output truncation
- **REQUIRED patterns**:
  - `npm run test:coverage` - full unfiltered output visible
  - `npm run build` - complete results displayed
  - Let the user see everything, always

## Git Conventions

### Remote Naming
- Name Git remotes after the repository, not "origin"
- Pattern: `git remote add <repo-name> https://github.com/<org>/<repo-name>.git`
- Example: `git remote add pixelated-components https://github.com/brianwhaley/pixelated-components.git`
- Benefits: Multiple remotes are self-documenting; `git fetch pixelated-components` is clearer than `git fetch upstream`
- Monorepo context: pixelated-tech monorepo has remotes for all apps, making cross-project operations clear
- Use `src/scripts/setup-remotes.sh` to configure all remotes consistently

## General

### Indentation
- Use tabs for indentation with tab size 4
- Do not use spaces for indentation

## TypeScript & React

### PropTypes & Type Inference
- Use PropTypes for runtime validation
- Use `InferProps<typeof Component.propTypes>` for TypeScript types
- Define PropTypes before the component function
- Require JSDoc on propTypes (either a JSDoc block immediately above the `propTypes` declaration or inline per-prop comments). Enforced by ESLint rule `pixelated/required-proptypes-jsdoc` (severity: **error**).
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
- Temporary security dependencies (e.g., `fast-xml-parser`) are flagged by the ESLint rule `pixelated/no-temp-dependency` (severity: **error**). This rule inspects the project's `package-lock.json` and errors the build when a configured temporary dependency remains; remove the dependency and update the rule options when the transient issue is resolved. If the lockfile no longer contains vulnerable versions but the dependency is still pinned via `overrides`/`resolutions` in `package.json`, the rule will also error and require removal of the override so the dependency graph is normalized.
- Hardcoded configuration values are prevented by the ESLint rule `pixelated/no-hardcoded-config-keys` (severity: **error**). This rule detects hardcoded Pixelated-specific configuration keys (e.g., `space_id`, `api_key`, `access_token`, etc.) and enforces their use via the config provider instead. **SECRET keys** (API tokens, encryption keys, credentials) are reported with heightened messaging; **non-secret config keys** are reported with standard messaging. Migration: any hardcoded config keys must be moved to `pixelated.config.json`, `pixelated.config.json.enc` (for secrets), or accessed via `usePixelatedConfig()` / `getFullPixelatedConfig()`. Example fix: replace `const base_url = 'https://cdn.contentful.com'` with `const base_url = config.base_url || 'https://cdn.contentful.com'` (where `config` comes from the provider).
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
- Enforced by ESLint rule `pixelated/class-name-kebab-case` (severity: **error**)
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
- One-shot diagnostics (for reproducing rare races) must be clearly labeled, gated behind `debug` and removed or feature-flagged before release.

Examples:
```ts
// local-only diagnostic (must be false in prod)
const debug = false;
if (debug) {
  // debug-only instrumentation (stack-capture, MutationObserver, etc.)
}
```

Acceptance criteria:
- All `if (debug)` blocks are eliminated or `debug` is `false` in production builds (checked by CI).
- No persistent `console.log`/`console.debug` calls in production bundles (enforce via lint rule).
- File naming: prefer `kebab-case` for source file names (lowercase, hyphen-separated). Examples: `my-component.tsx`, `form-utils.ts`. Exceptions: `index.*`, TypeScript declaration files (`*.d.ts`), test/spec (`*.test.tsx`, `*.spec.ts`), Storybook stories (`*.stories.tsx`), documentation (`docs/`) and intentionally generated files. This is enforced by `pixelated/file-name-kebab-case` (recommended `warn`).
- One-shot diagnostics are documented and gated behind explicit opt-in.

### Code Coverage Requirements

Code coverage thresholds enforce quality gates during releases:

**Thresholds** (configured in [vitest.config.ts](../vitest.config.ts)):
- **Lines**: 60% minimum (global, per-file, per-function)
- **Functions**: 60% minimum (global, per-file, per-function)
- **Branches**: 60% minimum (global, per-file, per-function)
- **Statements**: 60% minimum (global, per-file, per-function)

**Only .ts, .tsx, and .js files are counted** (.css, .scss, .json, build scripts, and test files are excluded).

**When coverage is enforced:**
- `npm run test:coverage` – Manual coverage check with report (shows HTML report in `coverage/` directory)
- `npm run release:prep` – Fails immediately if coverage drops below thresholds; prevents build/deployment
- `npm run release` (in release.sh) – Conditional check: runs only if `src/tests/` or `src/test/` directory exists

**Adjusting thresholds:**
Edit `COVERAGE_THRESHOLDS` constants at the top of [vitest.config.ts](../vitest.config.ts). Changes take effect immediately on next run.

**Development workflow:**
- `npm test` – Fast test run (no coverage check, development-friendly)
- `npm run test:coverage` – Full coverage report with enforcement (use frequently before release)
- `npm run release:prep` – Final gate before production (must pass coverage to proceed)

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