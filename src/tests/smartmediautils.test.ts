import { describe, it, expect } from 'vitest';
import { parseNumber, safeString, sanitizeMediaString, normalizeProtocolRelativeUrl, isVideoUrl, deriveMediaId } from '@/components/general/smartmediautils';

describe('SmartMediaUtils', () => {
	describe('parseNumber', () => {
		it('parses positive numeric strings', () => {
			expect(parseNumber('42')).toBe(42);
		});

		it('returns undefined for non-numeric strings', () => {
			expect(parseNumber('abc')).toBeUndefined();
		});

		it('returns undefined for zero or negative values', () => {
			expect(parseNumber('0')).toBeUndefined();
			expect(parseNumber(-5)).toBeUndefined();
		});
	});

	describe('safeString', () => {
		it('returns string values unchanged', () => {
			expect(safeString('hello')).toBe('hello');
		});

		it('returns undefined for null and undefined', () => {
			expect(safeString(null)).toBeUndefined();
			expect(safeString(undefined)).toBeUndefined();
		});
	});

	describe('sanitizeMediaString', () => {
		it('normalizes text to a slug-like string', () => {
			expect(sanitizeMediaString('Hello World!')).toBe('hello-world');
		});

		it('removes leading and trailing punctuation', () => {
			expect(sanitizeMediaString('---Test***')).toBe('test');
		});
	});

	describe('normalizeProtocolRelativeUrl', () => {
		it('prepends https to protocol-relative URLs', () => {
			expect(normalizeProtocolRelativeUrl('//example.com/video.mp4')).toBe('https://example.com/video.mp4');
		});

		it('leaves absolute URLs unchanged', () => {
			expect(normalizeProtocolRelativeUrl('https://example.com/video.mp4')).toBe('https://example.com/video.mp4');
		});
	});

	describe('isVideoUrl', () => {
		it('detects mp4 and webm video extensions', () => {
			expect(isVideoUrl('https://example.com/video.mp4')).toBe(true);
			expect(isVideoUrl('https://example.com/video.webm')).toBe(true);
		});

		it('returns false for image URLs', () => {
			expect(isVideoUrl('https://example.com/image.jpg')).toBe(false);
		});
	});

	describe('deriveMediaId', () => {
		it('prefers explicit id over other values', () => {
			expect(deriveMediaId({ id: 'explicit', name: 'foo', title: 'bar', src: 'https://example.com/video.mp4' })).toBe('explicit');
		});

		it('falls back to sanitized src filename when no id or title is provided', () => {
			expect(deriveMediaId({ src: 'https://example.com/path/video.mp4' })).toBe('video');
		});
	});
});
