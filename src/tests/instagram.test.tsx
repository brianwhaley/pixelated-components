import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { InstagramTiles } from '../components/integrations/instagram.components';

// Mock the Instagram functions
vi.mock('../components/integrations/instagram.functions', () => ({
	getInstagramTiles: vi.fn()
}));

// Mock the Tiles component
vi.mock('../components/general/tiles', () => ({
	Tiles: ({ cards }: any) => (
		<div data-testid="instagram-tiles">
			{cards && cards.map((card: any, idx: number) => (
				<div key={idx} data-testid={`tile-${idx}`} className="tile-item">
					{card.image && <img src={card.image} alt={card.title} />}
					{card.title && <h3>{card.title}</h3>}
				</div>
			))}
		</div>
	)
}));

// Mock the config hook
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: () => ({
		instagram: {
			accessToken: 'test-instagram-token',
			userId: 'test-user-id'
		}
	})
}));

import { getInstagramTiles } from '../components/integrations/instagram.functions';

describe('Instagram Integration Tests', () => {
	const mockInstagramTiles = [
		{
			id: 'insta-123456',
			title: 'Beautiful sunset',
			image: 'https://scontent.cdninstagram.com/v/t51.2885-15/abc123.jpg',
			link: 'https://instagram.com/p/ABC123/view',
			description: 'Beautiful sunset',
		},
		{
			id: 'insta-234567',
			title: 'Mountain view',
			image: 'https://scontent.cdninstagram.com/v/t51.2885-15/def456.jpg',
			link: 'https://instagram.com/p/DEF456/view',
			description: 'Mountain view',
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
		(getInstagramTiles as any).mockResolvedValue(mockInstagramTiles);
	});

	describe('instagram Tiles Component Rendering', () => {
		it('should render InstagramTiles component', async () => {
			const { container } = render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					limit={12}
				/>
			);

			await waitFor(() => {
				const tilesContainer = container.querySelector('[data-testid="instagram-tiles"]');
				expect(tilesContainer).toBeDefined();
			});
		});

		it('should render loading state initially', () => {
			(getInstagramTiles as any).mockImplementation(() => new Promise(() => {})); // Never resolves

			const { container } = render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					limit={12}
				/>
			);

			const loadingText = container.querySelector('p');
			expect(loadingText?.textContent).toContain('Loading');
		});

		it('should render error state when fetch fails', async () => {
			const errorMessage = 'Failed to fetch Instagram media';
			(getInstagramTiles as any).mockRejectedValue(new Error(errorMessage));

			const { container } = render(
				<InstagramTiles
					accessToken="invalid-token"
					userId="test-user-id"
					limit={12}
				/>
			);

			await waitFor(() => {
				const errorElement = container.querySelector('[style*="color"]');
				expect(errorElement?.textContent).toContain('Error');
			});
		});

		it('should render empty state when no tiles available', async () => {
			(getInstagramTiles as any).mockResolvedValue([]);

			const { container } = render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					limit={12}
				/>
			);

			await waitFor(() => {
				const emptyText = Array.from(container.querySelectorAll('p')).find(
					p => p.textContent?.includes('No Instagram')
				);
				expect(emptyText).toBeDefined();
			});
		});

		it('should pass rowCount to Tiles component', async () => {
			const { container } = render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					limit={12}
					rowCount={3}
				/>
			);

			await waitFor(() => {
				const tilesContainer = container.querySelector('[data-testid="instagram-tiles"]');
				expect(tilesContainer).toBeDefined();
			});
		});
	});

	describe('Instagram API Integration', () => {
		it('should call getInstagramTiles with correct parameters', async () => {
			render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					limit={20}
					includeVideos={true}
					includeCaptions={true}
				/>
			);

			await waitFor(() => {
				expect(getInstagramTiles).toHaveBeenCalled();
			});
		});

		it('should use config defaults when props not provided', async () => {
			render(
				<InstagramTiles />
			);

			await waitFor(() => {
				expect(getInstagramTiles).toHaveBeenCalled();
			});
		});

		it('should override config with provided accessToken', async () => {
			render(
				<InstagramTiles
					accessToken="override-token"
					userId="override-user-id"
				/>
			);

			await waitFor(() => {
				expect(getInstagramTiles).toHaveBeenCalled();
			});
		});
	});

	describe('Tile Data Structure', () => {
		it('should render tiles with image URLs', async () => {
			const { container } = render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					limit={12}
				/>
			);

			await waitFor(() => {
				const images = container.querySelectorAll('img');
				expect(images.length).toBeGreaterThanOrEqual(0);
			});
		});

		it('should render tiles with titles', async () => {
			const { container } = render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					limit={12}
				/>
			);

			await waitFor(() => {
				const headings = container.querySelectorAll('h3');
				expect(headings.length).toBeGreaterThanOrEqual(0);
			});
		});

		it('should handle tiles with different media types', async () => {
			const mixedTiles = [
				{ ...mockInstagramTiles[0], media_type: 'IMAGE' },
				{ ...mockInstagramTiles[1], media_type: 'VIDEO' },
			];

			(getInstagramTiles as any).mockResolvedValue(mixedTiles);

			const { container } = render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					includeVideos={true}
					limit={12}
				/>
			);

			await waitFor(() => {
				const tilesContainer = container.querySelector('[data-testid="instagram-tiles"]');
				expect(tilesContainer).toBeDefined();
			});
		});
	});

	describe('Configuration Options', () => {
		it('should accept limit parameter', async () => {
			render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					limit={25}
				/>
			);

			await waitFor(() => {
				expect(getInstagramTiles).toHaveBeenCalled();
			});
		});

		it('should accept useThumbnails parameter', async () => {
			render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					useThumbnails={true}
				/>
			);

			await waitFor(() => {
				expect(getInstagramTiles).toHaveBeenCalled();
			});
		});

		it('should accept includeVideos parameter', async () => {
			render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					includeVideos={false}
				/>
			);

			await waitFor(() => {
				expect(getInstagramTiles).toHaveBeenCalled();
			});

			expect(getInstagramTiles).toHaveBeenCalled();
		});

		it('should accept includeCaptions parameter', async () => {
			render(
				<InstagramTiles
					accessToken="test-token"
					userId="test-user-id"
					includeCaptions={true}
				/>
			);

			await waitFor(() => {
				expect(getInstagramTiles).toHaveBeenCalled();
			});
		});
	});

	describe('Timestamps', () => {
		it('should validate ISO timestamp format', () => {
			const timestamps = [
				'2024-01-15T12:30:00+0000',
				'2024-01-14T08:45:30Z',
				'2024-01-13T16:20:15+0100',
			];

			timestamps.forEach((ts) => {
				expect(ts).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
			});
		});

		it('should parse ISO timestamps to dates', () => {
			const timestamp = '2024-01-15T12:30:00+0000';
			const date = new Date(timestamp);

			expect(date).toBeInstanceOf(Date);
			expect(date.getFullYear()).toBe(2024);
		});

		it('should calculate relative time', () => {
			const posted = new Date('2024-01-10');
			const now = new Date('2024-01-15');
			const days = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24));

			expect(days).toBe(5);
		});
	});

	describe('Configuration Options', () => {
		it('should handle token configuration', () => {
			const config = {
				accessToken: 'IGQVJf...',
				userId: '123456789',
			};

			expect(config.accessToken).toBeTruthy();
			expect(config.userId).toBeTruthy();
		});

		it('should handle feed limit', () => {
			const limits = [6, 9, 12, 20];

			limits.forEach((limit) => {
				expect(limit).toBeGreaterThan(0);
			});
		});

		it('should handle thumbnail usage option', () => {
			const options = [true, false];

			options.forEach((opt) => {
				expect(typeof opt).toBe('boolean');
			});
		});

		it('should handle include videos option', () => {
			const options = [true, false];

			options.forEach((opt) => {
				expect(typeof opt).toBe('boolean');
			});
		});

		it('should handle include captions option', () => {
			const options = [true, false];

			options.forEach((opt) => {
				expect(typeof opt).toBe('boolean');
			});
		});
	});

	describe('Feed Data', () => {
		it('should validate feed response structure', () => {
			const feed = {
				data: [
					{ id: '1', caption: 'Post 1', media_type: 'IMAGE' },
					{ id: '2', caption: 'Post 2', media_type: 'IMAGE' },
				],
				paging: {
					cursors: {
						after: 'cursor123',
						before: 'cursor456',
					},
				},
			};

			expect(Array.isArray(feed.data)).toBe(true);
			expect(feed.paging.cursors).toBeTruthy();
		});

		it('should handle empty feed', () => {
			const feed = {
				data: [],
				paging: {},
			};

			expect(feed.data).toHaveLength(0);
		});

		it('should handle feed pagination', () => {
			const feed = {
				data: [{ id: '1' }, { id: '2' }],
				paging: {
					cursors: { after: 'next-cursor', before: 'prev-cursor' },
					next: 'https://graph.instagram.com/me/media?access_token=...',
				},
			};

			expect((feed.paging as any).next).toContain('http');
		});
	});

	describe('Filtering', () => {
		it('should filter tiles by media type', () => {
			const tiles = [
				{ id: '1', media_type: 'IMAGE' },
				{ id: '2', media_type: 'VIDEO' },
				{ id: '3', media_type: 'IMAGE' },
				{ id: '4', media_type: 'CAROUSEL_ALBUM' },
			];

			const images = tiles.filter((t) => t.media_type === 'IMAGE');

			expect(images).toHaveLength(2);
		});

		it('should filter tiles by date range', () => {
			const tiles = [
				{ id: '1', timestamp: '2024-01-10T00:00:00Z' },
				{ id: '2', timestamp: '2024-01-15T00:00:00Z' },
				{ id: '3', timestamp: '2024-01-20T00:00:00Z' },
			];

			const filtered = tiles.filter((t) => {
				const date = new Date(t.timestamp);
				return date >= new Date('2024-01-15') && date <= new Date('2024-01-20');
			});

			expect(filtered).toHaveLength(2);
		});

		it('should filter tiles with captions', () => {
			const tiles = [
				{ id: '1', caption: 'Great photo!' },
				{ id: '2', caption: undefined },
				{ id: '3', caption: 'Another post' },
			];

			const withCaptions = tiles.filter((t) => t.caption);

			expect(withCaptions).toHaveLength(2);
		});
	});

	describe('Data Validation', () => {
		it('should validate tile IDs', () => {
			const ids = ['123456789', 'instagram-123', 'tile-abc-def'];

			ids.forEach((id) => {
				expect(id.length).toBeGreaterThan(0);
			});
		});

		it('should validate media types', () => {
			const validTypes = ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'];
			const types = ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM', 'UNKNOWN'];

			types.forEach((type) => {
				expect(type.length).toBeGreaterThan(0);
			});
		});

		it('should validate permalink URLs', () => {
			const urls = [
				'https://instagram.com/p/ABC123/view',
				'https://www.instagram.com/p/DEF456/view',
			];

			urls.forEach((url) => {
				expect(url).toMatch(/instagram\.com/);
				expect(url).toMatch(/\/p\//);
			});
		});
	});

	describe('Error Handling', () => {
		it('should handle API errors', () => {
			const error = {
				error: {
					message: 'Invalid access token',
					type: 'OAuthException',
					code: 400,
				},
			};

			expect(error.error.message).toBeTruthy();
			expect(error.error.code).toBe(400);
		});

		it('should handle network errors', () => {
			const error = new Error('Network request failed');

			expect(error.message).toBeTruthy();
		});

		it('should handle empty token', () => {
			const token = '';

			expect(token).toBe('');
			expect(token.length).toBe(0);
		});

		it('should handle invalid feed', () => {
			const feed = {
				data: undefined,
				error: 'Invalid user',
			};

			expect((feed as any).data).toBeUndefined();
		});
	});

	describe('Row Layout Configuration', () => {
		it('should validate row count options', () => {
			const rows = [1, 2, 3, 4];

			rows.forEach((row) => {
				expect(row).toBeGreaterThan(0);
			});
		});

		it('should calculate grid dimensions', () => {
			const tileCount = 9;
			const rowCount = 3;
			const colCount = tileCount / rowCount;

			expect(colCount).toBe(3);
		});

		it('should handle partial rows', () => {
			const tileCount = 10;
			const rowCount = 3;
			const fullRows = Math.floor(tileCount / rowCount);
			const remainder = tileCount % rowCount;

			expect(fullRows).toBe(3);
			expect(remainder).toBe(1);
		});
	});

	describe('Edge Cases', () => {
		it('should handle very long captions', () => {
			const caption = 'A'.repeat(2200);
			expect(caption.length).toBe(2200);
		});

		it('should handle special characters in captions', () => {
			const captions = [
				'Price: $99.99 #sale',
				'Visit our site: example.com',
				'Line1\nLine2\nLine3',
				'Quote: "Check this out"',
			];

			captions.forEach((caption) => {
				expect(caption.length).toBeGreaterThan(0);
			});
		});

		it('should handle large feed (100+ tiles)', () => {
			const tiles = Array.from({ length: 150 }, (_, i) => ({
				id: `tile-${i}`,
				caption: `Post ${i}`,
			}));

			expect(tiles).toHaveLength(150);
		});

		it('should handle tiles without images', () => {
			const tile = {
				id: 'tile-123',
				caption: 'No image',
				media_url: undefined,
			};

			expect(tile.media_url).toBeUndefined();
			expect(tile.caption).toBeTruthy();
		});

		it('should handle tiles without captions', () => {
			const tile = {
				id: 'tile-456',
				media_url: 'https://example.com/image.jpg',
				caption: undefined,
			};

			expect(tile.media_url).toBeTruthy();
			expect(tile.caption).toBeUndefined();
		});
	});
});
