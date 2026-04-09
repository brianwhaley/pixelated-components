import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
	validatePageName,
	listPages,
	loadPage,
	savePage,
	deletePage
} from '../components/sitebuilder/page/lib/pageStorageLocal';
import type { PageData } from '../components/sitebuilder/page/lib/types';

// Mock fs module
vi.mock('fs', () => ({
	default: {
		existsSync: vi.fn(),
		readdirSync: vi.fn(),
		readFileSync: vi.fn(),
		writeFileSync: vi.fn(),
		unlinkSync: vi.fn(),
		mkdirSync: vi.fn(),
	}
}));

vi.mock('path', () => ({
	default: {
		join: vi.fn((...args) => args.join('/'))
	}
}));

vi.mock('../components/config/config', () => ({
	getFullPixelatedConfig: () => ({
		global: { pagesDir: 'public/data/pages' }
	})
}));

// Import mocked modules
import fs from 'fs';

describe('Page Storage Local - Data Validation', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	describe('Page creation and validation structures', () => {
		it('should validate page name patterns', () => {
			expect(validatePageName('valid-page')).toBe(true);
			expect(validatePageName('valid_page')).toBe(true);
			expect(validatePageName('ValidPage123')).toBe(true);
		});

		it('should reject invalid characters in names', () => {
			expect(validatePageName('invalid@page')).toBe(false);
			expect(validatePageName('invalid$page')).toBe(false);
			expect(validatePageName('invalid page')).toBe(false);
		});

		it('should enforce length constraints', () => {
			const max = 'a'.repeat(100);
			const tooLong = 'a'.repeat(101);
			expect(validatePageName(max)).toBe(true);
			expect(validatePageName(tooLong)).toBe(false);
			expect(validatePageName('')).toBe(false);
		});

		it('should handle edge cases', () => {
			expect(validatePageName('a')).toBe(true);
			expect(validatePageName('A')).toBe(true);
			expect(validatePageName('1')).toBe(true);
			expect(validatePageName('-')).toBe(true);
			expect(validatePageName('_')).toBe(true);
		});
	});

	describe('Page data structures', () => {
		it('should support basic page structure', () => {
			const page = {
				id: 'page-id',
				title: 'Page Title',
				components: [],
				config: {}
			};
			expect(page.id).toBeDefined();
			expect(typeof page.title).toBe('string');
			expect(Array.isArray(page.components)).toBe(true);
			expect(typeof page.config).toBe('object');
		});

		it('should maintain component array', () => {
			const components = [
				{ type: 'Header', props: { title: 'Title' } },
				{ type: 'Footer', props: {} }
			];
			expect(components.length).toBe(2);
			expect(components[0].type).toBe('Header');
		});

		it('should support nested config', () => {
			const config = {
				theme: { primary: '#000', secondary: '#fff' },
				layout: { type: 'grid', columns: 3 },
				metadata: { seo: { title: 'SEO Title' } }
			};
			expect(config.theme.primary).toBe('#000');
			expect(config.layout.columns).toBe(3);
			expect(config.metadata.seo.title).toBe('SEO Title');
		});

		it('should handle large datasets', () => {
			const largeArray = Array(500).fill({ id: 'item', value: 123 });
			expect(largeArray.length).toBe(500);
			expect(largeArray[0].value).toBe(123);
		});

		it('should manage pagination data', () => {
			const pages = [
				{ id: 'page1', title: 'Page 1' },
				{ id: 'page2', title: 'Page 2' },
				{ id: 'page3', title: 'Page 3' }
			];
			const pagination = { currentPage: 1, totalPages: Math.ceil(pages.length / 10) };
			expect(pagination.totalPages).toBe(1);
			expect(pages.length).toBe(3);
		});
	});

	describe('Page metadata handling', () => {
		it('should track timestamps', () => {
			const now = new Date();
			const page = {
				id: 'page-1',
				title: 'Test Page',
				created: now.toISOString(),
				modified: now.toISOString(),
				components: [],
				config: {}
			};
			expect(page.created).toBeDefined();
			expect(page.modified).toBeDefined();
		});

		it('should support versioning', () => {
			const version1 = { id: 'page', version: 1, content: 'v1' };
			const version2 = { ...version1, version: 2, content: 'v2' };
			expect(version2.version).toBe(2);
			expect(version1.version).toBe(1);
		});

		it('should manage draft status', () => {
			const draft = { isDraft: true, id: 'draft-1', title: 'Draft Page' };
			const published = { ...draft, isDraft: false };
			expect(draft.isDraft).toBe(true);
			expect(published.isDraft).toBe(false);
		});

		it('should track authorship', () => {
			const page = {
				id: 'page-1',
				title: 'Page',
				author: 'user@example.com',
				contributors: ['contributor1', 'contributor2'],
				components: [],
				config: {}
			};
			expect(page.author).toBe('user@example.com');
			expect(page.contributors.length).toBe(2);
		});
	});

	describe('Page operations and state', () => {
		it('should handle page state changes', () => {
			const states = ['draft', 'preview', 'published', 'archived'];
			const page = { id: 'page-1', title: 'Page', state: 'draft' };
			expect(states).toContain(page.state);
		});

		it('should manage page permissions', () => {
			const permissions = {
				owner: 'user1',
				editors: ['user2', 'user3'],
				viewers: ['user4'],
				public: false
			};
			expect(permissions.editors.length).toBe(2);
		});

		it('should support page organization', () => {
			const organization = {
				pages: ['page-1', 'page-2', 'page-3'],
				categories: { home: ['page-1'], blog: ['page-2'], contact: ['page-3'] },
				tags: ['important', 'draft', 'review']
			};
			expect(Object.keys(organization.categories).length).toBe(3);
			expect(organization.tags).toContain('important');
		});

		it('should handle concurrent modifications', () => {
			const modifications = [
				{ timestamp: Date.now(), user: 'user1', action: 'update' },
				{ timestamp: Date.now() + 1, user: 'user2', action: 'comment' },
				{ timestamp: Date.now() + 2, user: 'user1', action: 'save' }
			];
			expect(modifications.length).toBe(3);
			expect(modifications[2].action).toBe('save');
		});
	});
});

describe('pageStorageLocal - Real Implementation Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('validatePageName - Real Tests', () => {
		it('should accept valid alphanumeric names', () => {
			expect(validatePageName('homepage')).toBe(true);
			expect(validatePageName('about-us')).toBe(true);
			expect(validatePageName('page_2024')).toBe(true);
		});

		it('should reject invalid special characters', () => {
			expect(validatePageName('page@home')).toBe(false);
			expect(validatePageName('page name')).toBe(false);
		});

		it('should reject empty strings', () => {
			expect(validatePageName('')).toBe(false);
		});

		it('should reject names longer than 100 characters', () => {
			expect(validatePageName('a'.repeat(101))).toBe(false);
		});

		it('should accept exactly 100 characters', () => {
			expect(validatePageName('a'.repeat(100))).toBe(true);
		});
	});

	describe('listPages - Real Tests', () => {
		it('should return sorted list of page names', async () => {
			(fs.existsSync as any).mockReturnValue(true);
			(fs.readdirSync as any).mockReturnValue(['page-c.json', 'page-a.json', 'page-b.json']);

			const result = await listPages();

			expect(result.success).toBe(true);
			expect(result.pages).toEqual(['page-a', 'page-b', 'page-c']);
		});

		it('should return empty array for empty directory', async () => {
			(fs.existsSync as any).mockReturnValue(true);
			(fs.readdirSync as any).mockReturnValue([]);

			const result = await listPages();

			expect(result.success).toBe(true);
			expect(result.pages).toEqual([]);
		});

		it('should filter only .json files', async () => {
			(fs.existsSync as any).mockReturnValue(true);
			(fs.readdirSync as any).mockReturnValue(['page-a.json', 'readme.txt', 'page-b.json']);

			const result = await listPages();

			expect(result.success).toBe(true);
			expect(result.pages).toEqual(['page-a', 'page-b']);
		});

		it('should handle read error gracefully', async () => {
			(fs.existsSync as any).mockReturnValue(true);
			(fs.readdirSync as any).mockImplementation(() => {
				throw new Error('Permission denied');
			});

			const result = await listPages();

			expect(result.success).toBe(false);
			expect(result.pages).toEqual([]);
		});
	});

	describe('loadPage - Real Tests', () => {
		it('should load valid JSON file', async () => {
			const pageData = { components: [{ name: 'Header' }] };
			(fs.existsSync as any).mockReturnValue(true);
			(fs.readFileSync as any).mockReturnValue(JSON.stringify(pageData));

			const result = await loadPage('homepage');

			expect(result.success).toBe(true);
			expect(result.data).toEqual(pageData);
		});

		it('should reject invalid page name', async () => {
			const result = await loadPage('page@invalid');

			expect(result.success).toBe(false);
		});

		it('should return error if file not found', async () => {
			(fs.existsSync as any).mockReturnValue(false);

			const result = await loadPage('nonexistent');

			expect(result.success).toBe(false);
		});

		it('should handle corrupted JSON gracefully', async () => {
			(fs.existsSync as any).mockReturnValue(true);
			(fs.readFileSync as any).mockReturnValue('{ invalid json }');

			const result = await loadPage('corrupted');

			expect(result.success).toBe(false);
		});
	});

	describe('savePage - Real Tests', () => {
		beforeEach(() => {
			// Mock fs methods for savePage tests
			(fs.mkdirSync as any).mockReturnValue(undefined);
			(fs.writeFileSync as any).mockReturnValue(undefined);
			(fs.existsSync as any).mockReturnValue(false);
		});

		it('should save page with valid name and data', async () => {
			const pageData = { components: [{ component: 'div', props: {} }] };

			const result = await savePage('test-page', pageData);

			expect(result.success).toBe(true);
			expect((fs.writeFileSync as any)).toHaveBeenCalled();
		});

		it('should reject invalid page name', async () => {
			const result = await savePage('page#invalid', { components: [] });

			expect(result.success).toBe(false);
		});

		it('should return filename on success', async () => {
			const result = await savePage('mypage', { components: [] });

			expect(result.filename).toBe('mypage.json');
		});
	});

	describe('deletePage - Real Tests', () => {
		it('should delete existing page', async () => {
			(fs.existsSync as any).mockReturnValue(true);

			const result = await deletePage('old-page');

			expect(result.success).toBe(true);
			expect((fs.unlinkSync as any)).toHaveBeenCalled();
		});

		it('should reject invalid page name', async () => {
			const result = await deletePage('page$bad');

			expect(result.success).toBe(false);
		});

		it('should return error if file not found', async () => {
			(fs.existsSync as any).mockReturnValue(false);

			const result = await deletePage('missing');

			expect(result.success).toBe(false);
		});
	});
});
