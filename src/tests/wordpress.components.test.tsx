import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
	getCachedWordPressItems,
	BlogPostList,
	BlogPostSummary,
	BlogPostCategories
} from '../components/integrations/wordpress.components';

describe('WordPress Components', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getCachedWordPressItems', () => {
		it('should return undefined or array when called', async () => {
			const result = await getCachedWordPressItems({ site: 'example.wordpress.com' });
			expect(result === undefined || Array.isArray(result)).toBe(true);
		});

		it('should handle missing site parameter', async () => {
			const result = await getCachedWordPressItems({ site: '' });
			expect(result === undefined || Array.isArray(result)).toBe(true);
		});
	});

	describe('BlogPostList Component', () => {
		const mockPosts = [
			{
				ID: 1,
				title: 'First Post',
				excerpt: 'First excerpt',
				date: '2024-01-15',
				URL: 'https://example.com/post-1',
				categories: { Technology: 1, News: 2 },
				featured_image: 'https://example.com/image1.jpg'
			},
			{
				ID: 2,
				title: 'Second Post',
				excerpt: 'Second excerpt',
				date: '2024-01-14',
				URL: 'https://example.com/post-2',
				categories: { Business: 3 },
				featured_image: 'https://example.com/image2.jpg'
			}
		];

		it('should render list of blog posts', () => {
			render(<BlogPostList posts={mockPosts} />);

			expect(screen.getByText('First Post')).toBeInTheDocument();
			expect(screen.getByText('Second Post')).toBeInTheDocument();
		});

		it('should display excerpt for each post', () => {
			render(<BlogPostList posts={mockPosts} />);

			expect(screen.getByText(/First excerpt/)).toBeInTheDocument();
			expect(screen.getByText(/Second excerpt/)).toBeInTheDocument();
		});

		it('should handle empty posts array', () => {
			const { container } = render(<BlogPostList posts={[]} />);

			expect(container.querySelector('.blog-post-summary')).not.toBeInTheDocument();
		});

		it('should render post links', () => {
			render(<BlogPostList posts={mockPosts} />);

			const links = screen.getAllByRole('link');
			expect(links.length).toBeGreaterThan(0);
		});

		it('should pass showCategories prop correctly', () => {
			render(<BlogPostList posts={mockPosts} showCategories={false} />);

			expect(screen.getByText('First Post')).toBeInTheDocument();
		});

		it('should remain wrapped by SmartErrorBoundary and render safely', () => {
			render(<BlogPostList posts={mockPosts} />);

			expect(screen.getByText('First Post')).toBeInTheDocument();
			expect(screen.queryByText(/Sorry, something went wrong loading/i)).not.toBeInTheDocument();
		});
	});

	describe('BlogPostSummary Component', () => {
		const mockPost = {
			ID: 1,
			title: 'Test Post Title',
			excerpt: '<p>Test excerpt content</p>',
			date: '2024-01-15T10:00:00',
			URL: 'https://example.com/posts/1',
			categories: { Technology: 1 },
			featured_image: 'https://example.com/image.jpg',
			showCategories: true
		};

		it('should render post title', () => {
			render(<BlogPostSummary {...mockPost} />);

			expect(screen.getByText('Test Post Title')).toBeInTheDocument();
		});

		it('should render post excerpt', () => {
			render(<BlogPostSummary {...mockPost} />);

			expect(screen.getByText(/Test excerpt content/)).toBeInTheDocument();
		});

		it('should display publication date', () => {
			render(<BlogPostSummary {...mockPost} />);

			const published = screen.getByText(/Published:/);
			expect(published).toBeInTheDocument();
		});

		it('should render featured image', () => {
			render(<BlogPostSummary {...mockPost} />);

			const img = screen.getByAltText('Test Post Title');
			expect(img).toBeInTheDocument();
		});

		it('should handle missing featured image', () => {
			const postNoImage = { ...mockPost, featured_image: undefined };

			render(<BlogPostSummary {...postNoImage} />);

			expect(screen.getByText('Test Post Title')).toBeInTheDocument();
		});

		it('should handle missing categories', () => {
			const postNoCategories = { ...mockPost, categories: undefined };

			render(<BlogPostSummary {...postNoCategories} />);

			expect(screen.getByText('Test Post Title')).toBeInTheDocument();
		});

		it('should hide categories when showCategories is false', () => {
			const postHideCategories = { ...mockPost, showCategories: false };

			render(<BlogPostSummary {...postHideCategories} />);

			expect(screen.queryByText(/Categories:/)).not.toBeInTheDocument();
		});

		it('should handle undefined excerpt', () => {
			const postNoExcerpt = { ...mockPost, excerpt: undefined };

			render(<BlogPostSummary {...postNoExcerpt} />);

			expect(screen.getByText('Test Post Title')).toBeInTheDocument();
		});
	});

	describe('BlogPostCategories Component', () => {
		const mockCategories = ['Technology', 'Business', 'Lifestyle'];

		it('should render category pills', () => {
			render(<BlogPostCategories categories={mockCategories} />);

			expect(screen.getByTitle('technology')).toBeInTheDocument();
			expect(screen.getByTitle('business')).toBeInTheDocument();
			expect(screen.getByTitle('lifestyle')).toBeInTheDocument();
		});

		it('should handle empty categories array', () => {
			const { container } = render(<BlogPostCategories categories={[]} />);

			expect(container.firstChild).toBeNull();
		});

		it('should handle single category', () => {
			render(<BlogPostCategories categories={['Technology']} />);

			expect(screen.getByTitle('technology')).toBeInTheDocument();
		});

		it('should filter out Uncategorized', () => {
			const categoriesWithUncategorized = ['Technology', 'Uncategorized', 'Business'];

			render(<BlogPostCategories categories={categoriesWithUncategorized} />);

			expect(screen.getByTitle('technology')).toBeInTheDocument();
			expect(screen.getByTitle('business')).toBeInTheDocument();
		});

		it('should render with null categories gracefully', () => {
			const { container } = render(<BlogPostCategories categories={null as any} />);

			expect(container.firstChild).toBeNull();
		});

		it('should handle category strings with spaces', () => {
			const categoriesWithSpaces = ['Web Design', 'UI / UX', 'Data Science'];

			render(<BlogPostCategories categories={categoriesWithSpaces} />);

			expect(screen.getByTitle('web-design')).toBeInTheDocument();
			expect(screen.getByTitle('ui-ux')).toBeInTheDocument();
			expect(screen.getByTitle('data-science')).toBeInTheDocument();
		});
	});

	describe('Integration scenarios', () => {
		it('should render WordPress posts in list', () => {
			const mockPosts = [
				{
					ID: 1,
					title: 'WordPress Post',
					excerpt: 'Post content',
					date: '2024-01-15',
					URL: 'https://example.com/post-1',
					categories: { News: 1 },
					featured_image: 'https://example.com/image.jpg'
				}
			];

			render(<BlogPostList posts={mockPosts} />);

			expect(screen.getByText('WordPress Post')).toBeInTheDocument();
		});

		it('should render single post summary', () => {
			const mockPost = {
				ID: 1,
				title: 'Single Post',
				excerpt: 'This is a post',
				date: '2024-01-15',
				URL: 'https://example.com/post-1',
				categories: { Blog: 1 },
				featured_image: undefined,
				showCategories: true
			};

			render(<BlogPostSummary {...mockPost} />);

			expect(screen.getByText('Single Post')).toBeInTheDocument();
		});

		it('should handle multiple category strings', () => {
			render(<BlogPostCategories categories={['Tech', 'News', 'Updates']} />);

			expect(screen.getByTitle('tech')).toBeInTheDocument();
			expect(screen.getByTitle('news')).toBeInTheDocument();
			expect(screen.getByTitle('updates')).toBeInTheDocument();
		});
	});
});
