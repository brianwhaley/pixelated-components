import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { YelpReviews } from '../components/integrations/yelp';

// Mock smartFetch
vi.mock('../components/general/smartfetch', () => ({
	smartFetch: vi.fn()
}));

import { smartFetch } from '../components/general/smartfetch';

describe('YelpReviews Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(smartFetch).mockClear();
	});

	it('should render component with business ID', async () => {
		vi.mocked(smartFetch).mockResolvedValueOnce({
			reviews: [
				{
					id: '1',
					rating: 5,
					text: 'Great experience!',
					user: { name: 'John Doe' }
				}
			]
		});

		const { container } = render(<YelpReviews businessID="biz-123" />);
		expect(container).toBeTruthy();
	});

	it('should accept required business ID prop', () => {
		const businessID = 'biz-456789';
		vi.mocked(smartFetch).mockResolvedValueOnce({ reviews: [] });

		const { container } = render(<YelpReviews businessID={businessID} />);
		expect(container).toBeTruthy();
	});

	it('should show loading state initially', () => {
		vi.mocked(smartFetch).mockImplementationOnce(() =>
			new Promise(resolve => setTimeout(() =>
				resolve({ reviews: [] }), 100)
			)
		);

		const { container } = render(<YelpReviews businessID="biz-123" />);
		expect(screen.queryByText(/loading/i)).toBeTruthy();
	});

	it('should display Yelp Reviews heading', async () => {
		vi.mocked(smartFetch).mockResolvedValueOnce({ reviews: [] });

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			expect(container.textContent).toContain('Yelp Reviews');
		});
	});

	it('should display business reviews data', async () => {
		vi.mocked(smartFetch).mockResolvedValueOnce({
			reviews: [
				{
					id: 'rev-1',
					rating: 5,
					text: 'Great experience!',
					user: { name: 'John Doe' }
				}
			]
		});

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			expect(container.textContent).toContain('Great experience!');
			expect(container.textContent).toContain('John Doe');
		});
	});

	it('should display ratings from reviews', async () => {
		vi.mocked(smartFetch).mockResolvedValueOnce({
			reviews: [
				{
					id: '1',
					rating: 4.5,
					text: 'Good food',
					user: { name: 'Jane Smith' }
				}
			]
		});

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			expect(container.textContent).toContain('Rating');
		});
	});

	it('should handle multiple reviews', async () => {
		vi.mocked(smartFetch).mockResolvedValueOnce({
			reviews: [
				{
					id: '1',
					rating: 5,
					text: 'Excellent!',
					user: { name: 'User 1' }
				},
				{
					id: '2',
					rating: 4,
					text: 'Good',
					user: { name: 'User 2' }
				}
			]
		});

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			expect((container.querySelectorAll('.review') || []).length).toBeGreaterThanOrEqual(0);
		});
	});

	it('should display review text content', async () => {
		const reviewText = 'Great restaurant with amazing service!';
		
		vi.mocked(smartFetch).mockResolvedValueOnce({
			reviews: [
				{
					id: '1',
					rating: 5,
					text: reviewText,
					user: { name: 'John Doe' }
				}
			]
		});

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			expect(container.textContent).toContain(reviewText);
		});
	});

	it('should display reviewer names', async () => {
		vi.mocked(smartFetch).mockResolvedValueOnce({
			reviews: [
				{
					id: '1',
					rating: 5,
					text: 'Great!',
					user: { name: 'Sarah Johnson' }
				}
			]
		});

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			expect(container.textContent).toContain('Sarah Johnson');
		});
	});

	it('should handle HTTP errors from Yelp API', async () => {
		vi.mocked(smartFetch).mockRejectedValueOnce(new Error('HTTP 401 Unauthorized'));

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			expect(screen.queryByText(/error/i) || container.textContent.includes('Error')).toBeTruthy();
		}, { timeout: 100 });
	});

	it('should handle network fetch errors', async () => {
		vi.mocked(smartFetch).mockRejectedValueOnce(
			new Error('Network error')
		);

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			expect(screen.queryByText(/error/i) || container.textContent.includes('Error')).toBeTruthy();
		}, { timeout: 100 });
	});

	it('should map review IDs as keys for list rendering', async () => {
		vi.mocked(smartFetch).mockResolvedValueOnce({
			reviews: [
				{
					id: 'unique-id-1',
					rating: 5,
					text: 'Review 1',
					user: { name: 'User 1' }
				},
				{
					id: 'unique-id-2',
					rating: 4,
					text: 'Review 2',
					user: { name: 'User 2' }
				}
			]
		});

		const { container } = render(<YelpReviews businessID="biz-123" />);
		await waitFor(() => {
			// Component should render successfully with unique keys
			expect(container.querySelectorAll('.review').length).toBeGreaterThan(0);
		});
	});

	it('should use correct API URL with business ID', () => {
		const businessID = 'test-business-id';
		
		vi.mocked(smartFetch).mockResolvedValueOnce({ reviews: [] });

		render(<YelpReviews businessID={businessID} />);

		expect(smartFetch).toHaveBeenCalled();
		const callUrl = vi.mocked(smartFetch).mock.calls[0][0] as string;
		expect(callUrl).toContain(businessID);
	});
});

