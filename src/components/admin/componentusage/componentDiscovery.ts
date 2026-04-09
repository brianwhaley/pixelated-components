/**
 * Dynamic Component Discovery
 * Discovers components by parsing pixelated-components exports at runtime
 */

import fs from 'fs';
import path from 'path';

/**
 * Get the pixelated-components package path (now that we're inside the library)
 */
function getPixelatedComponentsPath(): string {
	// Since this is now running in pixelated-admin, resolve from the current working directory
	try {
		// Get the current working directory (should be pixelated-admin root)
		const cwd = process.cwd();
    
		// Navigate to node_modules/@pixelated-tech/components
		const packagePath = path.join(cwd, 'node_modules', '@pixelated-tech', 'components');
    
		// Verify the path exists
		if (fs.existsSync(packagePath)) {
			return packagePath;
		} else {
			// Fallback to require.resolve but strip the /ROOT/ prefix if present
			const resolvedPath = require.resolve('@pixelated-tech/components/package.json');
      
			if (resolvedPath.startsWith('/ROOT/')) {
				// Remove the /ROOT/ prefix and use the actual filesystem path
				const actualPath = resolvedPath.replace('/ROOT/', '/');
				const packageDir = path.dirname(actualPath);
				if (fs.existsSync(packageDir)) {
					return packageDir;
				}
			}
      
			// Use the resolved path as-is
			const packageDir = path.dirname(resolvedPath);
			return packageDir;
		}
	} catch (error) {
		console.error('Error resolving package path:', error);
		// Fallback to relative path resolution
		const currentDir = __dirname;
		// Navigate up: componentusage -> admin -> components -> pixelated-components root
		const fallbackPath = path.resolve(currentDir, '../../../');
		return fallbackPath;
	}
}

/**
 * Discover components dynamically by parsing the pixelated-components index files
 * This runs on the server side during API calls
 */
export async function discoverComponentsFromLibrary(): Promise<string[]> {
	try {
		// Get the pixelated-components package path
		const pixelatedPath = getPixelatedComponentsPath();
    
		const componentNames: string[] = [];
    
		// Read from main index.js
		const indexPath = path.join(pixelatedPath, 'dist', 'index.js');
		if (fs.existsSync(indexPath)) {
			const indexContent = fs.readFileSync(indexPath, 'utf-8');
			componentNames.push(...parseComponentExports(indexContent));
		}
    
		// Read from adminclient index
		const adminClientPath = path.join(pixelatedPath, 'dist', 'index.adminclient.js');
		if (fs.existsSync(adminClientPath)) {
			const adminClientContent = fs.readFileSync(adminClientPath, 'utf-8');
			componentNames.push(...parseComponentExports(adminClientContent));
		}
    
		// Read from adminserver index
		const adminServerPath = path.join(pixelatedPath, 'dist', 'index.adminserver.js');
		if (fs.existsSync(adminServerPath)) {
			const adminServerContent = fs.readFileSync(adminServerPath, 'utf-8');
			componentNames.push(...parseComponentExports(adminServerContent));
		}

		return [...new Set(componentNames)].sort(); // Remove duplicates and sort alphabetically
	} catch (error) {
		console.error('Error in dynamic component discovery:', error);
		// Return empty array if discovery fails
		return [];
	}
}

/**
 * Parse ALL export statements from index.js and format as folder/filename
 * No filtering - includes everything for maximum inclusivity
 */
function parseComponentExports(content: string): string[] {
	const componentNames: string[] = [];
	const lines = content.split('\n');

	for (const line of lines) {
		const trimmed = line.trim();

		// Match: export * from './components/folder/filename';
		const match = trimmed.match(/export \* from '\.\/components\/([^']+)';/);
		if (match) {
			const componentPath = match[1];

			// Format as folder/filename (e.g., "cms/calendly", "general/modal")
			componentNames.push(componentPath);
		}
	}

	return [...new Set(componentNames)].sort(); // Remove duplicates and sort alphabetically
}