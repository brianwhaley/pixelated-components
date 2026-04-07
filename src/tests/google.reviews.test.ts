import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGoogleReviewsByPlaceId } from '../components/integrations/google.reviews.functions';
import { buildUrl } from '../components/general/urlbuilder';

vi.mock('../components/general/smartfetch');

const { smartFetch } = await import('../components/general/smartfetch');
const mockSmartFetch = vi.mocked(smartFetch);

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

		mockSmartFetch.mockResolvedValue(mockResponse);

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
		expect(mockSmartFetch).toHaveBeenCalled();
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

		mockSmartFetch.mockResolvedValue(mockResponse);

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

		mockSmartFetch.mockResolvedValue(mockResponse);

		await getGoogleReviewsByPlaceId({
			placeId: 'test-place-id',
			language: 'es',
			apiKey: 'test-key',
		});

		expect(mockSmartFetch).toHaveBeenCalled();
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

		mockSmartFetch.mockResolvedValue(mockResponse);

		await getGoogleReviewsByPlaceId({
			placeId: 'test-place-id',
			proxyBase: 'https://proxy.com?url=',
			apiKey: 'test-key',
		});

		expect(mockSmartFetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				proxy: expect.objectContaining({
					url: 'https://proxy.com?url=',
					fallbackOnCors: true
				})
			})
		);
	});

	it('returns empty reviews when API status is not OK', async () => {
		const mockResponse = {
			status: 'INVALID_REQUEST',
		};

		mockSmartFetch.mockResolvedValue(mockResponse);

		const result = await getGoogleReviewsByPlaceId({
			placeId: 'test-place-id',
			apiKey: 'test-key',
		});

		expect(result.place).toBeUndefined();
		expect(result.reviews).toEqual([]);
	});

	it('throws error when fetch fails', async () => {
		mockSmartFetch.mockRejectedValue(new Error('Network error'));

		await expect(
			getGoogleReviewsByPlaceId({
				placeId: 'test-place-id',
				apiKey: 'test-key',
			})
		).rejects.toThrow('Network error');
	});

	describe('buildUrl URL Construction for Google Reviews APIs', () => {
		describe('Google Place Details URL building', () => {
			it('should construct Google Place Details API URL (Section 1)', () => {
				const placeId = 'ChIJIQBpAG2dDogR_85UYduKlzQ';
				const apiKey = 'AIzaSyD...';

				const detailsUrl = buildUrl({
					baseUrl: 'https://maps.googleapis.com/maps/api/place/details/json',
					params: {
						place_id: placeId,
						key: apiKey,
						fields: 'name,rating,reviews,formatted_address'
					}
				});

				expect(detailsUrl).toContain('maps.googleapis.com');
				expect(detailsUrl).toContain('place/details/json');
				expect(detailsUrl).toContain('place_id=' + placeId);
				expect(detailsUrl).toContain('key=AIzaSyD');
			});

			it('should handle different fields parameter (Section 2)', () => {
				const placeId = 'test-place-id';
				const apiKey = 'test-key';

				const allFieldsUrl = buildUrl({
					baseUrl: 'https://maps.googleapis.com/maps/api/place/details/json',
					params: {
						place_id: placeId,
						key: apiKey,
						fields: 'name,rating,reviews,formatted_address,photos'
					}
				});

				const minimalFieldsUrl = buildUrl({
					baseUrl: 'https://maps.googleapis.com/maps/api/place/details/json',
					params: {
						place_id: placeId,
						key: apiKey,
						fields: 'name,rating,reviews'
					}
				});

				expect(allFieldsUrl).toContain('fields=');
				expect(minimalFieldsUrl).toContain('fields=');
				expect(allFieldsUrl).toContain('photos');
			});

			it('should construct URL with language parameter (Section 3)', () => {
				const placeId = 'test-place-id';
				const apiKey = 'test-key';
				const languages = ['en', 'es', 'fr', 'de'];

				languages.forEach(lang => {
					const url = buildUrl({
						baseUrl: 'https://maps.googleapis.com/maps/api/place/details/json',
						params: {
							place_id: placeId,
							key: apiKey,
							language: lang,
							fields: 'name,rating,reviews'
						}
					});

					expect(url).toContain(`language=${lang}`);
				});
			});

			it('should handle proxy URLs for CORS (Section 4)', () => {
				const placeId = 'test-place-id';
				const apiKey = 'test-key';
				const proxyUrl = 'https://proxy.example.com/';

				const proxiedUrl = buildUrl({
					baseUrl: 'https://maps.googleapis.com/maps/api/place/details/json',
					params: {
						place_id: placeId,
						key: apiKey,
						fields: 'name,rating,reviews'
					},
					proxyUrl
				});

				expect(proxiedUrl).toContain('https://proxy.example.com/');
				expect(proxiedUrl).toContain('%3A%2F%2F'); // :// encoded
			});
		});
	});
});
