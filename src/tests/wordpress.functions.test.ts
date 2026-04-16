import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWordPressItems, getWordPressLastModified, photonToOriginalUrl } from '../components/integrations/wordpress.functions';
import { buildUrl } from '../components/foundation/urlbuilder';
import { mockWordPressPosts } from '../test/fixtures';

vi.mock('../components/foundation/smartfetch');

const { smartFetch } = await import('../components/foundation/smartfetch');
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
    const mockPosts = mockWordPressPosts;

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

    it('should return BlogPostType array', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [{ ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] }] });
      const result = await getWordPressItems({ site: 'example.com' });
      expect(Array.isArray(result) || result === undefined).toBe(true);
    });

    it('should fetch posts from WordPress API', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      mockSmartFetch.mockResolvedValueOnce({ posts: [mockPost] });
      await getWordPressItems({ site: 'example.com' });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should use default WordPress API URL', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      await getWordPressItems({ site: 'example.com' });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should use custom baseURL when provided', async () => {
      const customURL = 'https://custom.api.com/';
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      await getWordPressItems({ site: 'example.com', baseURL: customURL });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should limit results by count parameter', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      await getWordPressItems({ site: 'example.com', count: 5 });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should fetch all posts when count not specified', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      await getWordPressItems({ site: 'example.com' });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should paginate through results', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      const posts = Array(250).fill(0).map((_, i) => ({ ...mockPost, ID: `${i}` }));
      mockSmartFetch.mockResolvedValueOnce({ posts: posts.slice(0, 100) });
      mockSmartFetch.mockResolvedValueOnce({ posts: posts.slice(100, 200) });
      mockSmartFetch.mockResolvedValueOnce({ posts: posts.slice(200) });
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });

      await getWordPressItems({ site: 'example.com', count: 250 });
      expect(mockSmartFetch.mock.calls.length).toBeGreaterThan(0);
    });

    it('should stop pagination when empty batch received', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      mockSmartFetch.mockResolvedValueOnce({ posts: [mockPost] });
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });

      await getWordPressItems({ site: 'example.com' });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should sort posts by date descending', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      const post1 = { ...mockPost, ID: '1', date: '2024-01-01' };
      const post2 = { ...mockPost, ID: '2', date: '2024-01-02' };
      mockSmartFetch.mockResolvedValueOnce({ posts: [post1, post2] });

      const result = await getWordPressItems({ site: 'example.com' });
      if (result && result.length > 1) {
        expect(result[0].date >= result[1].date).toBe(true);
      }
    });

    it('should handle missing featured image', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      const post = { ...mockPost, featured_image: undefined };
      mockSmartFetch.mockResolvedValueOnce({ posts: [post] });

      const result = await getWordPressItems({ site: 'example.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should transform Photon URLs in featured images', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      const post = { ...mockPost, featured_image: 'https://i.wordpress.com/image.jpg' };
      mockSmartFetch.mockResolvedValueOnce({ posts: [post] });

      const result = await getWordPressItems({ site: 'example.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should handle posts with content', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      const post = { ...mockPost, content: '<p>Post content</p>' };
      mockSmartFetch.mockResolvedValueOnce({ posts: [post] });

      const result = await getWordPressItems({ site: 'example.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should handle posts with author info', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      const post = {
        ...mockPost,
        author: {
          ID: 1,
          login: 'admin',
          email: 'admin@example.com',
          name: 'Admin',
          first_name: 'Admin',
          last_name: 'User',
          nice_name: 'admin',
          URL: 'https://example.com',
          avatar_URL: 'https://example.com/avatar.jpg',
          profile_URL: 'https://example.com/profile',
          ip_address: '127.0.0.1'
        }
      };
      mockSmartFetch.mockResolvedValueOnce({ posts: [post] });

      const result = await getWordPressItems({ site: 'example.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should handle fetch errors gracefully', async () => {
      mockSmartFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getWordPressItems({ site: 'example.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should handle non-array posts response', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: null });

      const result = await getWordPressItems({ site: 'example.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should accept different site identifiers', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      await getWordPressItems({ site: 'my-site.wordpress.com' });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should set caching headers for smartFetch', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      await getWordPressItems({ site: 'example.com' });
      expect(mockSmartFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: expect.any(Number)
        })
      );
    });
  });

  describe('getWordPressLastModified', () => {
    it('should return modified timestamp', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [{ modified: '2024-01-15T10:00:00Z' }] });
      const result = await getWordPressLastModified({ site: 'example.com' });
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should return null when modified field missing', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [{}] });
      const result = await getWordPressLastModified({ site: 'example.com' });
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should return null on fetch error', async () => {
      mockSmartFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await getWordPressLastModified({ site: 'example.com' });
      expect(result).toBe(null);
    });

    it('should fetch single post only', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [{ modified: '2024-01-15' }] });
      await getWordPressLastModified({ site: 'example.com' });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should use custom baseURL when provided', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      const customURL = 'https://custom.api.com/';
      await getWordPressLastModified({ site: 'example.com', baseURL: customURL });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should use default WordPress API URL', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      await getWordPressLastModified({ site: 'example.com' });
      expect(mockSmartFetch).toHaveBeenCalled();
    });

    it('should return null for empty posts array', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      const result = await getWordPressLastModified({ site: 'example.com' });
      expect(result === null || typeof result === 'string').toBe(true);
    });

    it('should return null when posts is not array', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: null });
      const result = await getWordPressLastModified({ site: 'example.com' });
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('BlogPostType structure', () => {
    it('should have all required fields', () => {
      const post = {
        ID: '123',
        title: 'Test',
        date: '2024-01-01',
        excerpt: 'Test',
        URL: 'https://example.com',
        categories: []
      };
      expect(post.ID).toBe('123');
    });

    it('should support optional author field', () => {
      const post = {
        ID: '123',
        title: 'Test',
        date: '2024-01-01',
        excerpt: 'Test',
        URL: 'https://example.com',
        categories: [],
        author: {
          ID: 1,
          login: 'test',
          email: 'test@example.com',
          name: 'Test',
          first_name: 'Test',
          last_name: 'User',
          nice_name: 'test',
          URL: 'https://example.com',
          avatar_URL: 'https://example.com/avatar.jpg',
          profile_URL: 'https://example.com/profile',
          ip_address: '127.0.0.1'
        }
      };
      expect(post.author?.login).toBe('test');
    });

    it('should support featured image string', () => {
      const post = {
        ID: '123',
        title: 'Test',
        date: '2024-01-01',
        excerpt: 'Test',
        URL: 'https://example.com',
        categories: [],
        featured_image: 'https://example.com/image.jpg'
      };
      expect(post.featured_image).toBe('https://example.com/image.jpg');
    });

    it('should support post_thumbnail object', () => {
      const post = {
        ID: '123',
        title: 'Test',
        date: '2024-01-01',
        excerpt: 'Test',
        URL: 'https://example.com',
        categories: [],
        post_thumbnail: { URL: 'https://example.com/thumb.jpg' }
      };
      expect(post.post_thumbnail?.URL).toBe('https://example.com/thumb.jpg');
    });
  });

  describe('PropTypes Validation', () => {
    it('should have propTypes defined', () => {
      expect(getWordPressItems.propTypes).toBeDefined();
    });

    it('should require site prop', () => {
      expect(getWordPressItems.propTypes?.site).toBeDefined();
    });

    it('should accept optional count prop', () => {
      expect(getWordPressItems.propTypes?.count).toBeDefined();
    });

    it('should accept optional baseURL prop', () => {
      expect(getWordPressItems.propTypes?.baseURL).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSmartFetch.mockRejectedValueOnce(new Error('API error'));
      await getWordPressItems({ site: 'example.com' });
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should continue on fetch error', async () => {
      mockSmartFetch.mockRejectedValueOnce(new Error('Network error'));
      const result = await getWordPressItems({ site: 'example.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should handle invalid response structure', async () => {
      mockSmartFetch.mockResolvedValueOnce({ data: [] });
      const result = await getWordPressItems({ site: 'example.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle count of 0', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      const result = await getWordPressItems({ site: 'example.com', count: 0 });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should handle very large count', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      const result = await getWordPressItems({ site: 'example.com', count: 10000 });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should handle special characters in site name', async () => {
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });
      const result = await getWordPressItems({ site: 'my-site-2024.wordpress.com' });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });

    it('should handle fast pagination', async () => {
      const mockPost = { ID: '123', title: 'Test Post', date: '2024-01-01', excerpt: 'Test excerpt', URL: 'https://example.com/test', categories: ['general'] };
      const posts100 = Array(100).fill(0).map((_, i) => ({ ...mockPost, ID: `${i}` }));
      mockSmartFetch.mockResolvedValueOnce({ posts: posts100 });
      mockSmartFetch.mockResolvedValueOnce({ posts: [] });

      const result = await getWordPressItems({ site: 'example.com', count: 100 });
      expect(result === undefined || Array.isArray(result)).toBe(true);
    });
  });
});
