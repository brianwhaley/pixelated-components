import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InstagramTiles } from '../components/integrations/instagram.components';
import * as instagramFunctions from '../components/integrations/instagram.functions';

// Mock the config hook
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: vi.fn(() => ({
		instagram: {
			accessToken: 'config-token-123',
			userId: 'config-user-123'
		}
	}))
}));

// Mock the Tiles component
vi.mock('../components/general/tiles', () => ({
	Tiles: ({ cards, rowCount }: any) => (
		<div data-testid="tiles" data-card-count={cards.length} data-row-count={rowCount}>
			{cards.map((card: any) => (
				<div key={card.id} className="tile">{card.title}</div>
			))}
		</div>
	)
}));

describe('InstagramTiles Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should display loading message initially', () => {
		vi.spyOn(instagramFunctions, 'getInstagramTiles').mockImplementation(() => new Promise(() => {}));
		
		render(<InstagramTiles />);
		
		expect(screen.getByText('Loading Instagram posts...')).toBeInTheDocument();
	});

	it('should display error message when fetch fails', async () => {
		vi.spyOn(instagramFunctions, 'getInstagramTiles').mockRejectedValue(
			new Error('API Error')
		);
		
		render(<InstagramTiles />);
		
		await waitFor(() => {
			expect(screen.getByText(/Error:/)).toBeInTheDocument();
		});
	});

	it('should display helpful error message about permissions', async () => {
		vi.spyOn(instagramFunctions, 'getInstagramTiles').mockRejectedValue(
			new Error('Invalid token')
		);
		
		render(<InstagramTiles />);
		
		await waitFor(() => {
			expect(screen.getByText(/instagram_basic permissions/)).toBeInTheDocument();
		});
	});

	it('should display no posts message when tiles array is empty', async () => {
		vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles />);
		
		await waitFor(() => {
			expect(screen.getByText('No Instagram posts found.')).toBeInTheDocument();
		});
	});

	it('should render Tiles component with fetched media', async () => {
		const mockTiles = [
			{ index: 0, cardIndex: 0, cardLength: 2, image: 'img1.jpg', headerText: 'Post 1' },
			{ index: 1, cardIndex: 1, cardLength: 2, image: 'img2.jpg', headerText: 'Post 2' }
		];
		
		vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue(mockTiles);
		
		render(<InstagramTiles />);
		
		await waitFor(() => {
			const tilesContainer = screen.getByTestId('tiles');
			expect(tilesContainer).toBeInTheDocument();
			expect(tilesContainer).toHaveAttribute('data-card-count', '2');
		});
	});

	it('should use accessToken prop when provided', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles accessToken="prop-token-123" />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					accessToken: 'prop-token-123'
				})
			);
		});
	});

	it('should fall back to config accessToken when prop not provided', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					accessToken: 'config-token-123'
				})
			);
		});
	});

	it('should use userId prop when provided', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles userId="prop-user-123" />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'prop-user-123'
				})
			);
		});
	});

	it('should fall back to config userId when prop not provided', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 'config-user-123'
				})
			);
		});
	});

	it('should use limit prop when provided', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles limit={20} />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 20
				})
			);
		});
	});

	it('should use default limit of 12 when not provided', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					limit: 12
				})
			);
		});
	});

	it('should pass useThumbnails option to getInstagramTiles', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles useThumbnails={true} />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					useThumbnails: true
				})
			);
		});
	});

	it('should pass includeVideos option to getInstagramTiles', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles includeVideos={false} />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					includeVideos: false
				})
			);
		});
	});

	it('should pass includeCaptions option to getInstagramTiles', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		render(<InstagramTiles includeCaptions={true} />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					includeCaptions: true
				})
			);
		});
	});

	it('should pass rowCount to Tiles component', async () => {
		vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([
			{ index: 0, cardIndex: 0, cardLength: 1, image: 'img1.jpg', headerText: 'Post 1' }
		]);
		
		render(<InstagramTiles rowCount={3} />);
		
		await waitFor(() => {
			const tilesContainer = screen.getByTestId('tiles');
			expect(tilesContainer).toHaveAttribute('data-row-count', '3');
		});
	});

	it('should refetch when accessToken changes', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		const { rerender } = render(<InstagramTiles accessToken="token-1" />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledTimes(1);
		});
		
		rerender(<InstagramTiles accessToken="token-2" />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledTimes(2);
		});
	});

	it('should refetch when userId changes', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		const { rerender } = render(<InstagramTiles userId="user-1" />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledTimes(1);
		});
		
		rerender(<InstagramTiles userId="user-2" />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledTimes(2);
		});
	});

	it('should refetch when limit changes', async () => {
		const getInstagramTilesSpy = vi.spyOn(instagramFunctions, 'getInstagramTiles').mockResolvedValue([]);
		
		const { rerender } = render(<InstagramTiles limit={10} />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledTimes(1);
		});
		
		rerender(<InstagramTiles limit={20} />);
		
		await waitFor(() => {
			expect(getInstagramTilesSpy).toHaveBeenCalledTimes(2);
		});
	});

	it('should handle errors with no message gracefully', async () => {
		vi.spyOn(instagramFunctions, 'getInstagramTiles').mockRejectedValue(
			new Error('')
		);
		
		render(<InstagramTiles />);
		
		await waitFor(() => {
			expect(screen.getByText(/Failed to fetch Instagram media/)).toBeInTheDocument();
		});
	});
});
