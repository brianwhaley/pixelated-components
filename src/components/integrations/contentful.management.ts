/**
 * Generic Contentful Management API Functions
 * 
 * Provides reusable CRUD operations for any Contentful content type
 */

import type { ContentfulConfig } from '../config/config.types';
import { smartFetch } from '../foundation/smartfetch';
import { buildUrl } from '../foundation/urlbuilder';

export interface ContentfulEntry {
	sys: {
		id: string;
		version: number;
		createdAt: string;
		updatedAt: string;
	};
	fields: {
		[key: string]: {
			'en-US': any;
		};
	};
}

export interface ListEntriesResponse {
	success: boolean;
	entries: any[];
	message?: string;
}

export interface GetEntryResponse {
	success: boolean;
	entry?: any;
	message?: string;
}

export interface SaveEntryResponse {
	success: boolean;
	message: string;
	entryId?: string;
}

export interface DeleteEntryResponse {
	success: boolean;
	message: string;
}

/**
 * List all entries of a specific content type
 */
export async function listEntries(
	contentType: string,
	config: ContentfulConfig
): Promise<ListEntriesResponse> {
	const { space_id, management_access_token, environment = 'master' } = config;
	
	try {
		const url = buildUrl({
			baseUrl: 'https://api.contentful.com',
			pathSegments: ['spaces', space_id, 'environments', environment, 'entries'],
			params: { content_type: contentType }
		});
		const data = await smartFetch(url, {
			requestInit: {
				headers: {
					'Authorization': `Bearer ${management_access_token}`,
					'Content-Type': 'application/json',
				},
			}
		});

		const entries = data.items || [];

		return {
			success: true,
			entries,
		};
	} catch (error) {
		return {
			success: false,
			entries: [],
			message: `Failed to list entries: ${error}`,
		};
	}
}

/**
 * Get a single entry by ID
 */
export async function getEntryById(
	entryId: string,
	config: ContentfulConfig
): Promise<GetEntryResponse> {
	const { space_id, management_access_token, environment = 'master' } = config;
	
	try {
		const url = buildUrl({
			baseUrl: 'https://api.contentful.com',
			pathSegments: ['spaces', space_id, 'environments', environment, 'entries', entryId]
		});
		const entry = await smartFetch(url, {
			requestInit: {
				headers: {
					'Authorization': `Bearer ${management_access_token}`,
					'Content-Type': 'application/json',
				},
			}
		});

		return {
			success: true,
			entry,
		};
	} catch (error: any) {
		if (error.status === 404) {
			return {
				success: false,
				message: 'Entry not found.',
			};
		}
		return {
			success: false,
			message: `Failed to get entry: ${error}`,
		};
	}
}

/**
 * Search for entries by field value
 */
export async function searchEntriesByField(
	contentType: string,
	fieldName: string,
	fieldValue: string,
	config: ContentfulConfig
): Promise<ListEntriesResponse> {
	const { space_id, management_access_token, environment = 'master' } = config;
	
	try {
		const url = buildUrl({
			baseUrl: 'https://api.contentful.com',
			pathSegments: ['spaces', space_id, 'environments', environment, 'entries'],
			params: { content_type: contentType, [`fields.${fieldName}`]: fieldValue }
		});
		const entries = await smartFetch(url, {
			requestInit: {
				headers: {
					'Authorization': `Bearer ${management_access_token}`,
					'Content-Type': 'application/json',
				},
			}
		});

		const items = entries.items || [];

		return {
			success: true,
			entries: items,
		};
	} catch (error) {
		return {
			success: false,
			entries: [],
			message: `Failed to search entries: ${error}`,
		};
	}
}

/**
 * Create a new entry
 */
export async function createEntry(
	contentType: string,
	fields: { [key: string]: any },
	config: ContentfulConfig,
	autoPublish: boolean = true
): Promise<SaveEntryResponse> {
	const { space_id, management_access_token, environment = 'master' } = config;
	
	try {
		// Convert fields to Contentful format (with 'en-US' locale)
		const contentfulFields: { [key: string]: { 'en-US': any } } = {};
		for (const [key, value] of Object.entries(fields)) {
			contentfulFields[key] = { 'en-US': value };
		}

		const url = buildUrl({
			baseUrl: 'https://api.contentful.com',
			pathSegments: ['spaces', space_id, 'environments', environment, 'entries']
		});
		const data = await smartFetch(url, {
			requestInit: {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${management_access_token}`,
					'Content-Type': 'application/vnd.contentful.management.v1+json',
					'X-Contentful-Content-Type': contentType,
				},
				body: JSON.stringify({
					fields: contentfulFields,
				}),
			}
		});

		// Publish if requested
		if (autoPublish) {
			const publishUrl = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', space_id, 'environments', environment, 'entries', data.sys.id, 'published']
			});
			await smartFetch(
				publishUrl,
				{
					requestInit: {
						method: 'PUT',
						headers: {
							'Authorization': `Bearer ${management_access_token}`,
							'X-Contentful-Version': data.sys.version.toString(),
						},
					}
				}
			);
		}

		return {
			success: true,
			message: 'Entry created successfully.',
			entryId: data.sys.id,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to create entry: ${error}`,
		};
	}
}

/**
 * Update an existing entry
 */
export async function updateEntry(
	entryId: string,
	fields: { [key: string]: any },
	config: ContentfulConfig,
	autoPublish: boolean = true
): Promise<SaveEntryResponse> {
	const { space_id, management_access_token, environment = 'master' } = config;
	
	try {
		// Get current entry to get version
		const getResponse = await getEntryById(entryId, config);
		if (!getResponse.success || !getResponse.entry) {
			return {
				success: false,
				message: 'Entry not found.',
			};
		}

		const currentEntry = getResponse.entry as ContentfulEntry;

		// Convert fields to Contentful format (with 'en-US' locale)
		const contentfulFields: { [key: string]: { 'en-US': any } } = {};
		for (const [key, value] of Object.entries(fields)) {
			contentfulFields[key] = { 'en-US': value };
		}

		const updatedEntry = await smartFetch(
			buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', space_id, 'environments', environment, 'entries', entryId],
			}),
			{
				requestInit: {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${management_access_token}`,
						'Content-Type': 'application/vnd.contentful.management.v1+json',
						'X-Contentful-Version': currentEntry.sys.version.toString(),
					},
					body: JSON.stringify({
						fields: contentfulFields,
					}),
				}
			}
		);

		// Publish if requested
		if (autoPublish) {
			await smartFetch(
				buildUrl({
					baseUrl: 'https://api.contentful.com',
					pathSegments: ['spaces', space_id, 'environments', environment, 'entries', entryId, 'published'],
				}),
				{
					requestInit: {
						method: 'PUT',
						headers: {
							'Authorization': `Bearer ${management_access_token}`,
							'X-Contentful-Version': updatedEntry.sys.version.toString(),
						},
					}
				}
			);
		}

		return {
			success: true,
			message: 'Entry updated successfully.',
			entryId,
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to update entry: ${error}`,
		};
	}
}

/**
 * Delete an entry (unpublish first, then delete)
 */
export async function deleteEntry(
	entryId: string,
	config: ContentfulConfig
): Promise<DeleteEntryResponse> {
	const { space_id, management_access_token, environment = 'master' } = config;
	
	try {
		// Get current entry to get version
		const getResponse = await getEntryById(entryId, config);
		if (!getResponse.success || !getResponse.entry) {
			return {
				success: false,
				message: 'Entry not found.',
			};
		}

		const entry = getResponse.entry as ContentfulEntry;

		// Unpublish first
		await smartFetch(
			buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', space_id, 'environments', environment, 'entries', entry.sys.id, 'published'],
			}),
			{
				requestInit: {
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${management_access_token}`,
						'X-Contentful-Version': entry.sys.version.toString(),
					},
				}
			}
		);

		// Delete the entry
		await smartFetch(
			buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', space_id, 'environments', environment, 'entries', entryId],
			}),
			{
				requestInit: {
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${management_access_token}`,
						'X-Contentful-Version': (entry.sys.version + 1).toString(),
					},
				}
			}
		);

		return {
			success: true,
			message: 'Entry deleted successfully.',
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to delete entry: ${error}`,
		};
	}
}





/****************************************
 * Contentful Integration Services
 * Server-side utilities for Contentful CMS operations
 ****************************************/

export interface ContentfulCredentials {
  spaceId: string;
  accessToken: string;
  environment?: string;
}

export interface ContentType {
  sys: {
    id: string;
    type: string;
  };
  name: string;
  description?: string;
  fields: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
  }>;
}

/**
 * Validate Contentful credentials by attempting to access the space
 */
export async function validateContentfulCredentials(credentials: ContentfulCredentials): Promise<{ valid: boolean; error?: string }> {
	try {
		await smartFetch(
			buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', credentials.spaceId],
			}),
			{
				requestInit: {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${credentials.accessToken}`,
						'Content-Type': 'application/vnd.contentful.management.v1+json',
					},
				}
			}
		);

		return { valid: true };
	} catch (error) {
		return { valid: false, error: (error as Error).message };
	}
}

/**
 * Get all content types from a Contentful space
 */
export async function getContentTypes(credentials: ContentfulCredentials): Promise<ContentType[]> {
	const { spaceId, accessToken } = credentials;

	// First get space info to find the default environment
	await smartFetch(
		buildUrl({
			baseUrl: 'https://api.contentful.com',
			pathSegments: ['spaces', spaceId],
		}),
		{
			requestInit: {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'Content-Type': 'application/vnd.contentful.management.v1+json',
				},
			}
		}
	);

	// Try different environment names - Contentful uses 'master' for older spaces, 'main' for newer ones
	const environmentsToTry = ['master', 'main'];
	let contentTypesData = null;
	let lastError = null;

	for (const env of environmentsToTry) {
		try {
			const data = await smartFetch(
				buildUrl({
					baseUrl: 'https://api.contentful.com',
					pathSegments: ['spaces', spaceId, 'environments', env, 'content_types'],
				}),
				{
					requestInit: {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${accessToken}`,
							'Content-Type': 'application/vnd.contentful.management.v1+json',
						},
					}
				}
			);
			contentTypesData = data;
			break;
		} catch (error) {
			lastError = error;
		}
	}

	if (!contentTypesData) {
		throw new Error(`Failed to fetch content types: ${lastError}`);
	}

	return contentTypesData.items || [];
}

/**
 * Migrate a content type from source to destination space
 */
export async function migrateContentType(
	sourceCredentials: ContentfulCredentials,
	destCredentials: ContentfulCredentials,
	contentTypeId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		// Get content type from source
		const sourceEnv = sourceCredentials.environment || 'master';
		const contentType = await smartFetch(
			buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', sourceCredentials.spaceId, 'environments', sourceEnv, 'content_types', contentTypeId],
			}),
			{
				requestInit: {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${sourceCredentials.accessToken}`,
						'Content-Type': 'application/vnd.contentful.management.v1+json',
					},
				}
			}
		);

		// Create content type in destination
		const destEnv = destCredentials.environment || 'master';
		await smartFetch(
			buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', destCredentials.spaceId, 'environments', destEnv, 'content_types'],
			}),
			{
				requestInit: {
					method: 'POST',
					headers: {
						'Authorization': `Bearer ${destCredentials.accessToken}`,
						'Content-Type': 'application/vnd.contentful.management.v1+json',
						'X-Contentful-Version': '1',
					},
					body: JSON.stringify(contentType),
				}
			}
		);

		return { success: true };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}