# Admin Components

This section covers administrative components and utilities for managing Pixelated Components applications.

## 📋 Table of Contents

### Admin Components
- [Component Usage](#component-usage)
- [Deploy](#deploy)
- [Site Health](#site-health)
- [Sites](#sites)

---

## Component Usage

Tracks and analyzes component usage across your application.

```typescript
import { ComponentDiscovery, ComponentAnalysis } from '@pixelated-tech/components/server';

// Discover all components in your project
const components = await ComponentDiscovery.discoverComponents('./src');

// Analyze component usage
const analysis = await ComponentAnalysis.analyzeUsage('./src', components);
```

#### Features

- **Component Discovery**: Automatically finds all React components in your codebase
- **Usage Analysis**: Tracks where and how components are used
- **Server-safe**: Safe to use in API routes and server components

## Deploy

Deployment utilities for managing site deployments.

```typescript
import { DeploymentIntegration } from '@pixelated-tech/components/server';

// Deploy to production
const result = await DeploymentIntegration.deploy({
  source: './dist',
  destination: 'production-site',
  config: deploymentConfig
});
```

#### Features

- **Automated Deployment**: Streamlined deployment process
- **Configuration Management**: Flexible deployment configurations
- **Error Handling**: Comprehensive error reporting and recovery

## Site Health

Comprehensive site health monitoring components.

```typescript
import {
  SiteHealthOverview,
  SiteHealthAxeCore,
  SiteHealthPerformance
} from '@pixelated-tech/components';

// Core Web Vitals overview
<SiteHealthOverview siteName="example.com" />

// Accessibility testing with axe-core
<SiteHealthAxeCore siteName="example.com" />

// Performance metrics
<SiteHealthPerformance siteName="example.com" />
```

#### Available Health Checks

- **Axe Core Accessibility**: Automated accessibility testing

##### Axe-core (Puppeteer) runtime notes 🔧

- **Modes**:
  - **local** — for local development. Uses lighter Puppeteer launch args and prefers the `PUPPETEER_EXECUTABLE_PATH` environment variable so you can point at your local Chrome/Chromium.
  - **prod** — for production (Amplify, CI). Uses conservative sandbox-friendly args and prefers the build-time path provided in `pixelated.config.json` under `puppeteer.executable_path`.

- **Recommended Amplify preBuild steps** (example):

```bash
# install Chrome into a project-local cache
PUPPETEER_CACHE_DIR=./.puppeteer-cache npx puppeteer browsers install chrome

# create a deterministic symlink that will be available at runtime
mkdir -p ./puppeteer-binary
ln -s /root/.cache/puppeteer/chrome/linux-<version>/chrome-linux64/chrome ./puppeteer-binary/chrome

# patch the decrypted pixelated.config.json to point to the executable path
node -e "const f=require('fs');const p='./src/app/config/pixelated.config.json';const j=JSON.parse(f.readFileSync(p));j.puppeteer=j.puppeteer||{};j.puppeteer.executable_path='./puppeteer-binary/chrome';f.writeFileSync(p,JSON.stringify(j,null,2));"
```

- **Notes**:
  - The code will pick the executable path from `config.puppeteer.executable_path` in **prod** and fall back to `PUPPETEER_EXECUTABLE_PATH` when needed.
  - Enabling `debug` in the Axe route/integration will log diagnostic info to help troubleshoot launch failures.

- **Core Web Vitals**: Performance metrics (LCP, FID, CLS)
- **Google Analytics**: Traffic and engagement data
- **Google Search Console**: Search performance and indexing
- **On-site SEO**: Meta tags, structured data, and SEO elements
- **Security Scan**: Security headers and vulnerabilities
- **Dependency Vulnerabilities**: Outdated or vulnerable dependencies
- **GitHub Integration**: Repository health and activity
- **Uptime Monitoring**: Site availability and response times

#### Features

- **Real-time Monitoring**: Live data from various APIs and services
- **Caching**: Built-in caching with configurable TTL
- **Error Handling**: Graceful error handling and fallbacks
- **Server-safe**: Components work in server and client environments

## Sites

Site configuration management utilities.

```typescript
import {
  loadSitesConfig,
  saveSitesConfig,
  getSiteConfig,
  validateSiteConfig
} from '@pixelated-tech/components/server';

// Load site configurations
const sites = await loadSitesConfig();

// Get specific site
const site = await getSiteConfig('my-site');

// Validate site configuration
const validation = validateSiteConfig(site);
if (!validation.valid) {
  console.error('Invalid site config:', validation.errors);
}
```

#### Features

- **Configuration Management**: Load and save site configurations
- **Validation**: Comprehensive site configuration validation
- **GA4 Integration**: Google Analytics 4 property validation
- **Search Console**: Google Search Console URL validation
- **File System Operations**: Safe file operations with error handling