import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GoogleReviewsCard } from '@/components/general/google.reviews.components';
import { getGoogleReviewsByPlaceId } from '@/components/general/google.reviews.functions';

// Mock the functions
vi.mock('@/components/general/google.reviews.functions', () => ({
	getGoogleReviewsByPlaceId: vi.fn(),
}));

const mockGetGoogleReviewsByPlaceId = vi.mocked(getGoogleReviewsByPlaceId);

describe('GoogleReviewsCard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('displays loading state initially', () => {
		render(<GoogleReviewsCard placeId="test-place-id" />);
		expect(screen.getByText('Loading reviews...')).toBeInTheDocument();
	});

	it('displays error when fetch fails', async () => {
		mockGetGoogleReviewsByPlaceId.mockRejectedValue(new Error('API Error'));

		render(<GoogleReviewsCard placeId="test-place-id" />);

		await waitFor(() => {
			expect(screen.getByText('Error: API Error')).toBeInTheDocument();
		});
	});

	it('displays no reviews when empty', async () => {
		mockGetGoogleReviewsByPlaceId.mockResolvedValue({
			place: { name: 'Test Place', place_id: 'test-place-id', formatted_address: '123 Test St' },
			reviews: [],
		});

		render(<GoogleReviewsCard placeId="test-place-id" />);

		await waitFor(() => {
			expect(screen.getByText('No reviews found.')).toBeInTheDocument();
		});
	});

	it('displays reviews correctly', async () => {
		const mockReviews = [
			{
				author_name: 'John Doe',
				profile_photo_url: 'https://example.com/photo.jpg',
				rating: 5,
				relative_time_description: '2 weeks ago',
				text: 'Great place!',
			},
			{
				author_name: 'Jane Smith',
				rating: 4,
				text: 'Good experience.',
			},
		];

		mockGetGoogleReviewsByPlaceId.mockResolvedValue({
			place: { name: 'Test Place', place_id: 'test-place-id', formatted_address: '123 Test St' },
			reviews: mockReviews,
		});

		render(<GoogleReviewsCard placeId="test-place-id" />);

		await waitFor(() => {
			expect(screen.getByText('Test Place')).toBeInTheDocument();
			expect(screen.getByText('123 Test St')).toBeInTheDocument();
			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText((content) => content.includes('★★★★★'))).toBeInTheDocument();
			expect(screen.getByText((content) => content.includes('5/5'))).toBeInTheDocument();
			expect(screen.getByText((content) => content.includes('2 weeks ago'))).toBeInTheDocument();
			expect(screen.getByText('Great place!')).toBeInTheDocument();
			expect(screen.getByText('Jane Smith')).toBeInTheDocument();
			expect(screen.getByText((content) => content.includes('★★★★☆'))).toBeInTheDocument();
			expect(screen.getByText((content) => content.includes('4/5'))).toBeInTheDocument();
			expect(screen.getByText('Good experience.')).toBeInTheDocument();
		});

		// Check for profile photo
		const images = screen.getAllByRole('img');
		expect(images).toHaveLength(1);
		expect(images[0]).toHaveAttribute('src', 'https://example.com/photo.jpg');
		expect(images[0]).toHaveAttribute('alt', 'John Doe');
	});

	it('displays write review link when place is available', async () => {
		mockGetGoogleReviewsByPlaceId.mockResolvedValue({
			place: { name: 'Test Place', place_id: 'test-place-id' },
			reviews: [],
		});

		render(<GoogleReviewsCard placeId="test-place-id" />);

		await waitFor(() => {
			const link = screen.getByText('Write a review on Google →');
			expect(link).toHaveAttribute('href', 'https://search.google.com/local/writereview?placeid=test-place-id');
		});
	});

	it('calls getGoogleReviewsByPlaceId with correct params', async () => {
		mockGetGoogleReviewsByPlaceId.mockResolvedValue({
			place: { name: 'Test Place', place_id: 'test-place-id' },
			reviews: [],
		});

		render(<GoogleReviewsCard placeId="test-place-id" language="en" maxReviews={5} proxyBase="https://proxy.com" />);

		await waitFor(() => {
			expect(mockGetGoogleReviewsByPlaceId).toHaveBeenCalledWith({
				placeId: 'test-place-id',
				language: 'en',
				maxReviews: 5,
				proxyBase: 'https://proxy.com',
				apiKey: expect.any(String), // API key is hardcoded
			});
		});
	});
});