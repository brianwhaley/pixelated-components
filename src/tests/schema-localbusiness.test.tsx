import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { LocalBusinessSchema, type LocalBusinessSchemaType } from '@/components/general/schema-localbusiness';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';

describe('LocalBusinessSchema', () => {
	const defaultProps: LocalBusinessSchemaType = {
		name: 'Test Business',
		streetAddress: '123 Main St',
		addressLocality: 'Springfield',
		addressRegion: 'IL',
		postalCode: '62701',
		addressCountry: 'United States',
		telephone: '+1-217-555-0123',
		url: 'https://testbusiness.com',
		logo: 'https://testbusiness.com/logo.png',
		image: 'https://testbusiness.com/image.png'
	};

	const mockConfig = {
		siteInfo: {
			name: 'Pixelated Technologies',
			description: 'Custom web development and digital design agency',
			url: 'https://pixelated.tech',
			email: 'info@pixelated.tech',
			image: '/images/pix/pix-bg-512.gif',
			telephone: '+1-973-710-8008',
			address: {
				streetAddress: '10 Jade Circle',
				addressLocality: 'Denville',
				addressRegion: 'NJ',
				postalCode: '07834',
				addressCountry: 'United States'
			},
			priceRange: '$$',
			sameAs: ['https://linkedin.com/in/brianwhaley']
		}
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

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
		const { container } = renderWithProvider(<LocalBusinessSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		expect(scriptTag).toBeTruthy();
	});

	it('should include required schema.org context', () => {
		const { container } = renderWithProvider(<LocalBusinessSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData['@context']).toBe('https://schema.org');
		expect(schemaData['@type']).toBe('LocalBusiness');
	});

	it('should include all required business information', () => {
		const { container } = renderWithProvider(<LocalBusinessSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.name).toBe(defaultProps.name);
		expect(schemaData.telephone).toBe(defaultProps.telephone);
		expect(schemaData.url).toBe(defaultProps.url);
	});

	it('should include properly formatted address', () => {
		const { container } = renderWithProvider(<LocalBusinessSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		const address = schemaData.address;
		expect(address['@type']).toBe('PostalAddress');
		expect(address.streetAddress).toBe(defaultProps.streetAddress);
		expect(address.addressLocality).toBe(defaultProps.addressLocality);
		expect(address.addressRegion).toBe(defaultProps.addressRegion);
		expect(address.postalCode).toBe(defaultProps.postalCode);
		expect(address.addressCountry).toBe(defaultProps.addressCountry);
	});

	it('should include logo and image when provided', () => {
		const { container } = renderWithProvider(<LocalBusinessSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.logo).toBe(defaultProps.logo);
		expect(schemaData.image).toBe(defaultProps.image);
	});

	it('should exclude logo when not provided', () => {
		const { logo, ...propsWithoutLogo } = defaultProps;
		const { container } = renderWithEmptyConfig(<LocalBusinessSchema {...propsWithoutLogo} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.logo).toBeUndefined();
	});

	it('should exclude image when not provided', () => {
		const { image, ...propsWithoutImage } = defaultProps;
		const { container } = renderWithEmptyConfig(<LocalBusinessSchema {...propsWithoutImage} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.image).toBeUndefined();
	});

	it('should include opening hours when provided', () => {
		const props = {
			...defaultProps,
			openingHours: 'Mo-Fr 09:00-17:00'
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.openingHours).toBe(props.openingHours);
	});

	it('should include multiple opening hours as array', () => {
		const openingHours = ['Mo-Fr 09:00-17:00', 'Sa 10:00-14:00'];
		const props = {
			...defaultProps,
			openingHours
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.openingHours).toEqual(openingHours);
	});

	it('should include description when provided', () => {
		const props = {
			...defaultProps,
			description: 'A great local business'
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.description).toBe(props.description);
	});

	it('should exclude description when not provided', () => {
		const { container } = renderWithEmptyConfig(<LocalBusinessSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.description).toBeUndefined();
	});

	it('should include email when provided', () => {
		const props = {
			...defaultProps,
			email: 'info@testbusiness.com'
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.email).toBe(props.email);
	});

	it('should include priceRange when provided', () => {
		const props = {
			...defaultProps,
			priceRange: '$$'
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.priceRange).toBe(props.priceRange);
	});

	it('should include social media profiles in sameAs', () => {
		const sameAs = [
			'https://facebook.com/testbusiness',
			'https://twitter.com/testbusiness',
			'https://instagram.com/testbusiness'
		];
		const props = {
			...defaultProps,
			sameAs
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.sameAs).toEqual(sameAs);
	});

	it('should exclude sameAs when empty array provided', () => {
		const props = {
			...defaultProps,
			sameAs: []
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.sameAs).toBeUndefined();
	});

	it('should default addressCountry to United States when not provided', () => {
		const { addressCountry, ...propsWithoutCountry } = defaultProps;
		const { container } = renderWithProvider(<LocalBusinessSchema {...propsWithoutCountry} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.address.addressCountry).toBe('United States');
	});

	it('should use custom addressCountry when provided', () => {
		const props = {
			...defaultProps,
			addressCountry: 'Canada'
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.address.addressCountry).toBe('Canada');
	});

	it('should generate valid JSON', () => {
		const { container } = renderWithProvider(<LocalBusinessSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		
		expect(() => {
			JSON.parse(scriptTag?.textContent || '{}');
		}).not.toThrow();
	});

	it('should handle special characters in business name', () => {
		const props = {
			...defaultProps,
			name: "O'Brien's Coffee & Bakery"
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.name).toBe(props.name);
	});

	it('should handle international phone numbers', () => {
		const props = {
			...defaultProps,
			telephone: '+44-20-7946-0958'
		};
		const { container } = renderWithProvider(<LocalBusinessSchema {...props} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		expect(schemaData.telephone).toBe(props.telephone);
	});

	it('should render without crashing with minimal required props', () => {
		const minimalProps: LocalBusinessSchemaType = {
			name: 'Business',
			streetAddress: '123 St',
			addressLocality: 'City',
			addressRegion: 'State',
			postalCode: '12345',
			telephone: '+1-555-0123',
			url: 'https://example.com'
		};
		
		expect(() => {
			renderWithProvider(<LocalBusinessSchema {...minimalProps} />);
		}).not.toThrow();
	});

	it('should not include undefined optional fields in JSON output', () => {
		const { container } = renderWithProvider(<LocalBusinessSchema {...defaultProps} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag?.textContent || '{}');
		
		// Check that undefined fields are not in the output
		expect(Object.values(schemaData).some(val => val === undefined)).toBe(false);
	});
});
