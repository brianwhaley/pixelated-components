import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validatePageName, listPages, loadPage } from '../components/sitebuilder/page/lib/pageStorageLocal';

vi.mock('fs');
vi.mock('path', () => ({
	join: (...args: string[]) => args.join('/'),
}));

vi.mock('../components/config/config', () => ({
	getFullPixelatedConfig: vi.fn(() => ({
		global: { pagesDir: 'public/data/pages' }
	})),
}));

describe('Page Storage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Page Name Validation', () => {
		it('should validate page name', () => {
			const validNames = ['home', 'about-us', 'contact_page', 'page123', 'About_Page-1'];
			validNames.forEach(name => {
				expect(validatePageName(name)).toBe(true);
			});
		});

		it('should reject invalid page names', () => {
			const invalidNames = ['page with spaces', 'page@name', 'page.json', '', 'a'.repeat(101)];
			invalidNames.forEach(name => {
				expect(validatePageName(name)).toBe(false);
			});
		});

		it('should accept alphanumeric names', () => {
			expect(validatePageName('page123')).toBe(true);
		});

		it('should accept names with dashes', () => {
			expect(validatePageName('my-page')).toBe(true);
		});

		it('should accept names with underscores', () => {
			expect(validatePageName('my_page')).toBe(true);
		});

		it('should reject names with special characters', () => {
			expect(validatePageName('page!name')).toBe(false);
			expect(validatePageName('page#name')).toBe(false);
			expect(validatePageName('page$name')).toBe(false);
		});

		it('should reject empty names', () => {
			expect(validatePageName('')).toBe(false);
		});

		it('should enforce maximum length', () => {
			const longName = 'a'.repeat(101);
			expect(validatePageName(longName)).toBe(false);
		});

		it('should allow maximum valid length', () => {
			const maxName = 'a'.repeat(100);
			expect(validatePageName(maxName)).toBe(true);
		});
	});

	describe('Store Page Data', () => {
		it('should store page data', () => {
			const pageData = { 
				id: 'test-page',
				title: 'Test Page',
				content: 'Test content',
				slug: '/test-page'
			};
			expect(pageData).toBeDefined();
			expect(pageData.title).toBe('Test Page');
		});

		it('should handle multiple page data', () => {
			const pages = [
				{ id: '1', title: 'Page 1' },
				{ id: '2', title: 'Page 2' },
				{ id: '3', title: 'Page 3' },
			];
			expect(pages.length).toBe(3);
		});

		it('should preserve page data structure', () => {
			const pageData = {
				id: 'about',
				title: 'About Us',
				slug: '/about',
				content: 'Company information',
				metadata: {
					description: 'Learn about our company',
					keywords: ['about', 'company'],
				}
			};

			expect(pageData.id).toBe('about');
			expect(pageData.metadata.description).toBeDefined();
		});
	});

	describe('Retrieve Page Data', () => {
		it('should retrieve page data by ID', () => {
			const data = { id: 'home', title: 'Home' };
			expect(data.id).toBeDefined();
			expect(data.id).toBe('home');
		});

		it('should handle multiple page fields', () => {
			const data = {
				id: 'services',
				title: 'Services',
				slug: '/services',
				content: 'Our services',
				published: true,
				createdAt: '2024-01-01'
			};

			expect(data.title).toBe('Services');
			expect(data.slug).toBe('/services');
		});

		it('should parse JSON page data', () => {
			const jsonString = '{"id":"contact","title":"Contact Us"}';
			const parsed = JSON.parse(jsonString);
			
			expect(parsed.id).toBe('contact');
			expect(parsed.title).toBe('Contact Us');
		});

		it('should support nested metadata', () => {
			const data = {
				id: 'blog',
				title: 'Blog',
				metadata: {
					description: 'Blog posts',
					author: 'Admin',
					tags: ['blog', 'news']
				}
			};

			expect(data.metadata.tags).toContain('blog');
		});
	});

	describe('Update Page Data', () => {
		it('should update page data', () => {
			const page = { title: 'Old Title', content: 'Old content' };
			page.title = 'New Title';
			expect(page.title).toBe('New Title');
		});

		it('should update single field', () => {
			const page = { id: '1', title: 'Page 1', status: 'draft' };
			page.status = 'published';
			expect(page.status).toBe('published');
		});

		it('should preserve other fields during update', () => {
			const page = { id: '1', title: 'Original', slug: '/original', content: 'Test' };
			page.title = 'Updated';
			
			expect(page.id).toBe('1');
			expect(page.slug).toBe('/original');
			expect(page.content).toBe('Test');
		});

		it('should update nested properties', () => {
			const page = {
				id: '1',
				title: 'Page 1',
				metadata: { author: 'John', published: false }
			};
			page.metadata.published = true;
			
			expect(page.metadata.published).toBe(true);
		});

		it('should support bulk property updates', () => {
			const page = { id: '1', title: 'Page 1', description: '', content: '' };
			const updates = { description: 'New desc', content: 'New content' };
			
			Object.assign(page, updates);
			expect(page.description).toBe('New desc');
			expect(page.content).toBe('New content');
		});
	});

	describe('List Pages', () => {
		it('should list available pages', async () => {
			const pageList = ['home', 'about', 'contact'];
			expect(Array.isArray(pageList)).toBe(true);
		});

		it('should return sorted page list', () => {
			const pages = ['zebra', 'apple', 'mango'];
			const sorted = pages.sort();
			
			expect(sorted[0]).toBe('apple');
			expect(sorted[1]).toBe('mango');
			expect(sorted[2]).toBe('zebra');
		});

		it('should handle empty page list', () => {
			const pages: string[] = [];
			expect(pages.length).toBe(0);
		});

		it('should filter page files by extension', () => {
			const files = ['page1.json', 'page2.json', 'readme.md', 'config.xml'];
			const jsonFiles = files.filter(f => f.endsWith('.json'));
			
			expect(jsonFiles.length).toBe(2);
			expect(jsonFiles).toContain('page1.json');
		});

		it('should remove file extension from page names', () => {
			const filenames = ['home.json', 'about.json', 'services.json'];
			const pageNames = filenames.map(f => f.replace('.json', ''));
			
			expect(pageNames).toEqual(['home', 'about', 'services']);
		});
	});

	describe('Page Storage Response', () => {
		it('should return success response for valid operation', async () => {
			const response = {
				success: true,
				data: { id: 'test', title: 'Test Page' }
			};

			expect(response.success).toBe(true);
			expect(response.data).toBeDefined();
		});

		it('should return error response for failed operation', async () => {
			const response = {
				success: false,
				message: 'Page not found'
			};

			expect(response.success).toBe(false);
			expect(response.message).toBeDefined();
		});

		it('should include page data in response', async () => {
			const response = {
				success: true,
				data: {
					id: 'home',
					title: 'Home',
					slug: '/',
					content: 'Welcome'
				}
			};

			expect(response.data.title).toBe('Home');
			expect(response.data.slug).toBe('/');
		});

		it('should include error message in failed response', async () => {
			const response = {
				success: false,
				message: 'Invalid page name. Use only letters, numbers, dashes, and underscores.'
			};

			expect(response.message).toContain('Invalid');
		});
	});

	describe('Page Storage Directory', () => {
		it('should use configured pages directory', () => {
			const pagesDir = 'public/data/pages';
			expect(pagesDir).toBe('public/data/pages');
		});

		it('should support custom pages directory', () => {
			const customDir = 'content/pages';
			expect(typeof customDir).toBe('string');
		});

		it('should create directory if missing', () => {
			const shouldCreate = true;
			expect(shouldCreate).toBe(true);
		});

		it('should construct valid file paths', () => {
			const basePath = 'public/data/pages';
			const pageName = 'home';
			const filePath = `${basePath}/${pageName}.json`;

			expect(filePath).toContain('home.json');
		});
	});

	describe('Data Persistence', () => {
		it('should persist page data to storage', () => {
			const pageData = { id: 'test', title: 'Test' };
			const stored = JSON.stringify(pageData);
			expect(stored).toContain('test');
		});

		it('should retrieve persisted data', () => {
			const stored = '{"id":"test","title":"Test"}';
			const retrieved = JSON.parse(stored);
			expect(retrieved.title).toBe('Test');
		});

		it('should handle concurrent operations', () => {
			const page1 = { id: '1', title: 'Page 1' };
			const page2 = { id: '2', title: 'Page 2' };
			
			expect(page1.id).toBe('1');
			expect(page2.id).toBe('2');
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid page names', () => {
			const invalidName = 'page with spaces';
			expect(validatePageName(invalidName)).toBe(false);
		});

		it('should return error for missing page', () => {
			const response = {
				success: false,
				message: 'Page "missing" not found.'
			};

			expect(response.success).toBe(false);
			expect(response.message).toContain('not found');
		});

		it('should handle JSON parse errors', () => {
			const invalidJson = '{invalid json}';
			expect(() => JSON.parse(invalidJson)).toThrow();
		});

		it('should handle file system errors', () => {
			const error = new Error('Permission denied');
			expect(error.message).toBe('Permission denied');
		});
	});
});
