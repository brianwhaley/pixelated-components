import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { ReviewSchema, type ReviewSchemaType } from '@/components/general/schema';

const defaultReview: ReviewSchemaType['review'] = {
	'@context': 'https://schema.org/',
	'@type': 'Review',
	name: 'Excellent Product!',
	reviewBody: 'This product has completely transformed my workflow. It\'s fast, reliable, and easy to use.',
	datePublished: '2026-02-28',
	author: {
		'@type': 'Person',
		name: 'Jane Doe'
	},
	itemReviewed: {
		'@type': 'Product',
		name: 'SuperWidget Pro'
	},
	reviewRating: {
		'@type': 'Rating',
		ratingValue: '5',
		bestRating: '5',
		worstRating: '1'
	},
	publisher: {
		'@type': 'Organization',
		name: 'TechReviews Inc.'
	}
};

describe('ReviewSchema', () => {

	it('should render script tag with application/ld+json type', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		expect(scriptTag).toBeTruthy();
	});

	it('should include schema.org context and Review type', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData['@context']).toBe('https://schema.org/');
		expect(schemaData['@type']).toBe('Review');
	});

	it('should include review name', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.name).toBe('Excellent Product!');
	});

	it('should include review body', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.reviewBody).toBe(defaultReview.reviewBody);
	});

	it('should include publication date', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.datePublished).toBe('2026-02-28');
	});

	it('should include author information', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.author['@type']).toBe('Person');
		expect(schemaData.author.name).toBe('Jane Doe');
	});

	it('should include item reviewed information', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.itemReviewed['@type']).toBe('Product');
		expect(schemaData.itemReviewed.name).toBe('SuperWidget Pro');
	});

	it('should include rating information', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.reviewRating['@type']).toBe('Rating');
		expect(schemaData.reviewRating.ratingValue).toBe('5');
		expect(schemaData.reviewRating.bestRating).toBe('5');
		expect(schemaData.reviewRating.worstRating).toBe('1');
	});

	it('should include publisher information', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.publisher['@type']).toBe('Organization');
		expect(schemaData.publisher.name).toBe('TechReviews Inc.');
	});

	it('should handle review without publisher', () => {
		const reviewWithoutPublisher: ReviewSchemaType['review'] = {
			...defaultReview
		};
		delete (reviewWithoutPublisher as any).publisher;

		const { container } = render(<ReviewSchema review={reviewWithoutPublisher} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData['@type']).toBe('Review');
		expect(schemaData.publisher).toBeUndefined();
	});

	it('should handle numeric rating values', () => {
		const reviewWithNumericRating: ReviewSchemaType['review'] = {
			...defaultReview,
			reviewRating: {
				'@type': 'Rating',
				ratingValue: 4.5,
				bestRating: 5,
				worstRating: 1
			}
		};

		const { container } = render(<ReviewSchema review={reviewWithNumericRating} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.reviewRating.ratingValue).toBe(4.5);
		expect(schemaData.reviewRating.bestRating).toBe(5);
	});

	it('should handle different item types', () => {
		const reviewForService: ReviewSchemaType['review'] = {
			...defaultReview,
			itemReviewed: {
				'@type': 'Service',
				name: 'Web Development Service'
			}
		};

		const { container } = render(<ReviewSchema review={reviewForService} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.itemReviewed['@type']).toBe('Service');
		expect(schemaData.itemReviewed.name).toBe('Web Development Service');
	});

	it('should properly serialize to valid JSON-LD', () => {
		const { container } = render(<ReviewSchema review={defaultReview} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const content = scriptTag?.textContent || '{}';

		// Should not throw when parsing
		expect(() => JSON.parse(content)).not.toThrow();

		const schemaData = JSON.parse(content);
		expect(schemaData).toBeTruthy();
		expect(schemaData['@context']).toBeDefined();
		expect(schemaData['@type']).toBeDefined();
	});

});
