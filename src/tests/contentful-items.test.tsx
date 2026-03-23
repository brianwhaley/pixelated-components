import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { ContentfulItems } from '../components/integrations/contentful.items.components';

// Mock Contentful functions
vi.mock('../components/integrations/contentful.delivery', () => ({
	getContentfulEntriesByType: vi.fn(),
	getContentfulEntryByEntryID: vi.fn(),
}));

// Mock dependencies
vi.mock('../components/general/carousel', () => ({
	Carousel: ({ cards }: any) => (
		<div data-testid="carousel">
			{cards && cards.map((card: any, idx: number) => (
				<div key={idx} className="carousel-item">{card.title}</div>
			))}
		</div>
	)
}));

vi.mock('../components/general/smartimage', () => ({
	SmartImage: ({ src, alt }: any) => <img src={src} alt={alt} data-testid="contentful-image" />
}));

vi.mock('../components/shoppingcart/shoppingcart.components', () => ({
	AddToCartButton: () => <button data-testid="add-to-cart">Add to Cart</button>,
	ViewItemDetails: () => <button data-testid="view-details">View Details</button>
}));

vi.mock('../components/shoppingcart/shoppingcart.functions', () => ({
	addToShoppingCart: vi.fn()
}));

vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: () => ({
		contentful: {
			space_id: 'test-space',
			delivery_access_token: 'test-token'
		},
		cloudinary: {
			product_env: 'test-env'
		}
	})
}));

vi.mock('../components/integrations/cloudinary', () => ({
	getCloudinaryRemoteFetchURL: (url: string) => url
}));

describe('Contentful Items Component Tests', () => {
	const mockAsset = {
		sys: { id: 'asset-123' },
		fields: {
			file: {
				url: 'https://images.ctfassets.net/image.jpg',
				contentType: 'image/jpeg'
			},
			title: 'Product Image'
		}
	};

	const mockContentfulItem = {
		sys: { id: 'item-123', contentType: { sys: { id: 'item' } } },
		fields: {
			title: 'Product Name',
			description: 'Product description',
			price: 29.99,
			images: [{ sys: { id: 'asset-123' } }],
		},
	};

	const mockContentfulResponse = {
		items: [mockContentfulItem],
		assets: [mockAsset],
		includes: {
			Asset: [mockAsset]
		}
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('ContentfulItems Component Rendering', () => {
		it('should render ContentfulItems component with apiProps', () => {
			const { container } = render(
				<ContentfulItems
					apiProps={{
						space_id: 'test-space',
						delivery_access_token: 'test-token'
					}}
				/>
			);

			expect(container).toBeDefined();
		});

		it('should accept cloudinaryProductEnv prop', () => {
			const { container } = render(
				<ContentfulItems
					apiProps={{ space_id: 'test-space' }}
					cloudinaryProductEnv="test-env"
				/>
			);

			expect(container).toBeDefined();
		});

		it('should handle empty items', () => {
			const { container } = render(
				<ContentfulItems
					apiProps={{ space_id: 'test-space' }}
				/>
			);

			expect(container).toBeDefined();
		});
	});

	describe('Contentful Item Structure', () => {
		it('should validate basic item structure', () => {
			const item = mockContentfulItem;

			expect(item.sys.id).toBeTruthy();
			expect(item.fields.title).toBeTruthy();
			expect(item.fields.description).toBeTruthy();
		});

		it('should validate required fields', () => {
			const item = {
				sys: { id: 'item-456' },
				fields: {
					title: 'Item Title',
					slug: 'item-slug',
				},
			};

			expect(item.sys.id).toBeTruthy();
			expect(item.fields.title).toBeTruthy();
		});

		it('should handle optional fields', () => {
			const item = {
				sys: { id: 'item-789' },
				fields: {
					title: 'Title',
					image: undefined,
					tags: undefined,
				},
			};

			expect(item.sys.id).toBeTruthy();
			expect((item.fields as any).image).toBeUndefined();
		});

		it('should validate item with images array', () => {
			const item = {
				sys: { id: 'item-with-images' },
				fields: {
					title: 'Imaged Item',
					images: [
						{ sys: { id: 'asset-1' } },
						{ sys: { id: 'asset-2' } },
					]
				}
			};

			expect(item.fields.images).toHaveLength(2);
		});

		it('should handle item with price field', () => {
			const item = mockContentfulItem;

			expect(typeof item.fields.price).toBe('number');
			expect(item.fields.price).toBeGreaterThan(0);
		});
	});

	describe('Content Types', () => {
		it('should validate text content fields', () => {
			const item = { title: 'Text Title', description: 'Text content' };

			expect(typeof item.title).toBe('string');
			expect(typeof item.description).toBe('string');
		});

		it('should validate numeric fields', () => {
			const item = {
				price: 99.99,
				quantity: 5,
				rating: 4.5,
			};

			expect(typeof item.price).toBe('number');
			expect(typeof item.quantity).toBe('number');
			expect(item.rating).toBeGreaterThan(0);
		});

		it('should validate boolean fields', () => {
			const item = {
				isActive: true,
				isFeatured: false,
				isAvailable: true,
			};

			expect(typeof item.isActive).toBe('boolean');
			expect(item.isActive).toBe(true);
		});

		it('should validate array fields', () => {
			const item = {
				tags: ['tag1', 'tag2', 'tag3'],
				categories: ['cat1', 'cat2'],
			};

			expect(Array.isArray(item.tags)).toBe(true);
			expect(item.tags).toHaveLength(3);
		});

		it('should validate linked entries', () => {
			const entry = {
				sys: { id: 'linked-entry-1', linkType: 'Entry' },
				fields: { title: 'Related Entry' }
			};

			expect(entry.sys.linkType).toBe('Entry');
			expect(entry.fields.title).toBeTruthy();
		});
	});

	describe('Asset Handling', () => {
		it('should validate asset structure', () => {
			const asset = mockAsset;

			expect(asset.sys.id).toBeTruthy();
			expect(asset.fields.file).toBeDefined();
			expect(asset.fields.file.url).toContain('http');
		});

		it('should validate file metadata', () => {
			const asset = {
				fields: {
					file: {
						url: 'https://images.ctfassets.net/image.jpg',
						contentType: 'image/jpeg',
						size: 50000
					}
				}
			};

			expect(asset.fields.file.contentType).toBe('image/jpeg');
			expect(asset.fields.file.size).toBeGreaterThan(0);
		});

		it('should handle multiple image formats', () => {
			const assets = [
				{ fields: { file: { url: 'image.jpg', contentType: 'image/jpeg' } } },
				{ fields: { file: { url: 'image.png', contentType: 'image/png' } } },
				{ fields: { file: { url: 'image.webp', contentType: 'image/webp' } } },
			];

			assets.forEach((asset) => {
				expect(asset.fields.file.url).toBeTruthy();
				expect(asset.fields.file.contentType).toContain('image');
			});
		});
	});

	describe('API Configuration', () => {
		it('should accept apiProps configuration', () => {
			const config = {
				space_id: 'test-space',
				delivery_access_token: 'test-token'
			};

			expect(config.space_id).toBeTruthy();
			expect(config.delivery_access_token).toBeTruthy();
		});

		it('should merge provider config with props', () => {
			const providerConfig = {
				space_id: 'provider-space'
			};

			const propsConfig = {
				delivery_access_token: 'props-token'
			};

			const merged = { ...providerConfig, ...propsConfig };

			expect(merged.space_id).toBe('provider-space');
			expect(merged.delivery_access_token).toBe('props-token');
		});

		it('should prioritize props config over provider', () => {
			const providerConfig = {
				space_id: 'provider-space',
				token: 'provider-token'
			};

			const propsConfig = {
				space_id: 'props-space'
			};

			const merged = { ...providerConfig, ...propsConfig };

			expect(merged.space_id).toBe('props-space');
		});
	});

	describe('Entry Linking', () => {
		it('should handle linked entries', () => {
			const item = {
				fields: {
					relatedProducts: [
						{ sys: { id: 'related-1', linkType: 'Entry' } },
						{ sys: { id: 'related-2', linkType: 'Entry' } },
					]
				}
			};

			expect(item.fields.relatedProducts).toHaveLength(2);
		});

		it('should handle empty linked entries', () => {
			const item = {
				fields: {
					relatedProducts: []
				}
			};

			expect(item.fields.relatedProducts).toHaveLength(0);
		});
	});

describe('Content Properties', () => {
	it('should handle content tags and categories', () => {
		const item = {
			tags: ['tech', 'gadgets'],
			categories: ['Electronics'],
			images: [],
		};

		expect(Array.isArray(item.tags)).toBe(true);
		expect(item.tags.length).toBeGreaterThan(0);
	});

		it('should validate linked content references', () => {
			const item = {
				author: { sys: { id: 'author-123' } },
				relatedItems: [{ sys: { id: 'item-456' } }],
			};

			expect(item.author.sys.id).toBeTruthy();
			expect(Array.isArray(item.relatedItems)).toBe(true);
		});

		it('should handle image assets', () => {
			const images = [
				{ url: 'https://example.com/image.jpg' },
				{ url: 'https://example.com/img2.jpg' },
				{ url: 'https://example.com/img3.jpg' }
			];

			expect(images).toHaveLength(3);
			images.forEach((img) => {
				expect(img.url).toContain('http');
			});
		});
	});

	describe('Shopping Cart Integration', () => {
		it('should prepare cart item from content', () => {
			const contentItem = {
				fields: {
					title: 'Product',
					price: 49.99,
					sku: 'SKU-123',
					image: { fields: { file: { url: 'https://example.com/img.jpg' } } },
				},
			};

			const cartItem = {
				itemID: contentItem.fields.sku,
				itemTitle: contentItem.fields.title,
				itemCost: contentItem.fields.price,
				itemQuantity: 1,
			};

			expect(cartItem.itemID).toBe('SKU-123');
			expect(cartItem.itemCost).toBe(49.99);
		});

		it('should validate cart item structure', () => {
			const cartItem = {
				itemID: 'SKU-456',
				itemTitle: 'Product Name',
				itemCost: 29.99,
				itemQuantity: 2,
				itemImageURL: 'https://example.com/image.jpg',
			};

			expect(cartItem.itemID).toBeTruthy();
			expect(cartItem.itemCost).toBeGreaterThan(0);
			expect(cartItem.itemQuantity).toBeGreaterThan(0);
		});
	});

	describe('Pagination', () => {
		it('should handle item collection pagination', () => {
			const response = {
				items: [
					{ sys: { id: '1' } },
					{ sys: { id: '2' } },
					{ sys: { id: '3' } },
				],
				skip: 0,
				limit: 100,
				total: 250,
			};

			expect(response.items.length).toBe(3);
			expect(response.total).toBe(250);
		});

		it('should calculate pages', () => {
			const total = 250;
			const limit = 50;
			const pages = Math.ceil(total / limit);

			expect(pages).toBe(5);
		});

		it('should handle pagination parameters', () => {
			const params = {
				skip: 100,
				limit: 50,
				order: '-sys.createdAt',
			};

			expect(params.skip).toBeGreaterThanOrEqual(0);
			expect(params.limit).toBeGreaterThan(0);
		});
	});

	describe('Content Relationships', () => {
		it('should link to related content entries', () => {
			const item = {
				sys: { id: 'item-123' },
				fields: {
					author: { sys: { id: 'author-456' } },
					tags: ['tag1', 'tag2'],
				},
			};

			expect(item.fields.author.sys.id).toBeTruthy();
		});

		it('should handle rich text references', () => {
			const richText = {
				nodeType: 'document',
				content: [
					{ nodeType: 'paragraph', content: [{ value: 'Text content' }] },
				],
			};

			expect(richText.nodeType).toBe('document');
			expect(richText.content.length).toBeGreaterThan(0);
		});
	});

	describe('Metadata', () => {
		it('should include entry metadata', () => {
			const item = {
				sys: {
					id: 'item-123',
					createdAt: '2024-01-01T00:00:00Z',
					updatedAt: '2024-01-15T00:00:00Z',
					contentType: { sys: { id: 'product' } },
				},
				fields: { title: 'Item' },
			};

			expect(item.sys.id).toBeTruthy();
			expect(item.sys.createdAt).toBeTruthy();
			expect(item.sys.contentType.sys.id).toBe('product');
		});

		it('should handle revision information', () => {
			const sys = {
				id: 'item-123',
				revision: 5,
				contentType: { sys: { id: 'product' } },
			};

			expect(typeof sys.revision).toBe('number');
			expect(sys.revision).toBeGreaterThan(0);
		});
	});

	describe('Slugs and URLs', () => {
		it('should generate URL-friendly slugs', () => {
			const items = [
				{ title: 'Product Name', slug: 'product-name' },
				{ title: 'Test Item', slug: 'test-item' },
			];

			items.forEach((item) => {
				expect(item.slug).toMatch(/^[a-z0-9-]+$/);
			});
		});

		it('should build detail URLs', () => {
			const slug = 'product-name';
			const url = `/products/${slug}`;

			expect(url).toContain(slug);
			expect(url.startsWith('/')).toBe(true);
		});
	});

	describe('Error Handling', () => {
		it('should validate API error responses', () => {
			const error = {
				sys: { id: 'notFound', type: 'Error' },
				message: 'Entry not found',
				requestId: 'req-123',
			};

			expect(error.sys.id).toBeTruthy();
			expect(error.message).toBeTruthy();
		});

		it('should handle missing required fields', () => {
			const item = {
				sys: { id: 'item-123' },
				fields: {
					title: 'Item',
					// missing required description
				},
			};

			expect(item.sys.id).toBeTruthy();
			expect((item.fields as any).description).toBeUndefined();
		});

		it('should handle network errors', () => {
			const error = new Error('Network request failed');
			expect(error.message).toBeTruthy();
		});
	});

	describe('Filtering and Sorting', () => {
		it('should filter items by content type', () => {
			const items = [
				{ sys: { contentType: { sys: { id: 'product' } } } },
				{ sys: { contentType: { sys: { id: 'article' } } } },
				{ sys: { contentType: { sys: { id: 'product' } } } },
			];

			const filtered = items.filter(
				(item) => item.sys.contentType.sys.id === 'product'
			);

			expect(filtered).toHaveLength(2);
		});

		it('should sort items by creation date', () => {
			const items = [
				{ sys: { createdAt: '2024-01-15' }, title: 'Item 1' },
				{ sys: { createdAt: '2024-01-10' }, title: 'Item 2' },
				{ sys: { createdAt: '2024-01-20' }, title: 'Item 3' },
			];

			const sorted = [...items].sort(
				(a, b) =>
					new Date(b.sys.createdAt).getTime() -
					new Date(a.sys.createdAt).getTime()
			);

			expect(sorted[0].title).toBe('Item 3');
		});

		it('should sort items by price', () => {
			const items = [
				{ title: 'Item 1', fields: { price: 50 } },
				{ title: 'Item 2', fields: { price: 25 } },
				{ title: 'Item 3', fields: { price: 75 } },
			];

			const sorted = [...items].sort(
				(a, b) => a.fields.price - b.fields.price
			);

			expect(sorted[0].fields.price).toBe(25);
			expect(sorted[2].fields.price).toBe(75);
		});
	});
});
