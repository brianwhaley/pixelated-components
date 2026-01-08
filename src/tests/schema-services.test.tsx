import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ServicesSchema, type ServicesSchemaProps } from '@/components/general/schema-services';

describe('ServicesSchema', () => {
	const defaultProps: ServicesSchemaProps = {
		provider: {
			name: 'Test Agency',
			url: 'https://testagency.com'
		},
		services: [
			{
				name: 'Web Development',
				description: 'Custom web development services'
			},
			{
				name: 'UI Design',
				description: 'User interface design services'
			}
		]
	};

	it('should render script tags with application/ld+json type', () => {
		const { container } = render(<ServicesSchema {...defaultProps} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		expect(scriptTags.length).toBe(2); // One for each service
	});

	it('should include schema.org context and Service type for each service', () => {
		const { container } = render(<ServicesSchema {...defaultProps} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');

		scriptTags.forEach(scriptTag => {
			const schemaData = JSON.parse(scriptTag.textContent || '{}');
			expect(schemaData['@context']).toBe('https://schema.org');
			expect(schemaData['@type']).toBe('Service');
		});
	});

	it('should include service name and description', () => {
		const { container } = render(<ServicesSchema {...defaultProps} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');

		const firstService = JSON.parse(scriptTags[0].textContent || '{}');
		expect(firstService.name).toBe('Web Development');
		expect(firstService.description).toBe('Custom web development services');

		const secondService = JSON.parse(scriptTags[1].textContent || '{}');
		expect(secondService.name).toBe('UI Design');
		expect(secondService.description).toBe('User interface design services');
	});

	it('should include provider information', () => {
		const { container } = render(<ServicesSchema {...defaultProps} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const firstService = JSON.parse(scriptTags[0].textContent || '{}');

		expect(firstService.provider['@type']).toBe('LocalBusiness');
		expect(firstService.provider.name).toBe(defaultProps.provider?.name);
		expect(firstService.provider.url).toBe(defaultProps.provider?.url);
	});

	it('should include provider logo when provided', () => {
		const props: ServicesSchemaProps = {
			...defaultProps,
			provider: {
				...(defaultProps.provider as any),
				logo: 'https://testagency.com/logo.png'
			}
		};
		const { container } = render(<ServicesSchema {...props} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const firstService = JSON.parse(scriptTags[0].textContent || '{}');

		expect(firstService.provider.logo).toBe(props.provider?.logo);
	});

	it('should include provider telephone when provided', () => {
		const props: ServicesSchemaProps = {
			...defaultProps,
			provider: {
				...(defaultProps.provider as any),
				telephone: '+1-555-0123'
			}
		};
		const { container } = render(<ServicesSchema {...props} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const firstService = JSON.parse(scriptTags[0].textContent || '{}');

		expect(firstService.provider.telephone).toBe('+1-555-0123');
	});

	it('should include provider email when provided', () => {
		const props: ServicesSchemaProps = {
			...defaultProps,
			provider: {
				...(defaultProps.provider as any),
				email: 'hello@testagency.com'
			}
		};
		const { container } = render(<ServicesSchema {...props} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const firstService = JSON.parse(scriptTags[0].textContent || '{}');

		expect(firstService.provider.email).toBe('hello@testagency.com');
	});

	it('should include service URL when provided', () => {
		const props: ServicesSchemaProps = {
			...defaultProps,
			services: [
				{
					name: 'Web Development',
					description: 'Custom web development services',
					url: 'https://testagency.com/services/web-development'
				}
			]
		};
		const { container } = render(<ServicesSchema {...props} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const service = JSON.parse(scriptTags[0].textContent || '{}');

		expect(service.url).toBe('https://testagency.com/services/web-development');
	});

	it('should include service image when provided', () => {
		const props: ServicesSchemaProps = {
			...defaultProps,
			services: [
				{
					name: 'Web Development',
					description: 'Custom web development services',
					image: 'https://testagency.com/images/web-dev.jpg'
				}
			]
		};
		const { container } = render(<ServicesSchema {...props} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const service = JSON.parse(scriptTags[0].textContent || '{}');

		expect(service.image).toBe('https://testagency.com/images/web-dev.jpg');
	});

	it('should support siteInfo prop as a primary source of data', () => {
		const siteInfo = {
			name: 'SiteInfo Business',
			url: 'https://siteinfo.com',
			image: 'https://siteinfo.com/logo.png',
			telephone: '+1-234-5678',
			email: 'info@siteinfo.com',
			services: [
				{
					name: 'SiteInfo Service',
					description: 'Service from SiteInfo object',
					areaServed: ['Region A', 'Region B']
				}
			]
		};

		const { container } = render(<ServicesSchema siteInfo={siteInfo} />);
		const scriptTag = container.querySelector('script[type="application/ld+json"]');
		const schemaData = JSON.parse(scriptTag!.textContent || '{}');

		expect(schemaData.name).toBe(siteInfo.services[0].name);
		expect(schemaData.description).toBe(siteInfo.services[0].description);
		expect(schemaData.areaServed).toEqual(siteInfo.services[0].areaServed);
		
		expect(schemaData.provider.name).toBe(siteInfo.name);
		expect(schemaData.provider.url).toBe(siteInfo.url);
		expect(schemaData.provider.logo).toBe(siteInfo.image);
		expect(schemaData.provider.telephone).toBe(siteInfo.telephone);
		expect(schemaData.provider.email).toBe(siteInfo.email);
	});

	it('should handle multiple services from siteInfo', () => {
		const siteInfo = {
			name: 'Multi-Service Business',
			url: 'https://multi.com',
			services: [
				{ name: 'S1', description: 'D1' },
				{ name: 'S2', description: 'D2' }
			]
		};

		const { container } = render(<ServicesSchema siteInfo={siteInfo} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		expect(scriptTags.length).toBe(2);
		
		const s1 = JSON.parse(scriptTags[0].textContent || '{}');
		const s2 = JSON.parse(scriptTags[1].textContent || '{}');
		
		expect(s1.name).toBe('S1');
		expect(s2.name).toBe('S2');
	});

	it('should include service areaServed as string', () => {
		const props: ServicesSchemaProps = {
			...defaultProps,
			services: [
				{
					name: 'Web Development',
					description: 'Custom web development services',
					areaServed: 'United States'
				}
			]
		};
		const { container } = render(<ServicesSchema {...props} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const service = JSON.parse(scriptTags[0].textContent || '{}');

		expect(service.areaServed).toBe('United States');
	});

	it('should include service areaServed as array', () => {
		const props: ServicesSchemaProps = {
			...defaultProps,
			services: [
				{
					name: 'Web Development',
					description: 'Custom web development services',
					areaServed: ['New Jersey', 'South Carolina', 'California']
				}
			]
		};
		const { container } = render(<ServicesSchema {...props} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const service = JSON.parse(scriptTags[0].textContent || '{}');

		expect(Array.isArray(service.areaServed)).toBe(true);
		expect(service.areaServed).toEqual(['New Jersey', 'South Carolina', 'California']);
	});

	it('should handle multiple services', () => {
		const props: ServicesSchemaProps = {
			...defaultProps,
			services: [
				{ name: 'Service 1', description: 'Description 1' },
				{ name: 'Service 2', description: 'Description 2' },
				{ name: 'Service 3', description: 'Description 3' }
			]
		};
		const { container } = render(<ServicesSchema {...props} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');

		expect(scriptTags.length).toBe(3);
	});

	it('should generate valid JSON for all services', () => {
		const { container } = render(<ServicesSchema {...defaultProps} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');

		expect(() => {
			scriptTags.forEach(scriptTag => {
				JSON.parse(scriptTag.textContent || '{}');
			});
		}).not.toThrow();
	});

	it('should exclude optional fields when not provided', () => {
		const { container } = render(<ServicesSchema {...defaultProps} />);
		const scriptTags = container.querySelectorAll('script[type="application/ld+json"]');
		const firstService = JSON.parse(scriptTags[0].textContent || '{}');

		expect(firstService.url).toBeUndefined();
		expect(firstService.image).toBeUndefined();
		expect(firstService.areaServed).toBeUndefined();
	});

	it('should render without crashing with minimal required props', () => {
		expect(() => {
			render(<ServicesSchema {...defaultProps} />);
		}).not.toThrow();
	});
});
