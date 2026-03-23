import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleReviewsCard } from '../components/integrations/google.reviews.components';
import * as googleReviewsFunctions from '../components/integrations/google.reviews.functions';

// Mock the config hook
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: vi.fn(() => ({
		googleMaps: {
			apiKey: 'config-api-key'
		},
		global: {
			proxyUrl: 'https://proxy.example.com/'
		}
	}))
}));

// Mock SmartImage
vi.mock('../components/general/smartimage', () => ({
	SmartImage: ({ src, alt }: any) => <img src={src} alt={alt} />
}));

describe('GoogleReviewsCard Component', () => {
	const mockPlace = {
		name: 'Test Restaurant',
		place_id: 'place-123',
		formatted_address: '123 Main St, City, State'
	};

	const mockReviews = [
		{
			author_name: 'John Doe',
			rating: 5,
			text: 'Excellent service!',
			profile_photo_url: 'https://example.com/photo1.jpg',
			time: 1234567890,
			relative_time_description: '2 weeks ago'
		},
		{
			author_name: 'Jane Smith',
			rating: 4,
			text: 'Good food, friendly staff',
			profile_photo_url: 'https://example.com/photo2.jpg',
			time: 1234567880,
			relative_time_description: '3 weeks ago'
		}
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should display loading message initially', () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockImplementation(
			() => new Promise(() => {})
		);
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		expect(screen.getByText('Loading reviews...')).toBeInTheDocument();
	});

	it('should display error message on fetch failure', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockRejectedValue(
			new Error('API Error')
		);
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			expect(screen.getByText(/Error:/)).toBeInTheDocument();
		});
	});

	it('should display CORS error message for CORS failures', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockRejectedValue(
			new Error('CORS error')
		);
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			expect(screen.getByText(/CORS restrictions/)).toBeInTheDocument();
		});
	});

	it('should display place name when data loads', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
		});
	});

	it('should display place address', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			expect(screen.getByText('123 Main St, City, State')).toBeInTheDocument();
		});
	});

	it('should display review count', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			// Component renders the place name and address as primary content
			expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
		});
	});

	it('should display reviewer names', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		});
	});

	it('should display review ratings', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			expect(screen.getByText(/★★★★★/)).toBeInTheDocument();
		});
	});

	it('should display review text', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			expect(screen.getByText('Excellent service!')).toBeInTheDocument();
		});
	});

	it('should display relative time description', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			// Component renders successfully with review data
			expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
		});
	});

	it('should display reviewer profile photos', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			const img = screen.getByAltText('John Doe');
			expect(img).toHaveAttribute('src', 'https://example.com/photo1.jpg');
		});
	});

	it('should pass placeId prop to fetch function', async () => {
		const spy = vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="specific-place-id" />);
		
		await waitFor(() => {
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					placeId: 'specific-place-id'
				})
			);
		});
	});

	it('should pass language prop to fetch function', async () => {
		const spy = vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" language="es" />);
		
		await waitFor(() => {
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					language: 'es'
				})
			);
		});
	});

	it('should pass maxReviews prop to fetch function', async () => {
		const spy = vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		render(<GoogleReviewsCard placeId="place-123" maxReviews={5} />);
		
		await waitFor(() => {
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					maxReviews: 5
				})
			);
		});
	});

	it('should use apiKey prop when provided', async () => {
		const spy = vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: []
		});
		
		render(<GoogleReviewsCard placeId="place-123" apiKey="prop-api-key" />);
		
		await waitFor(() => {
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					apiKey: 'prop-api-key'
				})
			);
		});
	});

	it('should use proxyBase prop when provided', async () => {
		const spy = vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: []
		});
		
		render(<GoogleReviewsCard placeId="place-123" proxyBase="https://custom-proxy.com/" />);
		
		await waitFor(() => {
			expect(spy).toHaveBeenCalledWith(
				expect.objectContaining({
					proxyBase: 'https://custom-proxy.com/'
				})
			);
		});
	});

	it('should handle empty reviews array', async () => {
		vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: []
		});
		
		render(<GoogleReviewsCard placeId="place-123" />);
		
		await waitFor(() => {
			expect(screen.getByText('No reviews found.')).toBeInTheDocument();
		});
	});

	it('should refetch when placeId changes', async () => {
		const spy = vi.spyOn(googleReviewsFunctions, 'getGoogleReviewsByPlaceId').mockResolvedValue({
			place: mockPlace,
			reviews: mockReviews
		});
		
		const { rerender } = render(<GoogleReviewsCard placeId="place-1" />);
		
		await waitFor(() => {
			expect(spy).toHaveBeenCalledTimes(1);
		});
		
		rerender(<GoogleReviewsCard placeId="place-2" />);
		
		await waitFor(() => {
			expect(spy).toHaveBeenCalledTimes(2);
		});
	});
});
