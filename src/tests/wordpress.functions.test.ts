import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWordPressItems, photonToOriginalUrl } from '../components/integrations/wordpress.functions';
import { buildUrl } from '../components/general/urlbuilder';

vi.mock('../components/general/smartfetch');

const { smartFetch } = await import('../components/general/smartfetch');
const mockSmartFetch = vi.mocked(smartFetch);

describe('WordPress Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('photonToOriginalUrl', () => {
    it('should convert Photon URLs to direct URLs', () => {
      const photonUrl = 'https://i0.wp.com/example.com/wp-content/uploads/image.jpg';
      const result = photonToOriginalUrl(photonUrl);
      expect(result).toBe('https://example.com/wp-content/uploads/image.jpg');
    });

    it('should handle Photon URLs with query parameters', () => {
      const photonUrl = 'https://i0.wp.com/example.com/image.jpg?w=300&h=200&crop=1';
      const result = photonToOriginalUrl(photonUrl);
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('should handle Photon URLs with complex paths', () => {
      const photonUrl = 'https://i0.wp.com/example.com/wp-content/uploads/2024/01/my-image.jpg';
      const result = photonToOriginalUrl(photonUrl);
      expect(result).toBe('https://example.com/wp-content/uploads/2024/01/my-image.jpg');
    });

    it('should return non-Photon URLs unchanged', () => {
      const directUrl = 'https://example.com/image.jpg';
      const result = photonToOriginalUrl(directUrl);
      expect(result).toBe(directUrl);
    });

    it('should return regular WordPress URLs unchanged', () => {
      const wpUrl = 'https://example.com/wp-content/uploads/image.jpg';
      const result = photonToOriginalUrl(wpUrl);
      expect(result).toBe(wpUrl);
    });

    it('should handle malformed URLs gracefully', () => {
      const badUrl = 'not-a-url';
      const result = photonToOriginalUrl(badUrl);
      expect(result).toBe(badUrl); // Return original on error
    });

    it('should handle empty strings', () => {
      const emptyUrl = '';
      const result = photonToOriginalUrl(emptyUrl);
      expect(result).toBe(emptyUrl);
    });

    it('should handle null/undefined inputs', () => {
      expect(photonToOriginalUrl(null as any)).toBe(null);
      expect(photonToOriginalUrl(undefined as any)).toBe(undefined);
    });

    it('should handle Photon URLs with different domains', () => {
      const photonUrl = 'https://i0.wp.com/myblog.wordpress.com/image.jpg';
      const result = photonToOriginalUrl(photonUrl);
      expect(result).toBe('https://myblog.wordpress.com/image.jpg');
    });

    it('should handle Photon URLs with subdomains', () => {
      const photonUrl = 'https://i0.wp.com/sub.example.com/path/image.jpg';
      const result = photonToOriginalUrl(photonUrl);
      expect(result).toBe('https://sub.example.com/path/image.jpg');
    });
  });

  describe('getWordPressItems', () => {
    const mockPosts = [
      {
        ID: 1,
        title: 'Test Post 1',
        featured_image: 'https://i0.wp.com/example.com/image1.jpg',
        content: 'Test content 1',
        excerpt: 'Excerpt 1',
        date: '2024-01-01T00:00:00+00:00',
        URL: 'https://example.com/post-1',
        categories: [],
        author: null
      },
      {
        ID: 2,
        title: 'Test Post 2',
        featured_image: 'https://example.com/image2.jpg', // Already direct URL
        content: 'Test content 2',
        excerpt: 'Excerpt 2',
        date: '2024-01-02T00:00:00+00:00',
        URL: 'https://example.com/post-2',
        categories: [],
        author: null
      },
      {
        ID: 3,
        title: 'Test Post 3',
        featured_image: null, // No featured image
        content: 'Test content 3',
        excerpt: 'Excerpt 3',
        date: '2024-01-03T00:00:00+00:00',
        URL: 'https://example.com/post-3',
        categories: [],
        author: null
      }
    ];

    it('should convert Photon URLs in featured_image during API fetch', async () => {
      let callCount = 0;
      mockSmartFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ posts: mockPosts });
        } else {
          // Return empty posts to stop the loop
          return Promise.resolve({ posts: [] });
        }
      });

      const result = await getWordPressItems({ site: 'test.com' });

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
      // After sorting by date descending: Post 3, Post 2, Post 1
      expect(result![0].featured_image).toBeNull(); // Post 3 (2024-01-03) - Unchanged
      expect(result![1].featured_image).toBe('https://example.com/image2.jpg'); // Post 2 (2024-01-02) - Unchanged
      expect(result![2].featured_image).toBe('https://example.com/image1.jpg'); // Post 1 (2024-01-01) - Converted
    });

    it('should handle API errors gracefully', async () => {
      mockSmartFetch.mockRejectedValue(new Error('API Error'));

      const result = await getWordPressItems({ site: 'test.com' });

      expect(result).toBeUndefined();
    });

    it('should call the correct WordPress API endpoint', async () => {
      let callCount = 0;
      mockSmartFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ posts: [{ id: 1, title: { rendered: 'Test' } }] });
        } else {
          return Promise.resolve({ posts: [] });
        }
      });

      await getWordPressItems({ site: 'myblog.com' });

      // Check that the first call was made with the correct URL
      expect(mockSmartFetch).toHaveBeenNthCalledWith(
        1,
        'https://public-api.wordpress.com/rest/v1/sites/myblog.com/posts?number=100&page=1',
        expect.any(Object)
      );
    });
  });

  describe('buildUrl URL Construction for WordPress APIs', () => {
    describe('WordPress REST API URL building', () => {
      it('should construct WordPress posts URL with buildUrl (Section 1)', () => {
        const baseUrl = 'https://public-api.wordpress.com/rest/v1/sites';
        const site = 'myblog.com';

        const postsUrl = buildUrl({
          baseUrl: baseUrl,
          pathSegments: [site, 'posts'],
          params: { number: 100, page: 1 }
        });

        expect(postsUrl).toContain('public-api.wordpress.com');
        expect(postsUrl).toContain(site);
        expect(postsUrl).toContain('posts');
        expect(postsUrl).toContain('number=100');
        expect(postsUrl).toContain('page=1');
      });

      it('should handle different WordPress sites with buildUrl (Section 2)', () => {
        const baseUrl = 'https://public-api.wordpress.com/rest/v1/sites';
        const sites = ['blog1.com', 'blog2.wordpress.com', 'subdomain.blog.com'];

        sites.forEach(site => {
          const url = buildUrl({
            baseUrl: baseUrl,
            pathSegments: [site, 'posts'],
            params: { number: 100 }
          });

          expect(url).toContain(site);
          expect(url).toContain('posts');
        });
      });

      it('should paginate WordPress posts with buildUrl (Section 3)', () => {
        const baseUrl = 'https://public-api.wordpress.com/rest/v1/sites';
        const site = 'example.com';

        const page1 = buildUrl({
          baseUrl: baseUrl,
          pathSegments: [site, 'posts'],
          params: { number: 100, page: 1 }
        });

        const page2 = buildUrl({
          baseUrl: baseUrl,
          pathSegments: [site, 'posts'],
          params: { number: 100, page: 2 }
        });

        expect(page1).toContain('page=1');
        expect(page2).toContain('page=2');
      });

      it('should construct WordPress single post URL (Section 4)', () => {
        const baseUrl = 'https://public-api.wordpress.com/rest/v1/sites';
        const site = 'myblog.com';

        const postUrl = buildUrl({
          baseUrl: baseUrl,
          pathSegments: [site, 'posts', '12345']
        });

        expect(postUrl).toContain(site);
        expect(postUrl).toContain('posts');
        expect(postUrl).toContain('12345');
      });

      it('should handle WordPress API pagination correctly', () => {
        const baseUrl = 'https://public-api.wordpress.com/rest/v1/sites';
        const site = 'test.com';

        const urls = [1, 2, 3, 4, 5].map(page =>
          buildUrl({
            baseUrl: baseUrl,
            pathSegments: [site, 'posts'],
            params: { number: 100, page }
          })
        );

        urls.forEach((url, index) => {
          expect(url).toContain(`page=${index + 1}`);
          expect(url).toContain('number=100');
        });
      });
    });
  });
});
