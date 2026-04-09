/**
 * Sites Management Integration Services
 * Server-side utilities for site configuration and data management
 */

import fs from 'fs';
import path from 'path';

export interface SiteConfig {
  name: string;
  /** Optional local path (may be absent for remote-only checks) */
  localPath?: string;
  /** Optional remote (e.g., full URL or owner/repo string) */
  remote?: string;
  /** Optional explicit repository identifier (e.g., "owner/repo" or just "repo") */
  repo?: string;
  /** Optional explicit repo owner */
  owner?: string;
  ga4PropertyId?: string;
  searchConsoleUrl?: string;
  [key: string]: any;
}  

/**
 * Load sites configuration from JSON file
 */
export async function loadSitesConfig(configPath?: string): Promise<SiteConfig[]> {
	try {
		const sitesPath = configPath || path.join(process.cwd(), 'src/app/data/sites.json');

		if (!fs.existsSync(sitesPath)) {
			throw new Error('Sites configuration not found');
		}

		const sitesData = fs.readFileSync(sitesPath, 'utf8');
		const sites = JSON.parse(sitesData);

		return sites;
	} catch (error) {
		console.error('Error loading sites:', error);
		throw new Error('Failed to load sites configuration', { cause: error });
	}
}

/**
 * Save sites configuration to JSON file
 */
export async function saveSitesConfig(sites: SiteConfig[], configPath?: string): Promise<void> {
	try {
		const sitesPath = configPath || path.join(process.cwd(), 'src/app/data/sites.json');

		// Ensure directory exists
		const dir = path.dirname(sitesPath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		fs.writeFileSync(sitesPath, JSON.stringify(sites, null, 2), 'utf8');
	} catch (error) {
		console.error('Error saving sites:', error);
		throw new Error('Failed to save sites configuration', { cause: error });
	}
}

/**
 * Get a specific site configuration by name
 */
export async function getSiteConfig(siteName: string, configPath?: string): Promise<SiteConfig | null> {
	const sites = await loadSitesConfig(configPath);
	return sites.find(site => site.name === siteName) || null;
}

/**
 * Validate site configuration
 */
export function validateSiteConfig(site: SiteConfig): { valid: boolean; errors: string[] } {
	const errors: string[] = [];

	if (!site.name) {
		errors.push('Site name is required');
	}

	if (!site.localPath) {
		errors.push('Local path is required');
	} else if (!fs.existsSync(site.localPath)) {
		errors.push(`Local path does not exist: ${site.localPath}`);
	}

	// Validate Google Analytics configuration
	if (site.ga4PropertyId && site.ga4PropertyId !== 'GA4_PROPERTY_ID_HERE') {
		// Basic GA4 property ID validation (should start with numbers)
		if (!/^\d+$/.test(site.ga4PropertyId)) {
			errors.push('Invalid GA4 Property ID format');
		}
	}

	// Validate Search Console URL
	if (site.searchConsoleUrl) {
		try {
			new URL(site.searchConsoleUrl);
		} catch {
			errors.push('Invalid Search Console URL format');
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

/**
 * Add or update a site configuration
 */
export async function upsertSiteConfig(site: SiteConfig, configPath?: string): Promise<void> {
	const sites = await loadSitesConfig(configPath);
	const existingIndex = sites.findIndex(s => s.name === site.name);

	// Validate the site config
	const validation = validateSiteConfig(site);
	if (!validation.valid) {
		throw new Error(`Invalid site configuration: ${validation.errors.join(', ')}`);
	}

	if (existingIndex >= 0) {
		// Update existing site
		sites[existingIndex] = { ...sites[existingIndex], ...site };
	} else {
		// Add new site
		sites.push(site);
	}

	await saveSitesConfig(sites, configPath);
}

/**
 * Remove a site configuration
 */
export async function removeSiteConfig(siteName: string, configPath?: string): Promise<boolean> {
	const sites = await loadSitesConfig(configPath);
	const filteredSites = sites.filter(site => site.name !== siteName);

	if (filteredSites.length === sites.length) {
		return false; // Site not found
	}

	await saveSitesConfig(filteredSites, configPath);
	return true;
}