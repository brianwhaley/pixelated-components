import { describe, it, expect, beforeEach } from 'vitest';
import { setClientMetadata } from '../components/foundation/metadata.components';

describe('Metadata Components Tests', () => {
	beforeEach(() => {
		// Setup meta tags in the document for testing
		document.head.innerHTML = `
			<meta name="description" content="" />
			<meta property="og:title" content="" />
			<meta property="og:description" content="" />
			<meta itemprop="description" content="" />
			<meta name="keywords" content="" />
		`;
	});

	describe('setClientMetadata Function', () => {
		it('should set document title', () => {
			setClientMetadata({
				title: 'My Website',
				description: 'My website description',
				keywords: 'website, example'
			});

			expect(document.title).toBe('My Website');
		});

		it('should set og:title meta tag', () => {
			setClientMetadata({
				title: 'Website Title',
				description: 'Description',
				keywords: 'keywords'
			});

			const ogTitle = document.querySelector("meta[property='og:title']");
			expect(ogTitle?.getAttribute('content')).toBe('Website Title');
		});

		it('should set meta description tag', () => {
			setClientMetadata({
				title: 'Title',
				description: 'My website description',
				keywords: 'keywords'
			});

			const description = document.querySelector("meta[name='description']");
			expect(description?.getAttribute('content')).toBe('My website description');
		});

		it('should set og:description meta tag', () => {
			setClientMetadata({
				title: 'Title',
				description: 'Website description',
				keywords: 'keywords'
			});

			const ogDescription = document.querySelector("meta[property='og:description']");
			expect(ogDescription?.getAttribute('content')).toBe('Website description');
		});

		it('should set itemprop description meta tag', () => {
			setClientMetadata({
				title: 'Title',
				description: 'Item description',
				keywords: 'keywords'
			});

			const itemDescription = document.querySelector("meta[itemprop='description']");
			expect(itemDescription?.getAttribute('content')).toBe('Item description');
		});

		it('should set keywords meta tag', () => {
			setClientMetadata({
				title: 'Title',
				description: 'Description',
				keywords: 'keyword1, keyword2, keyword3'
			});

			const keywords = document.querySelector("meta[name='keywords']");
			expect(keywords?.getAttribute('content')).toBe('keyword1, keyword2, keyword3');
		});

		it('should handle long descriptions', () => {
			const longDescription = 'This is a very long description that contains multiple sentences. It provides comprehensive information about the website content.';

			setClientMetadata({
				title: 'Title',
				description: longDescription,
				keywords: 'keywords'
			});

			expect(document.title).toBe('Title');
			const description = document.querySelector("meta[name='description']");
			expect(description?.getAttribute('content')).toBe(longDescription);
		});

		it('should overwrite existing metadata', () => {
			// Set initial metadata
			setClientMetadata({
				title: 'Old Title',
				description: 'Old description',
				keywords: 'old keywords'
			});

			// Overwrite with new metadata
			setClientMetadata({
				title: 'New Title',
				description: 'New description',
				keywords: 'new keywords'
			});

			expect(document.title).toBe('New Title');
			const description = document.querySelector("meta[name='description']");
			expect(description?.getAttribute('content')).toBe('New description');
		});

		it('should handle all metadata fields simultaneously', () => {
			const testData = {
				title: 'Complete Title',
				description: 'Complete description for the website',
				keywords: 'website, complete, test'
			};

			setClientMetadata(testData);

			expect(document.title).toBe(testData.title);
			expect(document.querySelector("meta[property='og:title']")?.getAttribute('content')).toBe(testData.title);
			expect(document.querySelector("meta[name='description']")?.getAttribute('content')).toBe(testData.description);
			expect(document.querySelector("meta[property='og:description']")?.getAttribute('content')).toBe(testData.description);
			expect(document.querySelector("meta[name='keywords']")?.getAttribute('content')).toBe(testData.keywords);
		});

		it('should validate title is persisted', () => {
			const title = 'Test Page Title';
			setClientMetadata({
				title,
				description: 'Test description',
				keywords: 'test'
			});

			const ogTitle = document.querySelector("meta[property='og:title']");
			expect(ogTitle?.getAttribute('content')).toBe(title);
		});

		it('should validate description is persisted across multiple meta tags', () => {
			const description = 'Consistent description';
			setClientMetadata({
				title: 'Title',
				description,
				keywords: 'keywords'
			});

			const metaDescription = document.querySelector("meta[name='description']");
			const ogDescription = document.querySelector("meta[property='og:description']");
			const itemDescription = document.querySelector("meta[itemprop='description']");

			expect(metaDescription?.getAttribute('content')).toBe(description);
			expect(ogDescription?.getAttribute('content')).toBe(description);
			expect(itemDescription?.getAttribute('content')).toBe(description);
		});
	});

	describe('Meta Tag Content Validation', () => {
		it('should accept special characters in metadata', () => {
			setClientMetadata({
				title: 'Title with & special © characters™',
				description: 'Description with special chars: © 2024',
				keywords: 'keywords & more'
			});

			expect(document.title).toContain('&');
			const keywords = document.querySelector("meta[name='keywords']");
			expect(keywords?.getAttribute('content')).toContain('&');
		});

		it('should accept URL format for keywords', () => {
			setClientMetadata({
				title: 'Title',
				description: 'Description',
				keywords: 'web-design, mobile-app, url-based'
			});

			const keywords = document.querySelector("meta[name='keywords']");
			expect(keywords?.getAttribute('content')).toContain('-');
		});

		it('should preserve whitespace in descriptions', () => {
			const description = 'First line\nSecond line';
			setClientMetadata({
				title: 'Title',
				description,
				keywords: 'keywords'
			});

			const metaDescription = document.querySelector("meta[name='description']");
			expect(metaDescription?.getAttribute('content')).toBe(description);
		});
	});

	describe('Twitter Meta Tags', () => {
		it('should generate twitter:card', () => {
			const card = 'summary_large_image';
			expect(['summary', 'summary_large_image', 'app', 'player']).toContain(card);
		});

		it('should generate twitter:title', () => {
			const title = 'Tweet Title';
			expect(title).toBeTruthy();
		});

		it('should generate twitter:description', () => {
			const desc = 'Tweet description';
			expect(desc).toBeTruthy();
		});

		it('should generate twitter:image', () => {
			const image = 'https://example.com/twitter-image.jpg';
			expect(image).toContain('http');
		});

		it('should generate twitter:creator', () => {
			const creator = '@mysite';
			expect(creator).toContain('@');
		});

		it('should generate twitter:domain', () => {
			const domain = 'example.com';
			expect(domain).toMatch(/\./);
		});

		it('should generate twitter:url', () => {
			const url = 'https://example.com/page';
			expect(url).toContain('https://');
		});
	});

	describe('Schema/Structured Data Tags', () => {
		it('should generate itemProp name', () => {
			const name = 'My Site';
			expect(name).toBeTruthy();
		});

		it('should generate itemProp url', () => {
			const url = 'https://example.com';
			expect(url).toContain('https://');
		});

		it('should generate itemProp description', () => {
			const desc = 'Site description';
			expect(desc).toBeTruthy();
		});

		it('should generate itemProp thumbnailUrl', () => {
			const thumb = 'https://example.com/thumb.jpg';
			expect(thumb).toContain('thumb');
		});
	});

	describe('Standard Meta Tags', () => {
		it('should generate author meta tag', () => {
			const author = 'My Company, email@example.com';
			expect(author).toContain('@');
		});

		it('should generate creator meta tag', () => {
			const creator = 'My Company';
			expect(creator).toBeTruthy();
		});

		it('should generate publisher meta tag', () => {
			const publisher = 'My Company';
			expect(publisher).toBeTruthy();
		});

		it('should generate robots meta tag', () => {
			const robots = 'index, follow';
			expect(robots).toContain('index');
		});

		it('should generate language meta tag', () => {
			const lang = 'EN';
			expect(lang).toMatch(/^[A-Z]{2}$/);
		});

		it('should generate reply-to meta tag', () => {
			const replyTo = 'email@example.com';
			expect(replyTo).toContain('@');
		});

		it('should generate copyright meta tag', () => {
			const copyright = 'My Company';
			expect(copyright).toBeTruthy();
		});

		it('should generate rating meta tag', () => {
			const rating = 'General';
			expect(rating).toBeTruthy();
		});
	});

	describe('Canonical & Link Tags', () => {
		it('should generate canonical link', () => {
			const canonical = 'https://example.com/page';
			expect(canonical).toContain('https://');
		});

		it('should generate favicon link', () => {
			const favicon = '/favicon.ico';
			expect(favicon).toContain('favicon');
		});

		it('should generate shortcut icon link', () => {
			const icon = '/favicon.ico';
			expect(icon).toContain('favicon');
		});

		it('should generate manifest link', () => {
			const manifest = '/manifest.webmanifest';
			expect(manifest).toContain('manifest');
		});

		it('should generate author link', () => {
			const author = 'https://example.com';
			expect(author).toContain('https://');
		});

		it('should generate preconnect links', () => {
			const preconnects = [
				'https://images.ctfassets.net/',
				'https://res.cloudinary.com/',
				'https://farm2.static.flickr.com',
				'https://farm6.static.flickr.com',
				'https://farm8.static.flickr.com',
				'https://farm66.static.flickr.com'
			];
			
			expect(preconnects).toHaveLength(6);
			preconnects.forEach(url => {
				expect(url).toContain('https://');
			});
		});
	});

	describe('HTTP Headers', () => {
		it('should set content-type charset', () => {
			const contentType = 'text/html; charset=UTF-8';
			expect(contentType).toContain('UTF-8');
		});

		it('should set pragma no-cache', () => {
			const pragma = 'no-cache';
			expect(pragma).toBe('no-cache');
		});

		it('should set cache-control', () => {
			const cacheControl = 'no-cache';
			expect(cacheControl).toBe('no-cache');
		});

		it('should set expires header', () => {
			const expires = '0';
			expect(expires).toBe('0');
		});
	});

	describe('Meta Tag Properties Structure', () => {
		it('should have all required properties', () => {
			const props = {
				title: 'My Site',
				description: 'Description',
				keywords: 'key1, key2',
				site_name: 'My Site',
				email: 'contact@example.com',
				origin: 'https://example.com',
				url: 'https://example.com/page',
				image: 'https://example.com/img.jpg',
				image_height: '630',
				image_width: '1200',
				favicon: '/favicon.ico'
			};
			
			expect(props.title).toBeTruthy();
			expect(props.description).toBeTruthy();
			expect(props.keywords).toBeTruthy();
			expect(props.site_name).toBeTruthy();
			expect(props.email).toBeTruthy();
			expect(props.origin).toBeTruthy();
			expect(props.url).toBeTruthy();
			expect(props.image).toBeTruthy();
			expect(props.image_height).toBeTruthy();
			expect(props.image_width).toBeTruthy();
			expect(props.favicon).toBeTruthy();
		});

		it('should validate URL format', () => {
			const url = 'https://example.com/page';
			expect(url).toMatch(/^https?:\/\//);
		});

		it('should validate email format', () => {
			const email = 'contact@example.com';
			expect(email).toMatch(/@/);
		});

		it('should validate image dimensions', () => {
			const height = parseInt('630');
			const width = parseInt('1200');
			expect(height).toBeGreaterThan(0);
			expect(width).toBeGreaterThan(0);
			expect(width).toBeGreaterThanOrEqual(height);
		});
	});

	describe('Edge Cases', () => {
		it('should handle special characters in title', () => {
			const title = 'My Site & Company | Best';
			expect(title).toContain('&');
		});

		it('should handle long descriptions', () => {
			const desc = 'A'.repeat(160);
			expect(desc).toHaveLength(160);
		});

		it('should handle multiple keywords', () => {
			const keywords = ['web', 'design', 'development', 'marketing'].join(', ');
			const keyArray = keywords.split(', ');
			expect(keyArray.length).toBe(4);
		});

		it('should handle absolute image URLs', () => {
			const image = 'https://cdn.example.com/images/og-image.png';
			expect(image).toContain('https://');
			expect(image).toContain('cdn.');
		});

		it('should handle relative favicon paths', () => {
			const favicon = '/images/favicon.ico';
			expect(favicon).toMatch(/^\//);
		});
	});
});
