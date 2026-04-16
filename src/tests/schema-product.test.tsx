import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { ProductSchema, type ProductSchemaType } from '@/components/foundation/schema';

const defaultProduct: ProductSchemaType['product'] = {
	'@context': 'https://schema.org/',
	'@type': 'Product',
	name: 'Custom Sunglasses',
	description: 'A pair of custom-painted sunglasses with unique artistic design.',
	image: 'https://example.com/sunglasses.jpg',
	brand: {
		'@type': 'Brand',
		name: 'Pixelated Customs'
	},
	offers: {
		'@type': 'Offer',
		url: 'https://example.com/custom-sunglasses',
		priceCurrency: 'USD',
		price: '250.00',
		availability: 'https://schema.org/InStock'
	}
};

describe('ProductSchema', () => {

	it('should render script tag with application/ld+json type', () => {
		const { container } = render(<ProductSchema product={defaultProduct} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		expect(scriptTag).toBeTruthy();
	});

	it('should include schema.org context and Product type', () => {
		const { container } = render(<ProductSchema product={defaultProduct} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData['@context']).toBe('https://schema.org/');
		expect(schemaData['@type']).toBe('Product');
	});

	it('should include product name', () => {
		const { container } = render(<ProductSchema product={defaultProduct} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.name).toBe('Custom Sunglasses');
	});

	it('should include product description', () => {
		const { container } = render(<ProductSchema product={defaultProduct} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.description).toBe(defaultProduct.description);
	});

	it('should include product image', () => {
		const { container } = render(<ProductSchema product={defaultProduct} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.image).toBe('https://example.com/sunglasses.jpg');
	});

	it('should include brand information', () => {
		const { container } = render(<ProductSchema product={defaultProduct} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.brand['@type']).toBe('Brand');
		expect(schemaData.brand.name).toBe('Pixelated Customs');
	});

	it('should include single offer information', () => {
		const { container } = render(<ProductSchema product={defaultProduct} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.offers['@type']).toBe('Offer');
		expect(schemaData.offers.url).toBe('https://example.com/custom-sunglasses');
		expect(schemaData.offers.priceCurrency).toBe('USD');
		expect(schemaData.offers.price).toBe('250.00');
		expect(schemaData.offers.availability).toBe('https://schema.org/InStock');
	});

	it('should handle multiple offers', () => {
		const productWithMultipleOffers: ProductSchemaType['product'] = {
			...defaultProduct,
			offers: [
				{
					'@type': 'Offer',
					url: 'https://example.com/custom-sunglasses',
					priceCurrency: 'USD',
					price: '250.00',
					availability: 'https://schema.org/InStock'
				},
				{
					'@type': 'Offer',
					url: 'https://ebay.com/custom-sunglasses',
					priceCurrency: 'USD',
					price: '245.00',
					availability: 'https://schema.org/InStock'
				}
			]
		};

		const { container } = render(<ProductSchema product={productWithMultipleOffers} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(Array.isArray(schemaData.offers)).toBe(true);
		expect(schemaData.offers.length).toBe(2);
	});

	it('should handle multiple images', () => {
		const productWithMultipleImages: ProductSchemaType['product'] = {
			...defaultProduct,
			image: [
				'https://example.com/sunglasses-1.jpg',
				'https://example.com/sunglasses-2.jpg',
				'https://example.com/sunglasses-3.jpg'
			]
		};

		const { container } = render(<ProductSchema product={productWithMultipleImages} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(Array.isArray(schemaData.image)).toBe(true);
		expect(schemaData.image.length).toBe(3);
	});

	it('should include aggregate rating when provided', () => {
		const productWithRating: ProductSchemaType['product'] = {
			...defaultProduct,
			aggregateRating: {
				'@type': 'AggregateRating',
				ratingValue: '4.5',
				reviewCount: '89'
			}
		};

		const { container } = render(<ProductSchema product={productWithRating} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.aggregateRating['@type']).toBe('AggregateRating');
		expect(schemaData.aggregateRating.ratingValue).toBe('4.5');
		expect(schemaData.aggregateRating.reviewCount).toBe('89');
	});

	it('should handle numeric price values', () => {
		const productWithNumericPrice: ProductSchemaType['product'] = {
			...defaultProduct,
			offers: {
				'@type': 'Offer',
				url: 'https://example.com/product',
				priceCurrency: 'USD',
				price: 199.99,
				availability: 'https://schema.org/InStock'
			}
		};

		const { container } = render(<ProductSchema product={productWithNumericPrice} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.offers.price).toBe(199.99);
	});

	it('should properly serialize to valid JSON-LD', () => {
		const { container } = render(<ProductSchema product={defaultProduct} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const content = scriptTag?.textContent || '{}';

		// Should not throw when parsing
		expect(() => JSON.parse(content)).not.toThrow();

		const schemaData = JSON.parse(content);
		expect(schemaData).toBeTruthy();
		expect(schemaData['@context']).toBeDefined();
		expect(schemaData['@type']).toBe('Product');
		expect(schemaData.name).toBeDefined();
	});

});
