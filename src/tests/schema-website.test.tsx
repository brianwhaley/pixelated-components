import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { SiteInfo } from '@/components/config/config.types';
import { WebsiteSchema, type WebsiteSchemaType } from '@/components/general/schema-website';
import configData from '@/tests/configbuilder.test.json';

describe('WebsiteSchema', () => {
	const siteInfo: SiteInfo = configData.siteInfoFull as SiteInfo;
	const defaultProps: WebsiteSchemaType = {
		name: 'Test Website',
		url: 'https://example.com'
	};

	const renderSchema = (props: Partial<WebsiteSchemaType> = {}, siteMeta?: SiteInfo) => {
		return render(<WebsiteSchema {...defaultProps} {...props} siteInfo={siteMeta ?? siteInfo} />);
	};

	it('should render script tag with application/ld+json type', () => {
		const { container } = renderSchema();
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		expect(scriptTag).toBeTruthy();
	});

	it('should include schema.org context and WebSite type', () => {
		const { container } = renderSchema();
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData['@context']).toBe('https://schema.org');
		expect(schemaData['@type']).toBe('WebSite');
	});

	it('should include name and url', () => {
		const { container } = renderSchema();
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.name).toBe(defaultProps.name);
		expect(schemaData.url).toBe(defaultProps.url);
	});

	it('should include description when provided', () => {
		const props = {
			...defaultProps,
			description: 'A great website'
		};
		const { container } = renderSchema(props);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.description).toBe(props.description);
	});

	it('should exclude description when not provided', () => {
		const siteMeta = { ...siteInfo, description: '' };
		const { container } = renderSchema({}, siteMeta);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.description).toBeUndefined();
	});

	it('should include potentialAction for search when provided', () => {
		const props: WebsiteSchemaType = {
			...defaultProps,
			potentialAction: {
				'@type': 'SearchAction',
				target: {
					'@type': 'EntryPoint',
					urlTemplate: 'https://example.com/search?q={search_term}'
				},
				'query-input': 'required name=search_term'
			}
		};
		const { container } = renderSchema(props);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.potentialAction).toBeDefined();
		expect(schemaData.potentialAction['@type']).toBe('SearchAction');
		expect(schemaData.potentialAction.target.urlTemplate).toBe(
			'https://example.com/search?q={search_term}'
		);
	});

	it('should use siteInfo props when publisher and potentialAction aren\'t provided', () => {
		const { container } = renderSchema({}, siteInfo);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.publisher).toBeDefined();
		expect(schemaData.publisher['@type']).toBe('LocalBusiness');
		expect(schemaData.publisher.name).toBe('Pixelated Technologies');
		expect(schemaData.publisher.logo.url).toBe(siteInfo.image);
		expect(schemaData.copyrightHolder).toBeDefined();
		expect(schemaData.copyrightHolder['@type']).toBe('LocalBusiness');
		expect(schemaData.potentialAction).toBeDefined();
		expect(schemaData.potentialAction.target.urlTemplate).toBe(
			'https://pixelated.tech/search?q={search_term_string}'
		);
	});

	it('should exclude potentialAction when not provided', () => {
		const siteMeta = { ...siteInfo, potentialAction: undefined };
		const { container } = renderSchema({}, siteMeta);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.potentialAction).toBeUndefined();
	});

	it('should generate valid JSON', () => {
		const { container } = renderSchema();
		const scriptTag = container.querySelector('script[type="application/ld+json"]');

		expect(() => {
			JSON.parse(scriptTag?.textContent || '{}');
		}).not.toThrow();
	});

	it('should handle special characters in name', () => {
		const props = {
			...defaultProps,
			name: "O'Brien's Technology & Design"
		};
		const { container } = renderSchema(props);
		const schemaData = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent || '{}');

		expect(schemaData.name).toBe(props.name);
	});

	it('should handle HTTPS URLs', () => {
		const props = {
			...defaultProps,
			url: 'https://secure.example.com'
		};
		const { container } = renderSchema(props);
		const schemaData = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent || '{}');

		expect(schemaData.url).toBe('https://secure.example.com');
	});

	it('should render without crashing with minimal required props', () => {
		expect(() => {
			renderSchema();
		}).not.toThrow();
	});

	it('should not include undefined optional fields in JSON output', () => {
		const { container } = renderSchema();
		const schemaData = JSON.parse(container.querySelector('script[type="application/ld+json"]')?.textContent || '{}');

		expect(Object.values(schemaData).some(val => val === undefined)).toBe(false);
	});
});
