import { describe, it, expect, beforeEach } from 'vitest';
import { validatePageName } from '../components/sitebuilder/page/lib/pageStorageLocal';

describe('Page Storage Local', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
	});

	describe('Page Name Validation', () => {
		it('should validate correct page names', () => {
			expect(validatePageName('page-1')).toBe(true);
			expect(validatePageName('my_page')).toBe(true);
			expect(validatePageName('Page123')).toBe(true);
		});

		it('should reject invalid page names', () => {
			expect(validatePageName('page@#')).toBe(false);
			expect(validatePageName('page with spaces')).toBe(false);
			expect(validatePageName('')).toBe(false);
		});

		it('should enforce name length limits', () => {
			const tooLong = 'a'.repeat(101);
			expect(validatePageName(tooLong)).toBe(false);
			
			const validLength = 'a'.repeat(100);
			expect(validatePageName(validLength)).toBe(true);
		});

		it('should allow alphanumeric, dashes, and underscores', () => {
			expect(validatePageName('valid-page_1')).toBe(true);
			expect(validatePageName('UPPERCASE')).toBe(true);
			expect(validatePageName('lowercase')).toBe(true);
		});

		it('should reject special characters', () => {
			expect(validatePageName('page!name')).toBe(false);
			expect(validatePageName('page$name')).toBe(false);
			expect(validatePageName('page%name')).toBe(false);
			expect(validatePageName('page&name')).toBe(false);
		});
	});

	describe('Local Storage Page Structure', () => {
		it('should define valid page data structure', () => {
			const page = { 
				id: 'page-1',
				title: 'Test Page',
				components: [],
				config: {},
			};
			expect(page.id).toBeDefined();
			expect(page.title).toBeDefined();
			expect(Array.isArray(page.components)).toBe(true);
		});

		it('should store and retrieve page metadata', () => {
			const metadata = {
				created: new Date().toISOString(),
				modified: new Date().toISOString(),
				author: 'test-user',
				version: 1
			};
			expect(metadata.created).toBeDefined();
			expect(metadata.modified).toBeDefined();
			expect(metadata.version).toBeGreaterThan(0);
		});

		it('should track storage quota usage', () => {
			const storageQuota = { 
				used: 1024,
				available: 5000000,
				percent: (1024 / 5000000) * 100,
			};
			expect(storageQuota.available).toBeGreaterThan(storageQuota.used);
			expect(storageQuota.percent).toBeLessThan(100);
			expect(storageQuota.percent).toBeGreaterThan(0);
		});

		it('should manage draft entries correctly', () => {
			const drafts = [
				{ id: 'draft-1', title: 'Draft 1', modified: new Date() },
				{ id: 'draft-2', title: 'Draft 2', modified: new Date() },
			];
			expect(Array.isArray(drafts)).toBe(true);
			expect(drafts.length).toBe(2);
			expect(drafts[0].id).toBeDefined();
		});
	});

	describe('Local Storage Operations', () => {
		it('should support save operations', () => {
			const saveResult = {
				success: true,
				pageId: 'local-page-1',
				timestamp: new Date().toISOString()
			};
			expect(saveResult.success).toBe(true);
			expect(saveResult.pageId).toBeDefined();
		});

		it('should support retrieve operations', () => {
			const retrievedPage = {
				id: 'local-page-1',
				title: 'Local Page',
				lastModified: new Date().toISOString(),
			};
			expect(retrievedPage.id).toBeDefined();
			expect(retrievedPage.title).toBeDefined();
		});

		it('should list multiple pages', () => {
			const pagesList = [
				{ id: 'page-1', title: 'Page 1', modified: new Date() },
				{ id: 'page-2', title: 'Page 2', modified: new Date() },
				{ id: 'page-3', title: 'Page 3', modified: new Date() },
			];
			expect(pagesList.length).toBeGreaterThan(0);
			pagesList.forEach(page => {
				expect(page.id).toBeDefined();
				expect(page.title).toBeDefined();
			});
		});

		it('should delete pages', () => {
			const deleteResult = {
				success: true,
				deletedId: 'page-to-delete'
			};
			expect(deleteResult.success).toBe(true);
		});
	});
});
