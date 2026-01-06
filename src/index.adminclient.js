// Admin client entry point - client components for admin functionality
// This entry requires optional dependencies: recharts
// Sites using admin client components should import from 'pixelated-components/adminclient'

export * from './components/admin/site-health/site-health-accessibility';
export * from './components/admin/site-health/site-health-axe-core';
export * from './components/admin/site-health/site-health-cloudwatch';
export * from './components/admin/site-health/site-health-cloudwatch.integration';
export * from './components/admin/site-health/site-health-core-web-vitals.integration';
export * from './components/admin/site-health/site-health-dependency-vulnerabilities';
export * from './components/admin/site-health/site-health-github';
export * from './components/admin/site-health/site-health-google-analytics';
export * from './components/admin/site-health/site-health-google-search-console';
export * from './components/admin/site-health/site-health-on-site-seo';
export * from './components/admin/site-health/site-health-overview';
export * from './components/admin/site-health/site-health-security';
export * from './components/admin/site-health/site-health-seo';
export * from './components/admin/site-health/site-health-template';
export * from './components/admin/site-health/site-health-uptime';

// Client-safe admin components (can run on both client and server)
export * from './components/admin/site-health/seo-constants';
export * from './components/admin/site-health/site-health-cache';
export * from './components/admin/site-health/site-health-indicators';
export * from './components/admin/site-health/site-health-on-site-seo.integration';
export * from './components/admin/site-health/site-health-types';
export * from './components/admin/site-health/site-health-performance';
export * from './components/admin/site-health/site-health-utils';
export * from './components/admin/site-health/site-health-cache';
export * from './components/admin/site-health/site-health-indicators';
export * from './components/admin/site-health/site-health-on-site-seo.integration';
export * from './components/admin/site-health/site-health-performance';
export * from './components/admin/site-health/site-health-types';