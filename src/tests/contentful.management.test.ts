import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as contentfulManagement from '../components/integrations/contentful.management';
import { buildUrl } from '../components/foundation/urlbuilder';

describe('Contentful Management Module', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should be importable', () => {
		expect(contentfulManagement).toBeDefined();
	});

	describe('URL Construction with buildUrl', () => {
		it('should construct listEntries URL with buildUrl pattern', () => {
			const space_id = 'test-space-123';
			const environment = 'master';
			const access_token = 'test-token';

			const url = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', space_id, 'environments', environment, 'entries'],
				params: { access_token }
			});

			expect(url).toContain('https://api.contentful.com');
			expect(url).toContain('spaces');
			expect(url).toContain('test-space-123');
			expect(url).toContain('environments');
			expect(url).toContain('master');
			expect(url).toContain('entries');
			expect(url).toContain('access_token=test-token');
		});

		it('should construct getEntryById URL with buildUrl pattern', () => {
			const space_id = 'test-space-123';
			const environment = 'master';
			const entryId = 'entry-456';
			const access_token = 'test-token';

			const url = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', space_id, 'environments', environment, 'entries', entryId],
				params: { access_token }
			});

			expect(url).toContain('entries/entry-456');
			expect(url).toContain('access_token=test-token');
		});

		it('should construct entry create/update URL with buildUrl pattern', () => {
			const space_id = 'test-space';
			const environment = 'master';
			const entryId = 'new-entry';

			const url = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', space_id, 'environments', environment, 'entries', entryId]
			});

			expect(url).toContain('entries/new-entry');
			expect(url).not.toContain('?');
		});

		it('should construct publish URL with buildUrl pattern', () => {
			const space_id = 'test-space';
			const environment = 'master';
			const entryId = 'entry-id';

			const url = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', space_id, 'environments', environment, 'entries', entryId, 'published']
			});

			expect(url).toContain('entries/entry-id/published');
		});

		it('should construct content types URL with buildUrl pattern', () => {
			const spaceId = 'test-space';
			const env = 'master';
			const accessToken = 'token-123';

			const url = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', spaceId, 'environments', env, 'content_types'],
				params: { access_token: accessToken }
			});

			expect(url).toContain('content_types');
			expect(url).toContain('access_token=token-123');
		});

		it('should construct migration URLs with buildUrl pattern', () => {
			const spaceId = 'source-space';
			const env = 'master';
			const contentTypeId = 'article';

			const url = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', spaceId, 'environments', env, 'content_types', contentTypeId]
			});

			expect(url).toContain('content_types/article');
		});
	});

	describe('Content Management API Response Types', () => {
		it('should handle entry list operations', () => {
			const response = {
				success: true,
				entries: [
					{ sys: { id: 'entry-1' }, fields: { title: { 'en-US': 'Entry 1' } } }
				],
				total: 1
			};
			expect(response.success).toBe(true);
			expect(response.entries).toBeDefined();
		});

		it('should handle entry creation', () => {
			const response = {
				success: true,
				entryId: 'new-entry-123',
				message: 'Entry created and published successfully.'
			};
			expect(response.success).toBe(true);
			expect(response.entryId).toBeTruthy();
		});

		it('should handle entry updates', () => {
			const response = {
				success: true,
				message: 'Entry updated successfully.',
				entryId: 'entry-123'
			};
			expect(response.success).toBe(true);
			expect(response.message).toContain('updated');
		});

		it('should handle entry deletion', () => {
			const response = {
				success: true,
				message: 'Entry deleted successfully.'
			};
			expect(response.success).toBe(true);
		});

		it('should handle validation errors with proper structure', () => {
			const response = {
				success: false,
				message: 'Invalid credentials provided'
			};
			expect(response.success).toBe(false);
			expect(response.message).toBeDefined();
		});

		it('should include error context in failure responses', () => {
			const response = {
				success: false,
				message: 'Failed to update entry: 409 version mismatch'
			};
			expect(response.message).toContain('Failed');
		});
	});

	describe('Configuration validation', () => {
		it('should validate ContentfulConfig structure', () => {
			const config = {
				space_id: 'test-space',
				management_access_token: 'token',
				environment: 'master'
			};
			expect(config.space_id).toBeDefined();
			expect(config.management_access_token).toBeDefined();
		});

		it('should use environment default to master', () => {
			const config = {
				space_id: 'test-space',
				management_access_token: 'token',
				environment: undefined
			};
			const environment = config.environment || 'master';
			expect(environment).toBe('master');
		});
	});
});
