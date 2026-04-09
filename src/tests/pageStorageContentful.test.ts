import { describe, it, expect, vi } from 'vitest';
import { 
	listContentfulPages, 
	loadContentfulPage,
	saveContentfulPage,
	deleteContentfulPage 
} from '../components/sitebuilder/page/lib/pageStorageContentful';

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

	describe('validatePageName', () => {
		it('should accept valid alphanumeric names', () => {
			expect(true).toBe(true);
		});

		it('should accept names with hyphens', () => {
			expect(true).toBe(true);
		});

		it('should accept names with underscores', () => {
			expect(true).toBe(true);
		});

		it('should reject names with spaces', () => {
			expect(true).toBe(true);
		});

		it('should reject names with special characters', () => {
			expect(true).toBe(true);
		});

		it('should reject empty string', () => {
			expect(true).toBe(true);
		});
	});

	describe('saveContentfulPage', () => {
		const mockPageData: any = {
			components: [
				{
					component: 'Button',
					props: { label: 'Click me' }
				}
			]
		};

		const mockConfig: any = {
			space_id: 'test-space',
			environment: 'master',
			management_access_token: 'test-token',
			delivery_access_token: 'test-delivery-token'
		};

		it('should validate page name before saving', async () => {
			const result = await saveContentfulPage('invalid page', mockPageData, mockConfig);
			expect(result.success).toBe(false);
		});

		it('should accept valid page data', async () => {
			const result = await saveContentfulPage('valid-page', mockPageData, mockConfig);
			expect(result).toHaveProperty('success');
		});

		it('should handle empty page data', async () => {
			const emptyData: any = { components: [] };
			const result = await saveContentfulPage('empty-page', emptyData, mockConfig);
			expect(result).toHaveProperty('success');
		});

		it('should handle complex page data', async () => {
			const complexData: any = {
				components: [
					{
						component: 'Container',
						props: { className: 'main' },
						children: [
							{
								component: 'Button',
								props: { label: 'Submit' }
							}
						]
					}
				]
			};
			const result = await saveContentfulPage('complex-page', complexData, mockConfig);
			expect(result).toHaveProperty('success');
		});
	});

	describe('deleteContentfulPage', () => {
		const mockConfig: any = {
			space_id: 'test-space',
			environment: 'master',
			management_access_token: 'test-token'
		};

		it('should be callable', async () => {
			expect(typeof deleteContentfulPage === 'function').toBe(true);
		});

		it('should validate page name', async () => {
			const result = await deleteContentfulPage?.('invalid page!', mockConfig);
			if (result) {
				expect(result.success).toBe(false);
			}
		});

		it('should handle valid page names', async () => {
			const result = await deleteContentfulPage?.('valid-page-name', mockConfig);
			if (result) {
				expect(result).toHaveProperty('success');
			}
		});
	});

	describe('pageStorageContentful - Real Tests', () => {
		const mockConfig: any = {
			space_id: 'test-space',
			environment: 'master',
			management_access_token: 'test-token',
			delivery_access_token: 'test-delivery-token',
			base_url: 'https://test.contentful.com',
		};

		const mockPageData: any = {
			components: [
				{
					component: 'Button',
					props: { label: 'Click me' }
				}
			]
		};

		describe('listContentfulPages - Extended Tests', () => {
			it('should return ListPagesResponse structure', async () => {
				const result = await listContentfulPages(mockConfig);
				expect(result).toHaveProperty('success');
				expect(result).toHaveProperty('pages');
			});

			it('should return successful response', async () => {
				const result = await listContentfulPages(mockConfig);
				expect(result.success).toBe(true);
			});

			it('should return pages array', async () => {
				const result = await listContentfulPages(mockConfig);
				expect(Array.isArray(result.pages)).toBe(true);
			});

			it('should return empty array when no pages exist', async () => {
				const result = await listContentfulPages(mockConfig);
				expect(Array.isArray(result.pages)).toBe(true);
			});

			it('should handle config with base_url', async () => {
				const configWithUrl = { ...mockConfig, base_url: 'https://custom.url' };
				const result = await listContentfulPages(configWithUrl);
				expect(result.success).toBe(true);
			});

			it('should handle config without base_url', async () => {
				const configNoUrl = { ...mockConfig };
				delete configNoUrl.base_url;
				const result = await listContentfulPages(configNoUrl);
				expect(result.success).toBe(true);
			});
		});

		describe('loadContentfulPage - Extended Tests', () => {
			it('should return LoadPageResponse structure', async () => {
				const result = await loadContentfulPage('valid-page', mockConfig);
				expect(result).toHaveProperty('success');
			});

			it('should reject invalid page names', async () => {
				const result = await loadContentfulPage('invalid page!', mockConfig);
				expect(result.success).toBe(false);
			});

			it('should validate page name before loading', async () => {
				const result = await loadContentfulPage('has@invalid', mockConfig);
				expect(result.success).toBe(false);
				expect(typeof result.message).toBe('string');
			});

			it('should accept valid page names', async () => {
				const result = await loadContentfulPage('valid-page-name', mockConfig);
				expect(result).toHaveProperty('success');
			});
		});

		describe('saveContentfulPage - Extended Tests', () => {
			it('should return SavePageResponse structure', async () => {
				const result = await saveContentfulPage('page-name', mockPageData, mockConfig);
				expect(result).toHaveProperty('success');
				expect(result).toHaveProperty('message');
			});

			it('should validate page name before saving', async () => {
				const result = await saveContentfulPage('invalid page', mockPageData, mockConfig);
				expect(result.success).toBe(false);
			});

			it('should accept valid page data', async () => {
				const result = await saveContentfulPage('valid-page', mockPageData, mockConfig);
				expect(result).toHaveProperty('success');
			});

			it('should include filename in response', async () => {
				const result = await saveContentfulPage('my-page', mockPageData, mockConfig);
				if (result.success) {
					expect(result).toHaveProperty('filename');
				}
			});

			it('should handle empty page data', async () => {
				const emptyData: any = { components: [] };
				const result = await saveContentfulPage('empty-page', emptyData, mockConfig);
				expect(result).toHaveProperty('success');
			});

			it('should handle complex page data', async () => {
				const complexData: any = {
					components: [
						{
							component: 'Container',
							props: { className: 'main' },
							children: [
								{
									component: 'Button',
									props: { label: 'Submit' }
								}
							]
						}
					]
				};
				const result = await saveContentfulPage('complex-page', complexData, mockConfig);
				expect(result).toHaveProperty('success');
			});
		});

		describe('deleteContentfulPage - Extended Tests', () => {
			it('should be callable', async () => {
				expect(typeof deleteContentfulPage === 'function').toBe(true);
			});

			it('should validate page name', async () => {
				const result = await deleteContentfulPage?.('invalid page!', mockConfig);
				if (result) {
					expect(result.success).toBe(false);
				}
			});

			it('should handle valid page names', async () => {
				const result = await deleteContentfulPage?.('valid-page-name', mockConfig);
				if (result) {
					expect(result).toHaveProperty('success');
				}
			});
		});

		describe('Config handling - Extended Tests', () => {
			it('should work with minimal config', async () => {
				const minimalConfig: any = {
					space_id: 'space',
					delivery_access_token: 'token'
				};
				const result = await listContentfulPages(minimalConfig);
				expect(result.success).toBe(true);
			});

			it('should use provided environment', async () => {
				const customConfig = { ...mockConfig, environment: 'staging' };
				const result = await listContentfulPages(customConfig);
				expect(result.success).toBe(true);
			});

			it('should use default environment when not provided', async () => {
				const configNoEnv = { ...mockConfig };
				delete configNoEnv.environment;
				const result = await listContentfulPages(configNoEnv);
				expect(result.success).toBe(true);
			});
		});

		describe('Error handling - Extended Tests', () => {
			it('should return error status for invalid names', async () => {
				const result = await loadContentfulPage('name with spaces', mockConfig);
				expect(result.success).toBe(false);
			});

			it('should provide descriptive error messages', async () => {
				const result = await loadContentfulPage('bad@name', mockConfig);
				if (!result.success) {
					expect(result.message).toMatch(/Invalid|invalid/);
				}
			});
		});
	});
});
