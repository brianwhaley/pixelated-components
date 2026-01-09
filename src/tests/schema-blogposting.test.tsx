import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../test/test-utils';
import { SchemaBlogPosting } from '@/components/general/schema-blogposting';
import { mapWordPressToBlogPosting } from '@/components/general/schema-blogposting.functions';
import type { BlogPostType } from '../components/general/wordpress.functions';

describe('SchemaBlogPosting Component', () => {
	describe('Rendering', () => {
		it('should render script tag with application/ld+json type', () => {
			const post = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'Test Post',
				description: 'Test Description',
				datePublished: '2025-01-01T12:00:00Z',
			};

			const { container } = render(<SchemaBlogPosting post={post} />);
			const scriptTag = container.querySelector('script[type="application/ld+json"]');

			expect(scriptTag).toBeTruthy();
		});

		it('should embed correct JSON-LD in script tag', () => {
			const post = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'My Blog Post',
				description: 'A great article',
				datePublished: '2025-01-15T10:30:00Z',
			};

			const { container } = render(<SchemaBlogPosting post={post} />);
			const scriptTag = container.querySelector('script[type="application/ld+json"]');
			const content = scriptTag?.textContent;

			expect(content).toContain('"@type":"BlogPosting"');
			expect(content).toContain('"headline":"My Blog Post"');
			expect(content).toContain('"description":"A great article"');
		});

		it('should handle all schema.org BlogPosting properties', () => {
			const post = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'Complete Post',
				description: 'Full description',
				image: 'https://example.com/image.jpg',
				datePublished: '2025-01-01T12:00:00Z',
				dateModified: '2025-01-02T12:00:00Z',
				author: {
					'@type': 'Person',
					name: 'John Doe',
				},
				articleBody: 'This is the full article body.',
				articleSection: 'Technology',
				keywords: ['tech', 'blog', 'post'],
			};

			const { container } = render(<SchemaBlogPosting post={post} />);
			const scriptTag = container.querySelector('script[type="application/ld+json"]');
			const content = scriptTag?.textContent;

			expect(content).toContain('"image":"https://example.com/image.jpg"');
			expect(content).toContain('"dateModified":"2025-01-02T12:00:00Z"');
			expect(content).toContain('"name":"John Doe"');
			expect(content).toContain('"articleBody":"This is the full article body."');
			expect(content).toContain('"articleSection":"Technology"');
			expect(content).toContain('"keywords"');
		});
	});

	describe('Edge Cases', () => {
		it('should handle post with minimal properties', () => {
			const post = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'Minimal Post',
				description: 'Description',
				datePublished: '2025-01-01T12:00:00Z',
			};

			const { container } = render(<SchemaBlogPosting post={post} />);
			const scriptTag = container.querySelector('script[type="application/ld+json"]');

			expect(scriptTag).toBeTruthy();
			expect(scriptTag?.textContent).toContain('"headline":"Minimal Post"');
		});

		it('should handle special characters in headline', () => {
			const post = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'Post with "quotes" & <brackets>',
				description: 'Description',
				datePublished: '2025-01-01T12:00:00Z',
			};

			const { container } = render(<SchemaBlogPosting post={post} />);
			const scriptTag = container.querySelector('script[type="application/ld+json"]');

			expect(scriptTag?.textContent).toContain('Post with');
		});

		it('should handle very long content', () => {
			const longContent = 'A'.repeat(5000);
			const post = {
				'@context': 'https://schema.org',
				'@type': 'BlogPosting',
				headline: 'Long Post',
				description: longContent,
				datePublished: '2025-01-01T12:00:00Z',
				articleBody: longContent,
			};

			const { container } = render(<SchemaBlogPosting post={post} />);
			const scriptTag = container.querySelector('script[type="application/ld+json"]');

			expect(scriptTag).toBeTruthy();
		});
	});
});

describe('mapWordPressToBlogPosting Transformation', () => {
	const mockPost: BlogPostType = {
		ID: '123',
		title: 'Test Blog Post',
		date: '2025-01-15T10:30:00Z',
		modified: '2025-01-16T14:20:00Z',
		author: 'Jane Smith',
		excerpt: '<p>This is a test excerpt with <strong>HTML</strong></p>',
		content: '<p>This is the full article content with more details.</p>',
		URL: 'https://blog.pixelated.tech/test-post',
		categories: ['Technology', 'Web Development'],
		featured_image: 'https://example.com/featured.jpg',
		post_thumbnail: {
			URL: 'https://example.com/thumbnail.jpg',
		},
	};

	describe('Basic Transformation', () => {
		it('should transform WordPress post to schema.org BlogPosting', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema['@context']).toBe('https://schema.org');
			expect(schema['@type']).toBe('BlogPosting');
			expect(schema.headline).toBe('Test Blog Post');
			expect(schema.datePublished).toBe('2025-01-15T10:30:00Z');
		});

		it('should set headline from WordPress title', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.headline).toBe('Test Blog Post');
		});

		it('should set datePublished from WordPress date', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.datePublished).toBe('2025-01-15T10:30:00Z');
		});

		it('should set dateModified from WordPress modified date', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.dateModified).toBe('2025-01-16T14:20:00Z');
		});

		it('should set image from featured_image', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.image).toBe('https://example.com/featured.jpg');
		});

		it('should fallback to post_thumbnail if featured_image missing', () => {
			const postWithoutFeatured = { ...mockPost, featured_image: undefined };
			const schema = mapWordPressToBlogPosting(postWithoutFeatured, false);

			expect(schema.image).toBe('https://example.com/thumbnail.jpg');
		});

		it('should set author from WordPress author', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.author).toEqual({
				'@type': 'Person',
				name: 'Jane Smith',
			});
		});

		it('should set articleSection from first category', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.articleSection).toBe('Technology');
		});

		it('should set keywords from all categories', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.keywords).toEqual(['Technology', 'Web Development']);
		});
	});

	describe('Content Management', () => {
		it('should not include articleBody when includeFullContent is false', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.articleBody).toBeUndefined();
		});

		it('should include articleBody when includeFullContent is true', () => {
			const schema = mapWordPressToBlogPosting(mockPost, true);

			expect(schema.articleBody).toBeDefined();
		});

		it('should set description from excerpt', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			expect(schema.description).toBeTruthy();
		});

		it('should clean HTML from description', () => {
			const schema = mapWordPressToBlogPosting(mockPost, false);

			// Description should not contain HTML tags
			expect(schema.description).not.toContain('<p>');
			expect(schema.description).not.toContain('<strong>');
		});

		it('should clean […] from content', () => {
			const postWithEllipsis = {
				...mockPost,
				excerpt: 'This is excerpt […]',
				content: 'This is content […]',
			};
			const schema = mapWordPressToBlogPosting(postWithEllipsis, true);

			expect(schema.description).not.toContain('[…]');
			if (schema.articleBody) {
				expect(schema.articleBody).not.toContain('[…]');
			}
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing featured_image and post_thumbnail', () => {
			const post = { ...mockPost, featured_image: undefined, post_thumbnail: undefined };
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.image).toBeUndefined();
		});

		it('should handle missing author', () => {
			const post = { ...mockPost, author: undefined };
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.author).toBeUndefined();
		});

		it('should handle missing modified date', () => {
			const post = { ...mockPost, modified: undefined };
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.dateModified).toBeUndefined();
		});

		it('should handle empty categories array', () => {
			const post = { ...mockPost, categories: [] };
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.articleSection).toBe('Blog');
			expect(schema.keywords).toEqual([]);
		});

		it('should handle missing content when includeFullContent is true', () => {
			const post = { ...mockPost, content: undefined };
			const schema = mapWordPressToBlogPosting(post, true);

			// When content is missing, articleBody should be undefined (not included in schema)
			expect(schema.articleBody).toBeUndefined();
		});

		it('should use fallback description if excerpt is empty', () => {
			const post = { ...mockPost, excerpt: '' };
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.description).toBe('Test Blog Post');
		});

		it('should handle categories as non-array', () => {
			const post = { ...mockPost, categories: [] };
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.keywords).toEqual([]);
		});

		it('should handle very long titles', () => {
			const longTitle = 'A'.repeat(500);
			const post = { ...mockPost, title: longTitle };
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.headline.length).toBe(500);
		});

		it('should handle special characters in all fields', () => {
			const post = {
				...mockPost,
				title: 'Post with "quotes" & special chars © ™',
				excerpt: 'Excerpt with émojis 🎉 and symbols',
				author: "O'Brien",
				categories: ['Tech & News', 'Web/Dev'],
			};
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.headline).toContain('"');
			expect(schema.author?.name).toContain("O'Brien");
		});
	});

	describe('Null and Undefined Handling', () => {
		it('should handle null values gracefully', () => {
			const post = {
				...mockPost,
				excerpt: null as any,
				content: null as any,
			};
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.description).toBeTruthy();
		});

		it('should handle empty strings', () => {
			const post = {
				...mockPost,
				excerpt: '',
				author: '',
			};
			const schema = mapWordPressToBlogPosting(post, false);

			expect(schema.description).toBe('Test Blog Post');
			expect(schema.author).toBeUndefined();
		});
	});
});
