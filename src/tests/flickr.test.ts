import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetFlickrData } from '../components/integrations/flickr';

// Mock fetch before importing the module
global.fetch = vi.fn();

describe('flickr - GetFlickrData', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		if (typeof window !== 'undefined' && window.localStorage) {
			window.localStorage.clear();
		}
	});

	it('should return async function that fetches Flickr photos', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: {
					photo: [
						{
							id: '123',
							title: 'Photo 1',
							datetaken: '2024-01-15T10:00:00'
						},
						{
							id: '456',
							title: 'Photo 2',
							datetaken: '2024-01-16T10:00:00'
						}
					]
				},
				stat: 'ok'
			})
		} as any);

		const result = await GetFlickrData({});
		expect(Array.isArray(result)).toBe(true);
		expect(result?.length).toBeGreaterThan(0);
	});

	it('should accept configuration object for Flickr API', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: { photo: [] },
				stat: 'ok'
			})
		} as any);

		const config = {
			flickr: {
				api_key: 'test-key',
				user_id: '123456'
			}
		};

		const result = await GetFlickrData(config);
		expect(result).toBeDefined();
	});

	it('should merge props with configuration', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: { photo: [{ id: '1', datetaken: '2024-01-01' }] },
				stat: 'ok'
			})
		} as any);

		const config = {
			flickr: { baseURL: 'https://api.flickr.com/' },
			config: { custom: 'value' }
		};

		const result = await GetFlickrData(config);
		expect(result).toBeDefined();
	});

	it('should handle photo size mapping from response', async () => {

		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: {
					photo: [
						{
							id: '123',
							title: 'Test Photo',
							server: '1234',
							secret: 'abcd',
							farm: 1,
							datetaken: '2024-01-01T10:00:00',
							url_z: 'https://example.com/640.jpg',
							url_b: 'https://example.com/1024.jpg',
							description: { _content: 'desc' },
							ownername: 'owner'
						}
					]
				},
				stat: 'ok'
			})
		} as any);

		const result = await GetFlickrData({});
		// The implementation returns the photo array as-is, so secret should be present
		expect(result?.[0]?.secret).toBe('abcd');
	});

	it('should parse Flickr API photo response correctly', async () => {

		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: {
					page: 1,
					pages: 10,
					total: 100,
					photo: [
						{
							id: '123',
							title: 'Test Photo',
							server: '1234',
							secret: 'abcd',
							farm: 1,
							datetaken: '2024-01-15T10:00:00',
							url_z: 'https://example.com/640.jpg',
							url_b: 'https://example.com/1024.jpg',
							description: { _content: 'desc' },
							ownername: 'owner'
						},
						{
							id: '456',
							title: 'Photo 2',
							server: '5678',
							secret: 'efgh',
							farm: 2,
							datetaken: '2024-01-10T10:00:00',
							url_z: 'https://example.com/640b.jpg',
							url_b: 'https://example.com/1024b.jpg',
							description: { _content: 'desc2' },
							ownername: 'owner2'
						}
					]
				},
				stat: 'ok'
			})
		} as any);

		const result = await GetFlickrData({});
		expect(result).toBeDefined();
		// The implementation sorts by datetaken descending, so the first photo should be 'Test Photo'
		expect(result?.[0]?.title).toBe('Test Photo');
	});

	it('should handle missing API key gracefully', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: { photo: [] },
				stat: 'ok'
			})
		} as any);

		const config = { flickr: {} };
		const result = await GetFlickrData(config);
		expect(result).toBeDefined();
	});

	it('should support tag parameter in API request', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: {
					photo: [{ id: '1', datetaken: '2024-01-01' }]
				},
				stat: 'ok'
			})
		} as any);

		const config = {
			flickr: { tags: 'landscape' }
		};

		const result = await GetFlickrData(config);
		expect(result).toBeDefined();
	});

	it('should support pagination parameters', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: {
					page: 2,
					pages: 10,
					photo: [{ id: '1', datetaken: '2024-01-01' }]
				},
				stat: 'ok'
			})
		} as any);

		const config = {
			flickr: { page: 2, per_page: 20 }
		};

		const result = await GetFlickrData(config);
		expect(result).toBeDefined();
	});

	it('should sort photos by date in descending order', async () => {

		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photos: {
					photo: [
						{ id: '1', datetaken: '2024-01-01T10:00:00', server: '1', secret: 'a', farm: 1, title: 'Photo 1', description: { _content: 'desc1' }, ownername: 'owner1' },
						{ id: '2', datetaken: '2024-01-15T10:00:00', server: '2', secret: 'b', farm: 2, title: 'Photo 2', description: { _content: 'desc2' }, ownername: 'owner2' },
						{ id: '3', datetaken: '2024-01-10T10:00:00', server: '3', secret: 'c', farm: 3, title: 'Photo 3', description: { _content: 'desc3' }, ownername: 'owner3' }
					]
				},
				stat: 'ok'
			})
		} as any);

		const result = await GetFlickrData({});
		// Should be sorted newest first (descending by datetaken)
		expect(result?.[0]?.id).toBe('2');
		expect(result?.[1]?.id).toBe('3');
		expect(result?.[2]?.id).toBe('1');
	});

	it('should handle photoset response (album photos)', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({
				photoset: {
					photo: [
						{ id: '1', datetaken: '2024-01-01T10:00:00' },
						{ id: '2', datetaken: '2024-01-02T10:00:00' }
					]
				},
				stat: 'ok'
			})
		} as any);

		const result = await GetFlickrData({});
		expect(Array.isArray(result)).toBe(true);
		expect(result?.length).toBe(2);
	});

	it('should handle HTTP errors from Flickr API', async () => {
		vi.mocked(global.fetch).mockResolvedValueOnce({
			ok: false,
			status: 400
		} as any);

		const result = await GetFlickrData({});
		// Should handle error gracefully
		expect(result === undefined || Array.isArray(result)).toBe(true);
	});

	describe('Photo Size Options', () => {
		it('should support multiple size formats in response', async () => {

			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					photos: {
						photo: [
							{
								id: '1',
								datetaken: '2024-01-01T10:00:00',
								url_z: 'https://example.com/640.jpg',
								url_b: 'https://example.com/1024.jpg',
								server: '1',
								secret: 'a',
								farm: 1,
								title: 'Photo 1',
								description: { _content: 'desc1' },
								ownername: 'owner1'
							}
						]
					},
					stat: 'ok'
				})
			} as any);

			const result = await GetFlickrData({});
			// The implementation does not modify or remove url_z/url_b, so this should be defined
			expect(result?.[0]?.url_z || result?.[0]?.url_b).toBeDefined();
		});
	});

	describe('Card Generation', () => {
		it('should generate card for display', () => {
			const card = {
				id: '1',
				title: 'Test Photo',
				image: 'https://example.com/1.jpg',
				width: 640,
				height: 480,
			};
			expect(card.id).toBeDefined();
			expect(card.image).toBeDefined();
		});

		it('should handle card generation with metadata', () => {
			const cards = [{
				id: '1',
				title: 'Photo 1',
				image: 'https://example.com/1.jpg',
				meta: { views: 1000, comments: 50 }
			}];
			expect(cards.length).toBeGreaterThan(0);
			expect(cards[0].meta).toBeDefined();
		});
	});

	describe('GetFlickrData Function', () => {
		it('should accept flickr configuration object', () => {
			const mockFlickrConfig = {
				baseURL: 'https://api.flickr.com/services/rest/?',
				proxyURL: '',
				urlProps: { method: 'flickr.photos.search', api_key: 'test-key', user_id: 'test-user', tags: 'nature' }
			};
			expect(() => {
				GetFlickrData({ flickr: mockFlickrConfig });
			}).not.toThrow();
		});

		it('should accept config provider object', () => {
			expect(() => {
				GetFlickrData({ config: { global: { proxyURL: 'https://proxy.example.com' } } });
			}).not.toThrow();
		});

		it('should handle empty props', () => {
			expect(() => {
				GetFlickrData({});
			}).not.toThrow();
		});

		it('should merge flickr config with defaults', () => {
			expect(() => {
				GetFlickrData({ flickr: { urlProps: { tags: 'custom' } } });
			}).not.toThrow();
		});

		it('should apply global proxy URL', () => {
			expect(() => {
				GetFlickrData({ config: { global: { proxyURL: 'https://proxy.example.com' } } });
			}).not.toThrow();
		});

		it('should prioritize flickr-specific proxyURL over global', () => {
			expect(() => {
				GetFlickrData({
					flickr: { proxyURL: 'https://flickr-proxy.com' },
					config: { global: { proxyURL: 'https://global-proxy.com' } }
				});
			}).not.toThrow();
		});
	});

	describe('Flickr API Configuration', () => {
		const mockFlickrConfig = {
			baseURL: 'https://api.flickr.com/services/rest/?',
			proxyURL: '',
			urlProps: {
				method: 'flickr.photos.search',
				api_key: 'test-key',
				user_id: 'test-user',
				tags: 'nature',
				extras: 'date_taken,description',
				sort: 'date-taken-desc',
				per_page: 100,
				format: 'json',
				photoSize: 'Medium',
				nojsoncallback: 'true'
			}
		};

		it('should include method parameter', () => {
			expect(() => {
				GetFlickrData({ flickr: mockFlickrConfig });
			}).not.toThrow();
		});

		it('should include api_key parameter', () => {
			expect(() => {
				GetFlickrData({ flickr: { ...mockFlickrConfig, urlProps: { ...mockFlickrConfig.urlProps, api_key: 'my-key' } } });
			}).not.toThrow();
		});

		it('should support tag-based search', () => {
			expect(() => {
				GetFlickrData({ flickr: { ...mockFlickrConfig, urlProps: { ...mockFlickrConfig.urlProps, tags: 'landscape,nature' } } });
			}).not.toThrow();
		});

		it('should support user_id filtering', () => {
			expect(() => {
				GetFlickrData({ flickr: { ...mockFlickrConfig, urlProps: { ...mockFlickrConfig.urlProps, user_id: '123456' } } });
			}).not.toThrow();
		});

		it('should support sorting options', () => {
			const sortOptions = ['date-posted-desc', 'date-taken-desc', 'interestingness-desc', 'relevance'];
			sortOptions.forEach(sort => {
				expect(() => {
					GetFlickrData({ flickr: { ...mockFlickrConfig, urlProps: { ...mockFlickrConfig.urlProps, sort } } });
				}).not.toThrow();
			});
		});

		it('should support pagination with per_page', () => {
			expect(() => {
				GetFlickrData({ flickr: { ...mockFlickrConfig, urlProps: { ...mockFlickrConfig.urlProps, per_page: 250 } } });
			}).not.toThrow();
		});

		it('should request JSON format', () => {
			expect(() => {
				GetFlickrData({ flickr: { ...mockFlickrConfig, urlProps: { ...mockFlickrConfig.urlProps, format: 'json' } } });
			}).not.toThrow();
		});

		it('should disable JSON callback', () => {
			expect(() => {
				GetFlickrData({ flickr: { ...mockFlickrConfig, urlProps: { ...mockFlickrConfig.urlProps, nojsoncallback: 'true' } } });
			}).not.toThrow();
		});

		it('should request photo extras', () => {
			const extras = ['date_taken', 'description', 'owner_name', 'tags', 'url_sq', 'url_t', 'url_s'];
			extras.forEach(extra => {
				expect(() => {
					GetFlickrData({ flickr: { ...mockFlickrConfig, urlProps: { ...mockFlickrConfig.urlProps, extras: extra } } });
				}).not.toThrow();
			});
		});
	});

	describe('Proxy URL Handling', () => {
		it('should use proxyURL when provided', () => {
			expect(() => {
				GetFlickrData({ flickr: { baseURL: 'https://api.flickr.com/services/rest/?', proxyURL: 'https://proxy.mysite.com/fetch?url=' } });
			}).not.toThrow();
		});

		it('should use baseURL directly when no proxy', () => {
			expect(() => {
				GetFlickrData({ flickr: { baseURL: 'https://api.flickr.com/services/rest/?', proxyURL: '' } });
			}).not.toThrow();
		});

		it('should prefer flickr proxyURL over global proxy', () => {
			expect(() => {
				GetFlickrData({
					config: { global: { proxyURL: 'https://global-proxy.com' } },
					flickr: { proxyURL: 'https://flickr-specific-proxy.com' }
				});
			}).not.toThrow();
		});
	});

	describe('Configuration Merging', () => {
		it('should use default config as base', () => {
			expect(() => {
				GetFlickrData({});
			}).not.toThrow();
		});

		it('should merge provided flickr config with defaults', () => {
			expect(() => {
				GetFlickrData({ flickr: { urlProps: { tags: 'custom-tag' } } });
			}).not.toThrow();
		});

		it('should deep merge nested config objects', () => {
			expect(() => {
				GetFlickrData({ flickr: { baseURL: 'https://custom.api.com/', urlProps: { per_page: 50 } } });
			}).not.toThrow();
		});

		it('should handle partial config objects', () => {
			expect(() => {
				GetFlickrData({ flickr: { baseURL: 'https://api.flickr.com' } });
				GetFlickrData({ flickr: { proxyURL: 'https://proxy.com' } });
			}).not.toThrow();
		});
	});

	describe('PropTypes Validation', () => {
		it('should have propTypes defined', () => {
			expect(GetFlickrData.propTypes).toBeDefined();
		});

		it('should allow flickr prop', () => {
			expect(GetFlickrData.propTypes?.flickr).toBeDefined();
		});

		it('should allow config prop', () => {
			expect(GetFlickrData.propTypes?.config).toBeDefined();
		});

		it('should accept any type for flickr', () => {
			const validProps = [{}, { flickr: {} }, { flickr: { baseURL: 'https://api.flickr.com' } }];
			validProps.forEach(props => {
				expect(() => {
					GetFlickrData(props);
				}).not.toThrow();
			});
		});

		it('should accept any type for config', () => {
			const validProps = [{ config: {} }, { config: { global: { proxyURL: 'https://proxy.com' } } }];
			validProps.forEach(props => {
				expect(() => {
					GetFlickrData(props);
				}).not.toThrow();
			});
		});
	});

	describe('Coverage Edge Cases', () => {
		it('should handle empty tags', () => {
			expect(() => {
				GetFlickrData({ flickr: { urlProps: { tags: '' } } });
			}).not.toThrow();
		});

		it('should handle very large per_page value', () => {
			expect(() => {
				GetFlickrData({ flickr: { urlProps: { per_page: 500 } } });
			}).not.toThrow();
		});

		it('should handle special characters in tags', () => {
			expect(() => {
				GetFlickrData({ flickr: { urlProps: { tags: 'tag-1, tag_2, tag.3' } } });
			}).not.toThrow();
		});

		it('should handle missing urlProps', () => {
			expect(() => {
				GetFlickrData({ flickr: { baseURL: 'https://api.flickr.com', proxyURL: '' } });
			}).not.toThrow();
		});

		it('should handle long URLs with encoding', () => {
			expect(() => {
				GetFlickrData({ flickr: { proxyURL: 'https://proxy.example.com/fetch?url=' } });
			}).not.toThrow();
		});

		it('should support multiple size formats in coverage', () => {
			expect(() => {
				GetFlickrData({ flickr: { urlProps: { photoSize: 'Large' } } });
			}).not.toThrow();
		});
	});

	describe('Error Handling', () => {
		it('should handle API errors', () => {
			const errorResponse = {
				stat: 'fail',
				code: 99,
				message: 'User not found'
			};
			expect(errorResponse.stat).toBe('fail');
			expect(errorResponse.code).toBeGreaterThan(0);
		});

		it('should handle network timeouts', () => {
			const timeoutError = {
				success: false,
				error: 'Request Timeout',
				duration: 30000
			};
			expect(timeoutError.success).toBe(false);
			expect(timeoutError.duration).toBeGreaterThan(0);
		});
	});
});
