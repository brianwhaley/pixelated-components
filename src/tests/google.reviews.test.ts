import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGoogleReviewsByPlaceId } from '../components/general/google.reviews.functions';

// Mock fetch
global.fetch = vi.fn();

const mockFetch = vi.mocked(fetch);

describe('getGoogleReviewsByPlaceId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches reviews successfully', async () => {
		const mockResponse = {
			status: 'OK',
			result: {
				name: 'Test Place',
				place_id: 'test-place-id',
				formatted_address: '123 Test St',
				reviews: [
					{
						author_name: 'John Doe',
						rating: 5,
						text: 'Great!',
					},
				],
			},
		};

		mockFetch.mockResolvedValue({
			json: vi.fn().mockResolvedValue(mockResponse),
		} as any);

		const result = await getGoogleReviewsByPlaceId({
			placeId: 'test-place-id',
			apiKey: 'test-key',
		});

		expect(result.place).toEqual({
			name: 'Test Place',
			place_id: 'test-place-id',
			formatted_address: '123 Test St',
		});
		expect(result.reviews).toEqual([
			{
				author_name: 'John Doe',
				rating: 5,
				text: 'Great!',
			},
		]);
		expect(mockFetch).toHaveBeenCalledWith(
			'https://maps.googleapis.com/maps/api/place/details/json?place_id=test-place-id&fields=reviews%2Cname%2Cplace_id%2Cformatted_address&key=test-key',
			{ cache: 'no-store' }
		);
	});

	it('limits reviews when maxReviews is provided', async () => {
		const mockResponse = {
			status: 'OK',
			result: {
				name: 'Test Place',
				place_id: 'test-place-id',
				reviews: [
					{ author_name: 'John', rating: 5 },
					{ author_name: 'Jane', rating: 4 },
					{ author_name: 'Bob', rating: 3 },
				],
			},
		};

		mockFetch.mockResolvedValue({
			json: vi.fn().mockResolvedValue(mockResponse),
		} as any);

		const result = await getGoogleReviewsByPlaceId({
			placeId: 'test-place-id',
			maxReviews: 2,
			apiKey: 'test-key',
		});

		expect(result.reviews).toHaveLength(2);
	});

	it('includes language in URL when provided', async () => {
		const mockResponse = {
			status: 'OK',
			result: {
				name: 'Test Place',
				place_id: 'test-place-id',
				reviews: [],
			},
		};

		mockFetch.mockResolvedValue({
			json: vi.fn().mockResolvedValue(mockResponse),
		} as any);

		await getGoogleReviewsByPlaceId({
			placeId: 'test-place-id',
			language: 'es',
			apiKey: 'test-key',
		});

		expect(mockFetch).toHaveBeenCalledWith(
			expect.stringContaining('&language=es'),
			expect.any(Object)
		);
	});

	it('uses proxy when proxyBase is provided', async () => {
		const mockResponse = {
			status: 'OK',
			result: {
				name: 'Test Place',
				place_id: 'test-place-id',
				reviews: [],
			},
		};

		mockFetch.mockResolvedValue({
			json: vi.fn().mockResolvedValue(mockResponse),
		} as any);

		await getGoogleReviewsByPlaceId({
			placeId: 'test-place-id',
			proxyBase: 'https://proxy.com?url=',
			apiKey: 'test-key',
		});

		const expectedUrl = 'https://proxy.com?url=https%3A%2F%2Fmaps.googleapis.com%2Fmaps%2Fapi%2Fplace%2Fdetails%2Fjson%3Fplace_id%3Dtest-place-id%26fields%3Dreviews%252Cname%252Cplace_id%252Cformatted_address%26key%3Dtest-key';
		expect(mockFetch).toHaveBeenCalledWith(expectedUrl, { cache: 'no-store' });
	});

	it('returns empty reviews when API status is not OK', async () => {
		const mockResponse = {
			status: 'INVALID_REQUEST',
		};

		mockFetch.mockResolvedValue({
			json: vi.fn().mockResolvedValue(mockResponse),
		} as any);

		const result = await getGoogleReviewsByPlaceId({
			placeId: 'test-place-id',
			apiKey: 'test-key',
		});

		expect(result.place).toBeUndefined();
		expect(result.reviews).toEqual([]);
	});

	it('throws error when fetch fails', async () => {
		mockFetch.mockRejectedValue(new Error('Network error'));

		await expect(
			getGoogleReviewsByPlaceId({
				placeId: 'test-place-id',
				apiKey: 'test-key',
			})
		).rejects.toThrow('Network error');
	});
});