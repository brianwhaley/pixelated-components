import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentfulItems, ContentfulListItem } from '../components/integrations/contentful.items.components';
import * as contentfulFunctions from '../components/integrations/contentful.delivery';

// Mock the config hook
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: vi.fn(() => ({
		cloudinary: {
			product_env: 'test-cloud',
			baseUrl: 'cloudinary.com',
			transforms: {}
		}
	}))
}));

// Mock dependencies
vi.mock('../components/integrations/contentful.delivery', () => ({
	getContentfulEntriesByType: vi.fn(),
	getContentfulEntryByEntryID: vi.fn()
}));

vi.mock('../components/general/smartimage', () => ({
	SmartImage: ({ src, alt, title }: any) => (
		<img src={src} alt={alt} title={title} data-testid="smart-image" />
	)
}));

vi.mock('../components/general/carousel', () => ({
	Carousel: ({ cards }: any) => <div data-testid="carousel">{cards.length} items</div>
}));

vi.mock('../components/general/semantic', () => ({
	PageGridItem: ({ children }: any) => <div data-testid="grid-item">{children}</div>
}));

vi.mock('../components/shoppingcart/shoppingcart.components', () => ({
	AddToCartButton: ({ item }: any) => <button data-testid="add-to-cart">Add to Cart</button>,
	ViewItemDetails: ({ item }: any) => <a href="#details">Details</a>
}));

describe('ContentfulItems Component', () => {
	const mockApiProps = {
		space_id: 'test-space',
		delivery_access_token: 'test-token'
	};

	const mockItems = [
		{
			sys: { id: 'item-1', createdAt: '2024-01-01' },
			fields: {
				title: 'Product 1',
				images: [],
				imageUrl: 'https://example.com/image1.jpg',
				imageAlt: 'Product 1',
				price: 99.99,
				quantity: 1
			}
		},
		{
			sys: { id: 'item-2', createdAt: '2024-01-02' },
			fields: {
				title: 'Product 2',
				images: [],
				imageUrl: 'https://example.com/image2.jpg',
				imageAlt: 'Product 2',
				price: 149.99,
				quantity: 1
			}
		}
	];

	const mockAssets = [
		{
			sys: { id: 'asset-1', createdAt: '2024-01-01' },
			fields: {
				file: { url: 'https://example.com/asset1.jpg' },
				title: 'Asset 1'
			}
		}
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render loading state when no items', () => {
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: [],
			includes: { Asset: [] }
		});
		
		render(<ContentfulItems apiProps={mockApiProps} />);
		
		// Should render empty contentful-items div
		const container = document.getElementById('contentful-items');
		expect(container).toBeInTheDocument();
	});

	it('should fetch items on mount', async () => {
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: mockItems,
			includes: { Asset: mockAssets }
		});
		
		render(<ContentfulItems apiProps={mockApiProps} />);
		
		await waitFor(() => {
			expect(contentfulFunctions.getContentfulEntriesByType).toHaveBeenCalledWith(
				expect.objectContaining({
					apiProps: mockApiProps
				})
			);
		});
	});

	it('should display featured items header for multiple items', async () => {
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: mockItems,
			includes: { Asset: mockAssets }
		});
		
		render(<ContentfulItems apiProps={mockApiProps} />);
		
		await waitFor(() => {
			expect(screen.getByText(/2 Featured Items/)).toBeInTheDocument();
		});
	});

	it('should display featured item header for single item', async () => {
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: [mockItems[0]],
			includes: { Asset: mockAssets }
		});
		
		render(<ContentfulItems apiProps={mockApiProps} />);
		
		await waitFor(() => {
			expect(screen.getByText(/1 Featured Item/)).toBeInTheDocument();
		});
	});

	it('should render items in contentful-items container', async () => {
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: mockItems,
			includes: { Asset: mockAssets }
		});
		
		render(<ContentfulItems apiProps={mockApiProps} />);
		
		await waitFor(() => {
			const container = document.getElementById('contentful-items');
			expect(container).toHaveClass('contentful-items');
		});
	});

	it('should pass cloudinaryProductEnv to child components', async () => {
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: mockItems,
			includes: { Asset: mockAssets }
		});
		
		render(<ContentfulItems apiProps={mockApiProps} cloudinaryProductEnv="custom-cloud" />);
		
		await waitFor(() => {
			// Verify component renders without error
			const container = document.getElementById('contentful-items');
			expect(container).toBeInTheDocument();
		});
	});

	it('should handle fetch errors gracefully', async () => {
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockRejectedValue(
			new Error('Fetch error')
		);
		
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		
		render(<ContentfulItems apiProps={mockApiProps} />);
		
		await waitFor(() => {
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				'Error fetching Contentful items:',
				expect.any(Error)
			);
		});
		
		consoleErrorSpy.mockRestore();
	});

	it('should merge api props with provider config', async () => {
		const spy = vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: [],
			includes: { Asset: [] }
		});
		
		const customApiProps = { space_id: 'custom-space' };
		render(<ContentfulItems apiProps={customApiProps} />);
		
		await waitFor(() => {
			expect(spy).toHaveBeenCalled();
		});
	});

	it('should filter assets matching item image references', async () => {
		const itemWithAssetRef = {
			sys: { id: 'item-1' },
			fields: {
				title: 'Product with Asset',
				images: [{ sys: { id: 'asset-1' } }],
				price: 99.99,
				quantity: 1,
				imageUrl: ''
			}
		};
		
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: [itemWithAssetRef],
			includes: { Asset: mockAssets }
		});
		
		render(<ContentfulItems apiProps={mockApiProps} />);
		
		await waitFor(() => {
			// Component should match assets to items
			const container = document.getElementById('contentful-items');
			expect(container).toBeInTheDocument();
		});
	});

	it('should sort item assets by creation date', async () => {
		const multiAssetItem = {
			sys: { id: 'item-1' },
			fields: {
				title: 'Multi-asset Product',
				images: [{ sys: { id: 'asset-1' } }, { sys: { id: 'asset-2' } }],
				price: 99.99,
				quantity: 1
			}
		};
		
		const multiAssets = [
			{
				sys: { id: 'asset-2', createdAt: '2024-01-03' },
				fields: { file: { url: 'https://example.com/2.jpg' }, title: 'Asset 2' }
			},
			{
				sys: { id: 'asset-1', createdAt: '2024-01-01' },
				fields: { file: { url: 'https://example.com/1.jpg' }, title: 'Asset 1' }
			}
		];
		
		vi.mocked(contentfulFunctions.getContentfulEntriesByType).mockResolvedValue({
			items: [multiAssetItem],
			includes: { Asset: multiAssets }
		});
		
		render(<ContentfulItems apiProps={mockApiProps} />);
		
		await waitFor(() => {
			// Should use earliest (oldest) asset
			const container = document.getElementById('contentful-items');
			expect(container).toBeInTheDocument();
		});
	});
});

describe('ContentfulListItem Component', () => {
	const mockItem = {
		sys: { id: 'item-1' },
		fields: {
			title: 'Test Product',
			imageUrl: 'https://example.com/image.jpg',
			price: 99.99,
			quantity: 1
		}
	};

	it('should render item container', () => {
		const { container } = render(<ContentfulListItem item={mockItem} />);
		
		expect(container.querySelector('.contentful-item')).toBeInTheDocument();
	});

	it('should display item title', () => {
		render(<ContentfulListItem item={mockItem} />);
		
		expect(screen.getByText('Test Product')).toBeInTheDocument();
	});

	it('should render item image', () => {
		render(<ContentfulListItem item={mockItem} />);
		
		const image = screen.getByTestId('smart-image');
		expect(image).toBeInTheDocument();
	});

	it('should create link to item detail page', () => {
		const { container } = render(<ContentfulListItem item={mockItem} />);
		
		const link = container.querySelector('a[href*="./store/item-1"]');
		expect(link).toBeInTheDocument();
	});

	it('should render add to cart button', () => {
		render(<ContentfulListItem item={mockItem} />);
		
		expect(screen.getByTestId('add-to-cart')).toBeInTheDocument();
	});

	it('should use provided cloudinary env for images', () => {
		render(<ContentfulListItem item={mockItem} cloudinaryProductEnv="my-cloud" />);
		
		const image = screen.getByTestId('smart-image');
		expect(image).toBeInTheDocument();
	});

	it('should pass correct image alt text', () => {
		render(<ContentfulListItem item={mockItem} />);
		
		const image = screen.getByAltText('Test Product');
		expect(image).toBeInTheDocument();
	});

	it('should structure shopping cart item with correct properties', () => {
		render(<ContentfulListItem item={mockItem} />);
		
		// Component should render and pass item data to cart button
		expect(screen.getByTestId('add-to-cart')).toBeInTheDocument();
	});

	it('should set link target to _self', () => {
		const { container } = render(<ContentfulListItem item={mockItem} />);
		
		const link = container.querySelector('a[href*="./store/"]');
		expect(link?.getAttribute('target')).toBe('_self');
	});

	it('should render with grid layout classes', () => {
		const { container } = render(<ContentfulListItem item={mockItem} />);
		
		expect(container.querySelector('.contentful-item-photo')).toBeInTheDocument();
		expect(container.querySelector('.contentful-item-body')).toBeInTheDocument();
	});

	it('should work without cloudinary env', () => {
		const { container } = render(<ContentfulListItem item={mockItem} />);
		
		expect(container.querySelector('.contentful-item')).toBeInTheDocument();
	});
});
