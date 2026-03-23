import { describe, it, expect } from 'vitest';
import { EXCLUDED_URL_PATTERNS, EXCLUDED_FILE_EXTENSIONS, EXCLUDED_DIRECTORY_NAMES } from '../components/admin/site-health/seo-constants';

describe('SEO Constants', () => {
	it('should export EXCLUDED_URL_PATTERNS array', () => {
		expect(Array.isArray(EXCLUDED_URL_PATTERNS)).toBe(true);
		expect(EXCLUDED_URL_PATTERNS.length).toBeGreaterThan(0);
	});

	it('should include common excluded URL patterns', () => {
		expect(EXCLUDED_URL_PATTERNS.some(p => p.includes('/images'))).toBe(true);
		expect(EXCLUDED_URL_PATTERNS.some(p => p.includes('/api'))).toBe(true);
	});

	it('should export EXCLUDED_FILE_EXTENSIONS regex', () => {
		expect(EXCLUDED_FILE_EXTENSIONS).toBeInstanceOf(RegExp);
		expect(EXCLUDED_FILE_EXTENSIONS.test('image.jpg')).toBe(true);
		expect(EXCLUDED_FILE_EXTENSIONS.test('photo.png')).toBe(true);
	});

	it('should exclude video files', () => {
		expect(EXCLUDED_FILE_EXTENSIONS.test('video.mp4')).toBe(true);
	});

	it('should export EXCLUDED_DIRECTORY_NAMES array', () => {
		expect(Array.isArray(EXCLUDED_DIRECTORY_NAMES)).toBe(true);
		expect(EXCLUDED_DIRECTORY_NAMES.length).toBeGreaterThan(0);
	});

	it('should include common excluded directories', () => {
		expect(EXCLUDED_DIRECTORY_NAMES.includes('images')).toBe(true);
		expect(EXCLUDED_DIRECTORY_NAMES.includes('css')).toBe(true);
		expect(EXCLUDED_DIRECTORY_NAMES.includes('js')).toBe(true);
	});
});
