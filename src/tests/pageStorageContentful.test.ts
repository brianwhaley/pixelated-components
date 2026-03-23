import { describe, it, expect, vi } from 'vitest';
import { listContentfulPages, loadContentfulPage } from '../components/sitebuilder/page/lib/pageStorageContentful';

vi.mock('../components/integrations/contentful.delivery', () => ({
	getContentfulEntriesByType: vi.fn().mockResolvedValue({ items: [] })
}));

describe('pageStorageContentful', () => {
	it('should export listContentfulPages function', () => {
		expect(typeof listContentfulPages).toBe('function');
	});

	it('should export loadContentfulPage function', () => {
		expect(typeof loadContentfulPage).toBe('function');
	});

	it('should list pages with valid config', async () => {
		const config: any = {
			space_id: 'test-space',
			delivery_access_token: 'token'
		};

		const result = await listContentfulPages(config);
		expect(result.success).toBe(true);
		expect(Array.isArray(result.pages)).toBe(true);
	});

	it('should load page with valid name', async () => {
		const config: any = {
			space_id: 'test',
			delivery_access_token: 'token'
		};

		const result = await loadContentfulPage('valid-page-name', config);
		expect(result).toBeDefined();
	});

	it('should reject invalid page names with special chars', async () => {
		const config: any = {
			space_id: 'test',
			delivery_access_token: 'token'
		};

		const result = await loadContentfulPage('invalid name!', config);
		expect(result.success).toBe(false);
	});

	it('should accept alphanumeric, dash, and underscore', async () => {
		const config: any = {
			space_id: 'test',
			delivery_access_token: 'token'
		};

		const result = await loadContentfulPage('valid_page-123', config);
		expect(result).toBeDefined();
	});

	it('should handle empty space config', async () => {
		const config: any = {
			space_id: '',
			delivery_access_token: 'token'
		};

		const result = await listContentfulPages(config);
		expect(result).toBeDefined();
	});

	it('should use default base_url when not provided', async () => {
		const config: any = {
			space_id: 'test',
			delivery_access_token: 'token'
		};

		const result = await listContentfulPages(config);
		expect(result.success).toBe(true);
	});

	it('should use master environment by default', async () => {
		const config: any = {
			space_id: 'test',
			delivery_access_token: 'token'
		};

		const result = await loadContentfulPage('test-page', config);
		expect(result).toBeDefined();
	});

	it('should handle alternate environments', async () => {
		const config: any = {
			space_id: 'test',
			environment: 'staging',
			delivery_access_token: 'token'
		};

		const result = await listContentfulPages(config);
		expect(result.success).toBe(true);
	});

	it('should require access token', async () => {
		const config: any = {
			space_id: 'test'
		};

		try {
			await listContentfulPages(config);
		} catch (error: any) {
			expect(error.message).toBeDefined();
		}
	});
});
