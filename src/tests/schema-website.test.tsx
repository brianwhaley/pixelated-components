import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { WebsiteSchema, type WebsiteSchemaType } from '@/components/general/schema-website';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';

describe('WebsiteSchema', () => {
	const defaultProps: WebsiteSchemaType = {
		name: 'Test Website',
		url: 'https://example.com'
	};

	const mockConfig = {
		siteInfo: {
			name: 'Pixelated Technologies',
			description: 'Custom web development and digital design agency',
			url: 'https://pixelated.tech'
		}
	};

	const renderWithProvider = (component: React.ReactElement) => {
		return render(
			<PixelatedClientConfigProvider config={mockConfig}>
				{component}
			</PixelatedClientConfigProvider>
		);
	};

	const renderWithEmptyConfig = (component: React.ReactElement) => {
		return render(
			<PixelatedClientConfigProvider config={{}}>
				{component}
			</PixelatedClientConfigProvider>
		);
	};

	it('should render script tag with application/ld+json type', () => {
		const { container } = renderWithProvider(<WebsiteSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		expect(scriptTag).toBeTruthy();
	});

	it('should include schema.org context and WebSite type', () => {
		const { container } = renderWithProvider(<WebsiteSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData['@context']).toBe('https://schema.org');
		expect(schemaData['@type']).toBe('WebSite');
	});

	it('should include name and url', () => {
		const { container } = renderWithProvider(<WebsiteSchema {...defaultProps} />);
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
		const { container } = renderWithProvider(<WebsiteSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.description).toBe(props.description);
	});

	it('should exclude description when not provided', () => {
		const { container } = renderWithEmptyConfig(<WebsiteSchema {...defaultProps} />);
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
				query: 'required name=search_term'
			}
		};
		const { container } = renderWithProvider(<WebsiteSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.potentialAction).toBeDefined();
		expect(schemaData.potentialAction['@type']).toBe('SearchAction');
		expect(schemaData.potentialAction.target.urlTemplate).toBe(
			'https://example.com/search?q={search_term}'
		);
	});

	it('should exclude potentialAction when not provided', () => {
		const { container } = renderWithProvider(<WebsiteSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.potentialAction).toBeUndefined();
	});

	it('should generate valid JSON', () => {
		const { container } = renderWithProvider(<WebsiteSchema {...defaultProps} />);
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
		const { container } = renderWithProvider(<WebsiteSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.name).toBe(props.name);
	});

	it('should handle HTTPS URLs', () => {
		const props = {
			...defaultProps,
			url: 'https://secure.example.com'
		};
		const { container } = renderWithProvider(<WebsiteSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(schemaData.url).toBe('https://secure.example.com');
	});

	it('should render without crashing with minimal required props', () => {
		expect(() => {
			renderWithProvider(<WebsiteSchema {...defaultProps} />);
		}).not.toThrow();
	});

	it('should not include undefined optional fields in JSON output', () => {
		const { container } = renderWithProvider(<WebsiteSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');

		expect(Object.values(schemaData).some(val => val === undefined)).toBe(false);
	});
});
