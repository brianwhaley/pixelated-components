/**
 * Component Usage Analysis Services
 * Server-side utilities for analyzing component usage across sites
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { SiteConfig } from '../sites/sites.integration'; 

export interface ComponentUsageResult {
  components: string[];
  siteList: SiteConfig[];
  usageMatrix: { [component: string]: { [site: string]: boolean } };
}

/**
 * Convert folder/filename format to actual export name
 * e.g., "cms/calendly" -> "Calendly", "general/modal" -> "Modal"
 */
export function folderFilenameToExportName(folderFilename: string): string {
	const parts = folderFilename.split('/');
	let filename = parts[parts.length - 1];

	// Strip common suffixes
	filename = filename.replace(/\.components$/, '');

	// Strip common prefixes
	filename = filename.replace(/^schema-/, '');

	// Default: capitalize each part and join
	return filename
		.split(/[-.]/)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join('');
}

/**
 * Get all files recursively from a directory
 */
export async function getAllFiles(dirPath: string, extensions: string[] = []): Promise<string[]> {
	const files: string[] = [];

	async function scan(dir: string) {
		const entries = await fs.readdir(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name);

			if (entry.isDirectory()) {
				// Skip common non-source directories
				if (!['node_modules', '.next', '.git', 'out', 'dist', 'build', '.DS_Store'].includes(entry.name)) {
					await scan(fullPath);
				}
			} else if (entry.isFile()) {
				// Check if file has desired extension or if no extensions specified
				const ext = path.extname(entry.name);
				if (extensions.length === 0 || extensions.includes(ext)) {
					files.push(fullPath);
				}
			}
		}
	}

	try {
		await scan(dirPath);
	} catch {
		// Dir doesn't exist, continue
	}

	// If no source dirs found, scan the whole dir but exclude common non-source
	if (files.length === 0) {
		await scan(dirPath);
	}

	return files;
}

/**
 * Check if a component is used in a site
 */
export async function checkComponentUsage(sitePath: string | undefined, componentName: string): Promise<boolean> {
	try {
		if (!sitePath) return false; // nothing to scan
		const files = await getAllFiles(sitePath, ['.tsx', '.ts', '.jsx', '.js']);

		// Special case for semantic components that export multiple functions
		if (componentName === 'general/semantic') {
			const semanticExports = [
				'PageTitleHeader', 'PageSection', 'PageSectionHeader', 'PageSectionBackgroundImage',
				'PageGridItem', 'PageFlexItem', 'PageHeader', 'PageHero', 'PageMain', 'PageNav', 'PageFooter'
			];

			for (const file of files) {
				const content = await fs.readFile(file, 'utf-8');
				if (content.includes('@pixelated-tech/components') ||
            content.includes('@pixelated-tech/components/adminclient') ||
            content.includes('@pixelated-tech/components/adminserver')) {
					// Check if any semantic export is imported (case insensitive)
					for (const exportName of semanticExports) {
						const contentLower = content.toLowerCase();
						const exportNameLower = exportName.toLowerCase();
						if (contentLower.includes(exportNameLower) ||
                new RegExp(`import.*${exportNameLower}.*from.*@pixelated-tech/components`, 'i').test(content) ||
                new RegExp(`import.*${exportNameLower}.*from.*@pixelated-tech/components/adminclient`, 'i').test(content) ||
                new RegExp(`import.*${exportNameLower}.*from.*@pixelated-tech/components/adminserver`, 'i').test(content)) {
							return true;
						}
					}
				}
			}
			return false;
		}

		// Convert folder/filename to actual export name for checking
		const exportName = folderFilenameToExportName(componentName);

		for (const file of files) {
			const content = await fs.readFile(file, 'utf-8');
			// Check for import statements - look for the actual export name (case insensitive)
			const contentLower = content.toLowerCase();
			const exportNameLower = exportName.toLowerCase();
			if ((content.includes('@pixelated-tech/components') ||
           content.includes('@pixelated-tech/components/adminclient') ||
           content.includes('@pixelated-tech/components/adminserver')) &&
          (contentLower.includes(exportNameLower) ||
           new RegExp(`import.*${exportNameLower}.*from.*@pixelated-tech/components`, 'i').test(content) ||
           new RegExp(`import.*${exportNameLower}.*from.*@pixelated-tech/components/adminclient`, 'i').test(content) ||
           new RegExp(`import.*${exportNameLower}.*from.*@pixelated-tech/components/adminserver`, 'i').test(content))) {
				return true;
			}
		}
		return false;
	} catch (error) {
		console.error(`Error checking usage for ${componentName} in ${sitePath}:`, error);
		return false;
	}
}

/**
 * Analyze component usage across all sites
 */
export async function analyzeComponentUsage(
	components: string[],
	sites: SiteConfig[]
): Promise<ComponentUsageResult> {
	// Build usage matrix in parallel
	const usageMatrix: { [component: string]: { [site: string]: boolean } } = {};

	// Initialize matrix
	for (const component of components) {
		usageMatrix[component] = {};
		for (const site of sites) {
			usageMatrix[component][site.name] = false; // default
		}
	}

	// Collect all check promises
	const checkPromises = components.flatMap(component =>
		sites.map(site =>
			checkComponentUsage(site.localPath, component).then(isUsed => ({
				component,
				siteName: site.name,
				isUsed
			}))
		)
	);

	// Run all checks in parallel
	const results = await Promise.allSettled(checkPromises);

	// Populate matrix with results
	results.forEach(result => {
		if (result.status === 'fulfilled') {
			const { component, siteName, isUsed } = result.value;
			usageMatrix[component][siteName] = isUsed;
		} else {
			console.error('Check failed:', result.reason);
		}
	});

	return {
		components,
		siteList: sites,
		usageMatrix
	};
}