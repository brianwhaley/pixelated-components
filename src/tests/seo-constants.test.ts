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

	describe('EXCLUDED_URL_PATTERNS - Extended Coverage', () => {
		it('should export EXCLUDED_URL_PATTERNS array', () => {
			expect(EXCLUDED_URL_PATTERNS).toBeDefined();
			expect(Array.isArray(EXCLUDED_URL_PATTERNS)).toBe(true);
		});

		it('should contain common exclusion patterns', () => {
			expect(EXCLUDED_URL_PATTERNS).toContain('/images');
			expect(EXCLUDED_URL_PATTERNS).toContain('/css/');
			expect(EXCLUDED_URL_PATTERNS).toContain('/js/');
			expect(EXCLUDED_URL_PATTERNS).toContain('/api/');
		});

		it('should have multiple patterns', () => {
			expect(EXCLUDED_URL_PATTERNS.length).toBeGreaterThan(5);
		});

		it('should all be strings', () => {
			EXCLUDED_URL_PATTERNS.forEach(pattern => {
				expect(typeof pattern).toBe('string');
			});
		});

		it('should exclude common file types', () => {
			const hasImagePattern = EXCLUDED_URL_PATTERNS.some(p => p.includes('/images'));
			const hasApiPattern = EXCLUDED_URL_PATTERNS.some(p => p.includes('/api'));
			expect(hasImagePattern || hasApiPattern).toBe(true);
		});

		it('should include sitemap and robots patterns', () => {
			const patterns = EXCLUDED_URL_PATTERNS.join('|');
			expect(patterns).toContain('sitemap');
			expect(patterns).toContain('robots');
		});

		it('should handle feed patterns', () => {
			const hasFeed = EXCLUDED_URL_PATTERNS.some(p => p.includes('feed') || p.includes('rss'));
			expect(hasFeed).toBe(true);
		});

		it('should handle WordPress admin paths', () => {
			const hasWpAdmin = EXCLUDED_URL_PATTERNS.some(p => p.includes('wp-admin') || p.includes('wp-content'));
			expect(hasWpAdmin).toBe(true);
		});
	});

	describe('EXCLUDED_FILE_EXTENSIONS - Extended Coverage', () => {
		it('should export EXCLUDED_FILE_EXTENSIONS regex', () => {
			expect(EXCLUDED_FILE_EXTENSIONS).toBeDefined();
			expect(EXCLUDED_FILE_EXTENSIONS instanceof RegExp).toBe(true);
		});

		it('should match image files', () => {
			expect(EXCLUDED_FILE_EXTENSIONS.test('file.jpg')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('image.png')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('graphic.gif')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('icon.svg')).toBe(true);
		});

		it('should match style files', () => {
			expect(EXCLUDED_FILE_EXTENSIONS.test('style.css')).toBe(true);
		});

		it('should match script files', () => {
			expect(EXCLUDED_FILE_EXTENSIONS.test('app.js')).toBe(true);
		});

		it('should match font files', () => {
			expect(EXCLUDED_FILE_EXTENSIONS.test('font.woff')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('font.ttf')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('font.eot')).toBe(true);
		});

		it('should match media files', () => {
			expect(EXCLUDED_FILE_EXTENSIONS.test('video.mp4')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('audio.mp3')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('movie.avi')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('clip.mov')).toBe(true);
		});

		it('should match document files', () => {
			expect(EXCLUDED_FILE_EXTENSIONS.test('document.pdf')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('sheet.xlsx')).toBe(true);
		});

		it('should match archive files', () => {
			expect(EXCLUDED_FILE_EXTENSIONS.test('archive.zip')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('compressed.rar')).toBe(true);
		});

		it('should be case insensitive', () => {
			expect(EXCLUDED_FILE_EXTENSIONS.test('IMAGE.JPG')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('Style.CSS')).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS.test('Font.WOFF2')).toBe(true);
		});
	});

	describe('EXCLUDED_DIRECTORY_NAMES - Extended Coverage', () => {
		it('should export EXCLUDED_DIRECTORY_NAMES array', () => {
			expect(EXCLUDED_DIRECTORY_NAMES).toBeDefined();
			expect(Array.isArray(EXCLUDED_DIRECTORY_NAMES)).toBe(true);
		});

		it('should contain common directory names', () => {
			expect(EXCLUDED_DIRECTORY_NAMES).toContain('images');
			expect(EXCLUDED_DIRECTORY_NAMES).toContain('css');
			expect(EXCLUDED_DIRECTORY_NAMES).toContain('js');
			expect(EXCLUDED_DIRECTORY_NAMES).toContain('assets');
		});

		it('should all be strings', () => {
			EXCLUDED_DIRECTORY_NAMES.forEach(dir => {
				expect(typeof dir).toBe('string');
			});
		});

		it('should have reasonable count', () => {
			expect(EXCLUDED_DIRECTORY_NAMES.length).toBeGreaterThanOrEqual(5);
		});

		it('should only contain lowercase names', () => {
			EXCLUDED_DIRECTORY_NAMES.forEach(dir => {
				expect(dir).toBe(dir.toLowerCase());
			});
		});

		it('should not have duplicate entries', () => {
			const unique = new Set(EXCLUDED_DIRECTORY_NAMES);
			expect(unique.size).toBe(EXCLUDED_DIRECTORY_NAMES.length);
		});

		it('should handle media directories', () => {
			const hasMedia = EXCLUDED_DIRECTORY_NAMES.some(d => 
				d.includes('media') || d.includes('images')
			);
			expect(hasMedia).toBe(true);
		});

		it('should handle static asset directories', () => {
			const hasStatic = EXCLUDED_DIRECTORY_NAMES.some(d =>
				d.includes('static') || d.includes('assets')
			);
			expect(hasStatic).toBe(true);
		});
	});

	describe('Integration Tests', () => {
		it('should have all three exports defined', () => {
			expect(EXCLUDED_URL_PATTERNS).toBeDefined();
			expect(EXCLUDED_FILE_EXTENSIONS).toBeDefined();
			expect(EXCLUDED_DIRECTORY_NAMES).toBeDefined();
		});

		it('should have correct types for all exports', () => {
			expect(Array.isArray(EXCLUDED_URL_PATTERNS)).toBe(true);
			expect(EXCLUDED_FILE_EXTENSIONS instanceof RegExp).toBe(true);
			expect(Array.isArray(EXCLUDED_DIRECTORY_NAMES)).toBe(true);
		});

		it('should have non-empty collections', () => {
			expect(EXCLUDED_URL_PATTERNS.length).toBeGreaterThan(0);
			expect(EXCLUDED_DIRECTORY_NAMES.length).toBeGreaterThan(0);
		});

		it('should work together for URL filtering', () => {
			const testUrl = '/assets/css/style.css';
			const urlMatches = EXCLUDED_URL_PATTERNS.some(p => testUrl.includes(p));
			const extMatches = EXCLUDED_FILE_EXTENSIONS.test(testUrl);
			
			// Should match by extension if nothing else
			expect(extMatches).toBe(true);
		});
	});
});
