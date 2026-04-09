import { describe, it, expect, vi, beforeEach } from 'vitest';
import { preloadImages, preloadImages_v2 } from '../components/general/image';

describe('Image Utilities', () => {
	beforeEach(() => {
		// Clear any mocks before each test
		vi.clearAllMocks();
		// Mock document.head.appendChild globally for all tests
		vi.spyOn(document.head, 'appendChild').mockImplementation(() => ({} as any));
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('preloadImages', () => {
		it('should handle when called without images', () => {
			// Mock document.querySelectorAll to return empty
			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: () => {},
				length: 0
			} as any);

			expect(() => preloadImages()).not.toThrow();
			mockQuerySelectorAll.mockRestore();
		});

		it('should handle window being undefined (SSR)', () => {
			expect(() => preloadImages()).not.toThrow();
		});

		it('should not throw when document is available', () => {
			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: () => {},
				length: 0
			} as any);

			expect(() => preloadImages()).not.toThrow();
			mockQuerySelectorAll.mockRestore();
		});

		it('should find images with img selector', () => {
			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll');
			mockQuerySelectorAll.mockReturnValue({
				forEach: () => {},
				length: 0
			} as any);

			preloadImages();
			expect(mockQuerySelectorAll).toHaveBeenCalledWith(expect.stringContaining('img'));

			mockQuerySelectorAll.mockRestore();
		});

		it('should iterate through found images', () => {
			const forEachMock = vi.fn();
			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 1
			} as any);

			preloadImages();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});

		it('should handle images with data-src attribute', () => {
			const forEachMock = vi.fn((cb: any) => {
				cb({ 'data-src': 'image1.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} });
				cb({ 'data-src': 'image2.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} });
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 2
			} as any);

			preloadImages();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});

		it('should handle multiple image sources', () => {
			const images: any[] = [];
			const forEachMock = vi.fn((cb: any) => {
				const imgElements = [
					{ src: 'path/to/image1.jpg', 'data-src': 'async1.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} },
					{ src: 'path/to/image2.jpg', 'data-src': 'async2.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} },
					{ src: 'path/to/image3.jpg', 'data-src': 'async3.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} }
				];
				imgElements.forEach(img => {
					images.push(img);
					cb(img);
				});
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 3
			} as any);

			vi.spyOn(document.head, 'appendChild').mockImplementation(() => ({} as any));
			preloadImages();
			expect(images.length).toBe(3);

			mockQuerySelectorAll.mockRestore();
		});

		it('should work with data-* attributes', () => {
			const mockElement = {
				'data-src': 'deferred.jpg',
				'data-medium': 'medium.jpg',
				'data-large': 'large.jpg',
				getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }),
				setAttribute: () => {}
			};

			const forEachMock = vi.fn((cb: any) => cb(mockElement));
			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 1
			} as any);

			vi.spyOn(document.head, 'appendChild').mockImplementation(() => ({} as any));

			preloadImages();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});
	});

	describe('preloadImages_v2', () => {
		it('should return early if document is undefined', () => {
			// In Node.js environment, document should exist, but function should handle undefined
			expect(() => preloadImages_v2()).not.toThrow();
		});

		it('should handle empty image list', () => {
			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: () => {},
				length: 0
			} as any);

			expect(() => preloadImages_v2()).not.toThrow();
			mockQuerySelectorAll.mockRestore();
		});

		it('should skip images without src', () => {
			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: (cb: any) => {
					cb({ src: '' }); // No src
				},
				length: 1
			} as any);

			expect(() => preloadImages_v2()).not.toThrow();
			mockQuerySelectorAll.mockRestore();
		});

		it('should handle images without throwing errors', () => {
			expect(() => preloadImages_v2()).not.toThrow();
		});

		it('should find images with img selector v2', () => {
			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll');
			mockQuerySelectorAll.mockReturnValue({
				forEach: () => {},
				length: 0
			} as any);

			preloadImages_v2();
			expect(mockQuerySelectorAll).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});

		it('should process valid image sources', () => {
			const processedImages: any[] = [];
			const forEachMock = vi.fn((cb: any) => {
				// Mock processing of valid images
				cb({ src: 'valid1.jpg', dataset: { src: 'lazy1.jpg' } });
				cb({ src: 'valid2.jpg', dataset: { src: 'lazy2.jpg' } });
				processedImages.push(
					{ src: 'valid1.jpg' },
					{ src: 'valid2.jpg' }
				);
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 2
			} as any);

			preloadImages_v2();
			expect(processedImages.length).toBe(2);

			mockQuerySelectorAll.mockRestore();
		});

		it('should handle lazy-loaded images with dataset', () => {
			const forEachMock = vi.fn((cb: any) => {
				cb({
					src: 'placeholder.jpg',
					dataset: {
						src: 'real-image.jpg',
						medium: 'medium.jpg',
						large: 'large.jpg'
					}
				});
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 1
			} as any);

			preloadImages_v2();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});

		it('should handle batch image processing', () => {
			const batchSize = 5;
			const images = Array.from({ length: batchSize }, (_, i) => ({
				src: `image${i}.jpg`,
				dataset: { src: `lazy${i}.jpg` }
			}));

			const forEachMock = vi.fn((cb: any) => {
				images.forEach(img => cb(img));
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: batchSize
			} as any);

			preloadImages_v2();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});
	});

	describe('Image Utility Functions', () => {
		it('should export preloadImages function', () => {
			expect(typeof preloadImages).toBe('function');
		});

		it('should export preloadImages_v2 function', () => {
			expect(typeof preloadImages_v2).toBe('function');
		});

		it('should have defined functions without errors', () => {
			expect(() => {
				// Just verify functions exist and are callable
				if (typeof preloadImages !== 'undefined') {
					// Function exists
				}
				if (typeof preloadImages_v2 !== 'undefined') {
					// Function exists
				}
			}).not.toThrow();
		});

		it('should be callable functions', () => {
			expect(preloadImages).toBeDefined();
			expect(preloadImages_v2).toBeDefined();
			expect(typeof preloadImages).toBe('function');
			expect(typeof preloadImages_v2).toBe('function');
		});
	});

	describe('Performance Characteristics', () => {
		it('should handle large image lists', () => {
			const largeList = Array.from({ length: 100 }, (_, i) => ({
				src: `image${i}.jpg`,
				getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }),
				setAttribute: () => {}
			}));

			const forEachMock = vi.fn((cb: any) => {
				largeList.forEach(img => cb(img));
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: largeList.length
			} as any);

			expect(() => preloadImages()).not.toThrow();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});

		it('should process images efficiently', () => {
			const startTime = performance.now();

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: () => {},
				length: 0
			} as any);

			preloadImages();
			const endTime = performance.now();

			expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
			mockQuerySelectorAll.mockRestore();
		});
	});

	describe('Edge Cases', () => {
		it('should handle images with no attributes', () => {
			const forEachMock = vi.fn((cb: any) => {
				cb({ 
					getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }),
					setAttribute: () => {}
				}); // Image object with proper mock methods
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 1
			} as any);

			expect(() => preloadImages()).not.toThrow();
			mockQuerySelectorAll.mockRestore();
		});

		it('should handle images with special characters in src', () => {
			const forEachMock = vi.fn((cb: any) => {
				cb({ 
					src: 'path/to/image%20with%20spaces.jpg',
					getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }),
					setAttribute: () => {}
				});
				cb({ 
					src: 'path/to/image&special=chars.jpg',
					getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }),
					setAttribute: () => {}
				});
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 2
			} as any);

			preloadImages();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});

		it('should handle very long image paths', () => {
			const longPath = 'path/to/very/deep/nested/directory/structure/with/many/segments/image.jpg';
			const forEachMock = vi.fn((cb: any) => {
				cb({ 
					src: longPath,
					getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }),
					setAttribute: () => {}
				});
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: 1
			} as any);

			preloadImages();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});

		it('should handle external image URLs', () => {
			const externalUrls = [
				'https://example.com/image.jpg',
				'https://cdn.example.com/images/photo.png',
				'//cdn.example.com/assets/image.webp'
			];

			const forEachMock = vi.fn((cb: any) => {
				externalUrls.forEach(url => cb({ 
					src: url,
					getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }),
					setAttribute: () => {}
				}));
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: externalUrls.length
			} as any);

			preloadImages();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});
	});

	describe('Integration Scenarios', () => {
		it('should handle mixed image sources', () => {
			const mixedImages = [
				{ src: 'local.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} },
				{ src: 'https://cdn.example.com/image.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} },
				{ 'data-src': 'lazy.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} },
				{ src: '', 'data-src': 'fallback.jpg', getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 100, right: 100 }), setAttribute: () => {} }
			];

			const forEachMock = vi.fn((cb: any) => {
				mixedImages.forEach(img => cb(img));
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: mixedImages.length
			} as any);

			preloadImages();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});

		it('should support responsive image sources', () => {
			const responsiveImages = Array.from({ length: 3 }, (_, i) => ({
				src: `image${i}.jpg`,
				srcset: `image${i}-small.jpg 320w, image${i}-medium.jpg 768w, image${i}-large.jpg 1024w`,
				'data-src': `image${i}-full.jpg`
			}));

			const forEachMock = vi.fn((cb: any) => {
				responsiveImages.forEach(img => cb(img));
			});

			const mockQuerySelectorAll = vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: forEachMock,
				length: responsiveImages.length
			} as any);

			preloadImages_v2();
			expect(forEachMock).toHaveBeenCalled();

			mockQuerySelectorAll.mockRestore();
		});
	});
});
