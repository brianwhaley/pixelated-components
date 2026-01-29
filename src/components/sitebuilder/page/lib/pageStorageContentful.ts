/**
 * PageBuilder-specific Contentful storage implementation
 * 
 * Uses generic Contentful management functions with PageBuilder-specific logic
 */

import type { ContentfulConfig } from '../../../config/config.types';
import { createEntry, updateEntry, deleteEntry, searchEntriesByField } from '../../../integrations/contentful.management';
import { getContentfulEntriesByType } from '../../../integrations/contentful.delivery';
import type { PageData } from './types';
import type {
	ListPagesResponse,
	LoadPageResponse,
	SavePageResponse,
	DeletePageResponse,
} from './pageStorageTypes';

const CONTENT_TYPE = 'page';

/**
 * Validate page name format
 */
function validatePageName(name: string): boolean {
	return /^[a-zA-Z0-9-_]+$/.test(name);
}

/**
 * List all saved pages
 */
export async function listContentfulPages(
	config: ContentfulConfig
): Promise<ListPagesResponse> {
	// Map management-style config to delivery apiProps for the CDN-based read helper
	const apiProps = {
		base_url: 'https://cdn.contentful.com',
		space_id: config.space_id,
		environment: config.environment || 'master',
		delivery_access_token: config.delivery_access_token,
	} as any;

	const result: any = await getContentfulEntriesByType({ apiProps, contentType: CONTENT_TYPE });
	if (!result || !Array.isArray(result.items)) {
		return { success: true, pages: [] };
	}

	const pages = result.items
		.map((entry: any) => (entry && entry.fields && entry.fields.pageName) ? (entry.fields.pageName['en-US'] || entry.fields.pageName) : undefined)
		.filter((name: any) => typeof name === 'string')
		.sort();

	return { success: true, pages };
}

/**
 * Load a page by name
 */
export async function loadContentfulPage(
	name: string,
	config: ContentfulConfig
): Promise<LoadPageResponse> {
	if (!validatePageName(name)) {
		return {
			success: false,
			message: 'Invalid page name. Use only letters, numbers, dashes, and underscores.',
		};
	}

	// Use delivery API for reads
	const apiProps = {
		base_url: 'https://cdn.contentful.com',
		space_id: config.space_id,
		environment: config.environment || 'master',
		delivery_access_token: config.delivery_access_token,
	} as any;

	const result: any = await getContentfulEntriesByType({ apiProps, contentType: CONTENT_TYPE });
	if (!result || !Array.isArray(result.items) || result.items.length === 0) {
		return { success: false, message: `Page "${name}" not found.` };
	}

	const entry = result.items.find((item: any) => {
		const val = item && item.fields && item.fields.pageName;
		const pageName = Array.isArray(val) ? val[0] : val;
		const nameStr = typeof pageName === 'object' ? pageName['en-US'] : pageName;
		return nameStr === name;
	});

	if (!entry) return { success: false, message: `Page "${name}" not found.` };

	const pageData = entry.fields.pageData?.['en-US'] || entry.fields.pageData;
	return { success: true, data: pageData };
}

/**
 * Save a page (create or update)
 */
export async function saveContentfulPage(
	name: string,
	data: PageData,
	config: ContentfulConfig
): Promise<SavePageResponse> {
	if (!validatePageName(name)) {
		return {
			success: false,
			message: 'Invalid page name. Use only letters, numbers, dashes, and underscores.',
		};
	}

	// Check if page exists
	const searchResult = await searchEntriesByField(CONTENT_TYPE, 'pageName', name, config);
	
	if (!searchResult.success) {
		return {
			success: false,
			message: searchResult.message || 'Failed to check existing page.',
		};
	}

	const fields = {
		pageName: name,
		pageData: data,
		title: name,
		status: 'published',
	};

	if (searchResult.entries.length > 0) {
		// Update existing entry
		const entryId = searchResult.entries[0].sys.id;
		const result = await updateEntry(entryId, fields, config, true);
		
		return {
			success: result.success,
			message: result.success ? `Page "${name}" updated successfully.` : result.message,
			filename: name,
		};
	} else {
		// Create new entry
		const result = await createEntry(CONTENT_TYPE, fields, config, true);
		
		return {
			success: result.success,
			message: result.success ? `Page "${name}" created successfully.` : result.message,
			filename: name,
		};
	}
}

/**
 * Delete a page by name
 */
export async function deleteContentfulPage(
	name: string,
	config: ContentfulConfig
): Promise<DeletePageResponse> {
	if (!validatePageName(name)) {
		return {
			success: false,
			message: 'Invalid page name.',
		};
	}

	// Find the entry
	const searchResult = await searchEntriesByField(CONTENT_TYPE, 'pageName', name, config);
	
	if (!searchResult.success) {
		return {
			success: false,
			message: searchResult.message || 'Failed to find page.',
		};
	}

	if (searchResult.entries.length === 0) {
		return {
			success: false,
			message: `Page "${name}" not found.`,
		};
	}

	const entryId = searchResult.entries[0].sys.id;
	const result = await deleteEntry(entryId, config);
	
	return {
		success: result.success,
		message: result.success ? `Page "${name}" deleted successfully.` : result.message,
	};
}
