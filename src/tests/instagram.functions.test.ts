import { describe, it, expect, vi } from 'vitest';
import {
	getInstagramMedia,
	instagramMediaToTiles,
	getInstagramTiles,
	type InstagramMedia
} from '../components/integrations/instagram.functions';

describe('Instagram Functions', () => {
	describe('getInstagramMedia', () => {
		it('should fetch Instagram media from Graph API', async () => {
			const mockResponse = {
				data: [
					{
						id: '123',
						media_type: 'IMAGE' as const,
						media_url: 'https://example.com/image.jpg',
						permalink: 'https://instagram.com/p/abc123',
						caption: 'Test post',
						timestamp: '2025-01-01T00:00:00+0000'
					}
				]
			};

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockResponse)
				} as Response)
			);

			const media = await getInstagramMedia({ limit: 10 });
			expect(media).toHaveLength(1);
			expect(media[0].media_type).toBe('IMAGE');
		});

		it('should throw error on API failure', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: false,
					json: () => Promise.resolve({ error: 'Invalid token' })
				} as Response)
			);

			await expect(getInstagramMedia({})).rejects.toThrow();
		});

		it('should handle missing data in response', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({})
				} as Response)
			);

			await expect(getInstagramMedia({})).rejects.toThrow();
		});

		it('should accept custom access token', async () => {
			const mockResponse = { data: [] };
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockResponse)
				} as Response)
			);

			await getInstagramMedia({ accessToken: 'custom-token' });
			expect(global.fetch).toHaveBeenCalled();
		});

		it('should use default limit of 25', async () => {
			const mockResponse = { data: [] };
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockResponse)
				} as Response)
			);

			await getInstagramMedia({});
			const callUrl = (global.fetch as any).mock.calls[0][0];
			expect(callUrl).toContain('limit=25');
		});

		it('should handle video and carousel album types', async () => {
			const mockResponse = {
				data: [
					{
						id: '1',
						media_type: 'VIDEO' as const,
						media_url: 'https://example.com/video.mp4',
						thumbnail_url: 'https://example.com/thumb.jpg',
						permalink: 'https://instagram.com/p/vid1'
					},
					{
						id: '2',
						media_type: 'CAROUSEL_ALBUM' as const,
						media_url: 'https://example.com/carousel.jpg',
						permalink: 'https://instagram.com/p/carousel1'
					}
				]
			};

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockResponse)
				} as Response)
			);

			const media = await getInstagramMedia({});
			expect(media).toHaveLength(2);
			expect(media[0].media_type).toBe('VIDEO');
		});
	});

	describe('instagramMediaToTiles', () => {
		const mockMedia: InstagramMedia[] = [
			{
				id: '1',
				media_type: 'IMAGE',
				media_url: 'https://example.com/image.jpg',
				permalink: 'https://instagram.com/p/abc123',
				caption: 'Test image',
				timestamp: '2025-01-01T00:00:00+0000',
				username: 'testuser'
			},
			{
				id: '2',
				media_type: 'VIDEO',
				media_url: 'https://example.com/video.mp4',
				thumbnail_url: 'https://example.com/thumb.jpg',
				permalink: 'https://instagram.com/p/vid123',
				caption: 'Test video',
				timestamp: '2025-01-02T00:00:00+0000'
			}
		];

		it('should convert Instagram media to carousel tiles', () => {
			const tiles = instagramMediaToTiles(mockMedia);
			expect(tiles).toHaveLength(2);
			expect(tiles[0].image).toBe('https://example.com/image.jpg');
		});

		it('should use thumbnail for videos by default', () => {
			const tiles = instagramMediaToTiles(mockMedia);
			expect(tiles[1].image).toBe('https://example.com/thumb.jpg');
		});

		it('should use media_url for videos when useThumbnails=false', () => {
			const tiles = instagramMediaToTiles(mockMedia, { useThumbnails: false });
			expect(tiles[1].image).toBe('https://example.com/video.mp4');
		});

		it('should filter out videos when includeVideos=false', () => {
			const tiles = instagramMediaToTiles(mockMedia, { includeVideos: false });
			expect(tiles).toHaveLength(1);
			expect(tiles[0].index).toBe(0);
		});

		it('should include captions by default', () => {
			const tiles = instagramMediaToTiles(mockMedia);
			expect(tiles[0].bodyText).toBe('Test image');
		});

		it('should exclude captions when includeCaptions=false', () => {
			const tiles = instagramMediaToTiles(mockMedia, { includeCaptions: false });
			expect(tiles[0].bodyText).toBeUndefined();
		});

		it('should set proper link and target', () => {
			const tiles = instagramMediaToTiles(mockMedia);
			expect(tiles[0].link).toBe('https://instagram.com/p/abc123');
			expect(tiles[0].linkTarget).toBe('_blank');
		});

		it('should set imageAlt from username', () => {
			const tiles = instagramMediaToTiles(mockMedia);
			expect(tiles[0].imageAlt).toBe('@testuser on Instagram');
		});

		it('should handle missing username in alt text', () => {
			const mediaNoUsername = [{
				...mockMedia[0],
				username: undefined
			}];
			const tiles = instagramMediaToTiles(mediaNoUsername);
			expect(tiles[0].imageAlt).toBe('Instagram post');
		});

		it('should assign sequential indices', () => {
			const tiles = instagramMediaToTiles(mockMedia);
			expect(tiles[0].index).toBe(0);
			expect(tiles[1].index).toBe(1);
		});

		it('should set cardLength correctly', () => {
			const tiles = instagramMediaToTiles(mockMedia);
			tiles.forEach(tile => {
				expect(tile.cardLength).toBe(2);
			});
		});

		it('should handle empty media array', () => {
			const tiles = instagramMediaToTiles([]);
			expect(tiles).toHaveLength(0);
		});
	});

	describe('getInstagramTiles', () => {
		it('should fetch media and convert to tiles in one call', async () => {
			const mockResponse = {
				data: [{
					id: '1',
					media_type: 'IMAGE' as const,
					media_url: 'https://example.com/image.jpg',
					permalink: 'https://instagram.com/p/abc123',
					timestamp: '2025-01-01T00:00:00+0000'
				}]
			};

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockResponse)
				} as Response)
			);

			const tiles = await getInstagramTiles({ limit: 12 });
			expect(Array.isArray(tiles)).toBe(true);
			expect(tiles.length).toBeGreaterThan(0);
		});

		it('should use default limit of 12', async () => {
			const mockResponse = { data: [] };
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockResponse)
				} as Response)
			);

			await getInstagramTiles({});
			const callUrl = (global.fetch as any).mock.calls[0][0];
			expect(callUrl).toContain('limit=12');
		});

		it('should pass transformation options through', async () => {
			const mockResponse = {
				data: [{
					id: '1',
					media_type: 'VIDEO' as const,
					media_url: 'https://example.com/video.mp4',
					thumbnail_url: 'https://example.com/thumb.jpg',
					permalink: 'https://instagram.com/p/vid1',
					timestamp: '2025-01-01T00:00:00+0000'
				}]
			};

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockResponse)
				} as Response)
			);

			const tiles = await getInstagramTiles({
				useThumbnails: false,
				includeVideos: true
			});

			expect(tiles[0].image).toBe('https://example.com/video.mp4');
		});
	});
});
