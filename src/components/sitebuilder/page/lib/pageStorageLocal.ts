import fs from 'fs';
import path from 'path';
import type { PageData } from './types';
import type {
	LoadPageResponse,
	ListPagesResponse,
	SavePageResponse,
	DeletePageResponse
} from './pageStorageTypes';

import { getFullPixelatedConfig } from '../../../config/config';
const PAGES_DIR = getFullPixelatedConfig()?.global?.pagesDir || 'public/data/pages';

/**
 * Get absolute path to pages directory
 */
function getPagesDir(): string {
	return path.join(process.cwd(), PAGES_DIR);
}

/**
 * Ensure pages directory exists
 */
function ensurePagesDir(): void {
	const dir = getPagesDir();
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

/**
 * Validate page name (alphanumeric, dashes, underscores only)
 */
export function validatePageName(name: string): boolean {
	const validPattern = /^[a-zA-Z0-9_-]+$/;
	return validPattern.test(name) && name.length > 0 && name.length <= 100;
}

/**
 * List all saved pages
 */
export async function listPages(): Promise<ListPagesResponse> {
	try {
		ensurePagesDir();
		const dir = getPagesDir();
		const files = fs.readdirSync(dir);
		const jsonFiles = files
			.filter((f: string) => f.endsWith('.json'))
			.map((f: string) => f.replace('.json', ''));
		
		return {
			success: true,
			pages: jsonFiles.sort()
		};
	} catch (error) {
		return {
			success: false,
			pages: [],
			message: `Failed to list pages: ${error}`
		};
	}
}

/**
 * Load a page by name
 */
export async function loadPage(name: string): Promise<LoadPageResponse> {
	try {
		if (!validatePageName(name)) {
			return {
				success: false,
				message: 'Invalid page name. Use only letters, numbers, dashes, and underscores.'
			};
		}

		const dir = getPagesDir();
		const filepath = path.join(dir, `${name}.json`);
		
		if (!fs.existsSync(filepath)) {
			return {
				success: false,
				message: `Page "${name}" not found.`
			};
		}

		const content = fs.readFileSync(filepath, 'utf-8');
		const data = JSON.parse(content) as PageData;

		return {
			success: true,
			data
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to load page: ${error}`
		};
	}
}

/**
 * Save a page
 */
export async function savePage(name: string, data: PageData): Promise<SavePageResponse> {
	try {
		if (!validatePageName(name)) {
			return {
				success: false,
				message: 'Invalid page name. Use only letters, numbers, dashes, and underscores.'
			};
		}

		ensurePagesDir();
		const dir = getPagesDir();
		const filepath = path.join(dir, `${name}.json`);
		
		// Write file with pretty formatting
		fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

		return {
			success: true,
			message: `Page "${name}" saved successfully.`,
			filename: `${name}.json`
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to save page: ${error}`
		};
	}
}

/**
 * Delete a page
 */
export async function deletePage(name: string): Promise<DeletePageResponse> {
	try {
		if (!validatePageName(name)) {
			return {
				success: false,
				message: 'Invalid page name.'
			};
		}

		const dir = getPagesDir();
		const filepath = path.join(dir, `${name}.json`);
		
		if (!fs.existsSync(filepath)) {
			return {
				success: false,
				message: `Page "${name}" not found.`
			};
		}

		fs.unlinkSync(filepath);

		return {
			success: true,
			message: `Page "${name}" deleted successfully.`
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete page: ${error}`
		};
	}
}
