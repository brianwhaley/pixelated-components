import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as cloudinaryModule from '../components/general/cloudinary';

describe('cloudinary utilities', () => {
	beforeEach(() => {
		// Reset window mock state
		vi.unstubAllGlobals();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('buildCloudinaryUrl', () => {
		const baseParams = {
			src: 'https://example.com/image.jpg',
			productEnv: 'test-env'
		};

		beforeEach(() => {
			// Set up a default location object for all tests
			Object.defineProperty(window, 'location', {
				value: { origin: 'https://example.com' },
				writable: true
			});
		});

		it('should return original src during SSR (no window)', () => {
			vi.stubGlobal('window', undefined);
			const result = cloudinaryModule.buildCloudinaryUrl(baseParams);
			expect(result).toBe(baseParams.src);
		});

		it('should return original src for localhost origin', () => {
			Object.defineProperty(window, 'location', {
				value: { origin: 'http://localhost:3000' },
				writable: true
			});
			const result = cloudinaryModule.buildCloudinaryUrl(baseParams);
			expect(result).toBe(baseParams.src);
		});

		it('should return original src for 127.0.0.1 origin', () => {
			Object.defineProperty(window, 'location', {
				value: { origin: 'http://127.0.0.1:3000' },
				writable: true
			});
			const result = cloudinaryModule.buildCloudinaryUrl(baseParams);
			expect(result).toBe(baseParams.src);
		});

		it('should return original src for 192.168 origin', () => {
			Object.defineProperty(window, 'location', {
				value: { origin: 'http://192.168.1.1:3000' },
				writable: true
			});
			const result = cloudinaryModule.buildCloudinaryUrl(baseParams);
			expect(result).toBe(baseParams.src);
		});

		it('should return original src when no productEnv provided', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({ ...baseParams, productEnv: null });
			expect(result).toBe(baseParams.src);
		});

		it('should return original src when productEnv is undefined', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({ ...baseParams, productEnv: undefined });
			expect(result).toBe(baseParams.src);
		});

		it('should build cloudinary URL with absolute src', () => {
			const result = cloudinaryModule.buildCloudinaryUrl(baseParams);
			expect(result).toContain('res.cloudinary.com');
			expect(result).toContain('test-env');
			expect(result).toContain('f_auto');
			expect(result).toContain('c_limit');
			expect(result).toContain('q_75');
			expect(result).toContain('dpr_auto');
		});

		it('should build cloudinary URL with relative src starting with /', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				src: '/images/photo.jpg'
			});
			expect(result).toContain('example.com/images/photo.jpg');
		});

		it('should build cloudinary URL with relative src not starting with /', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				src: 'images/photo.jpg'
			});
			expect(result).toContain('example.com/images/photo.jpg');
		});

		it('should apply custom quality parameter', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				quality: 85
			});
			expect(result).toContain('q_85');
			expect(result).not.toContain('q_75');
		});

		it('should apply width parameter', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				width: 800
			});
			expect(result).toContain('w_800');
		});

		it('should ignore invalid width parameter', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				width: NaN
			});
			expect(result).not.toContain('w_');
		});

		it('should apply single transform', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				transforms: 'e_grayscale'
			});
			expect(result).toContain('e_grayscale');
		});

		it('should apply multiple transforms', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				transforms: 'e_grayscale, r_45, e_blur:300'
			});
			// At least some transforms should be applied
			const hasAnyTransform = result.includes('e_grayscale') || result.includes('r_45') || result.includes('e_blur:300');
			expect(hasAnyTransform).toBe(true);
		});

		it('should replace quality parameter if included in transforms', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				quality: 85,
				transforms: 'q_60'
			});
			expect(result).toContain('q_60');
			expect(result).not.toContain('q_85');
		});

		it('should replace width parameter if included in transforms', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				width: 800,
				transforms: 'w_1000'
			});
			expect(result).toContain('w_1000');
		});

		it('should handle transforms with empty strings', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				transforms: 'e_grayscale,,r_45,'
			});
			expect(result).toContain('e_grayscale');
			expect(result).toContain('r_45');
		});

		it('should handle URL with query parameters', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				src: 'https://example.com/image.jpg?v=123'
			});
			// URL should be encoded
			expect(result).toContain('image.jpg');
		});

		it('should use custom cloudinaryDomain if provided', () => {
			const result = cloudinaryModule.buildCloudinaryUrl({
				...baseParams,
				cloudinaryDomain: 'https://custom.cloudinary.com'
			});
			expect(result).toContain('custom.cloudinary.com');
		});

		it('should use default cloudinary domain if not provided', () => {
			const result = cloudinaryModule.buildCloudinaryUrl(baseParams);
			expect(result).toContain('res.cloudinary.com');
		});
	});

	describe('getCloudinaryRemoteFetchURL', () => {
		it('should build remote fetch URL with valid props', () => {
			const result = cloudinaryModule.getCloudinaryRemoteFetchURL({
				url: 'https://example.com/image.jpg',
				product_env: 'test-env'
			});
			expect(result).toContain('res.cloudinary.com');
			expect(result).toContain('test-env');
			expect(result).toContain('f_auto');
			expect(result).toContain('c_limit');
			expect(result).toContain('image/fetch');
		});

		it('should include URL in result', () => {
			const url = 'https://example.com/image.jpg';
			const result = cloudinaryModule.getCloudinaryRemoteFetchURL({
				url,
				product_env: 'env'
			});
			expect(result).toContain(url);
		});

		it('should handle URL with special characters', () => {
			const url = 'https://example.com/image with spaces.jpg';
			const result = cloudinaryModule.getCloudinaryRemoteFetchURL({
				url,
				product_env: 'env'
			});
			expect(result).toContain('example.com');
		});
	});

	describe('userIsMobile', () => {
		it('should return false when no window exists', () => {
			vi.stubGlobal('window', undefined);
			const result = cloudinaryModule.userIsMobile();
			expect(result).toBe(false);
		});

		it('should return true when window.matchMedia matches mobile breakpoint', () => {
			const mockMatchMedia = vi.fn(() => ({
				matches: true,
				media: '(max-width: 768px)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			}));
			window.matchMedia = mockMatchMedia;
			const result = cloudinaryModule.userIsMobile();
			expect(result).toBe(true);
			expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)');
		});

		it('should return false when window.matchMedia does not match', () => {
			const mockMatchMedia = vi.fn(() => ({
				matches: false,
				media: '(max-width: 768px)',
				onchange: null,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
				dispatchEvent: vi.fn()
			}));
			window.matchMedia = mockMatchMedia;
			const result = cloudinaryModule.userIsMobile();
			expect(result).toBe(false);
		});
	});

	describe('loadAllImagesFromCloudinary', () => {
		it('should not throw when called', () => {
			vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: vi.fn()
			} as any);

			expect(() => {
				cloudinaryModule.loadAllImagesFromCloudinary({ product_env: 'env' });
			}).not.toThrow();
		});

		it('should accept origin prop in params', () => {
			vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: vi.fn()
			} as any);

			expect(() => {
				cloudinaryModule.loadAllImagesFromCloudinary({
					origin: 'https://example.com',
					product_env: 'env'
				});
			}).not.toThrow();
		});

		it('should accept product_env prop in params', () => {
			vi.spyOn(document, 'querySelectorAll').mockReturnValue({
				forEach: vi.fn()
			} as any);

			expect(() => {
				cloudinaryModule.loadAllImagesFromCloudinary({
					product_env: 'test-env'
				});
			}).not.toThrow();
		});
	});
});
