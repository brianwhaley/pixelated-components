import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BreadcrumbListSchema } from '../components/foundation/schema';

describe('BreadcrumbListSchema', () => {
	const mockRoutes = [
		{ name: 'Home', path: '/' },
		{ name: 'Store', path: '/store' },
		{ name: 'Gallery', path: '/gallery' },
		{ name: 'About', path: '/about' },
		{ name: 'Projects', path: '/projects' },
	];

	it('renders a script tag with application/ld+json type', () => {
		const { container } = render(
			<BreadcrumbListSchema routes={mockRoutes} currentPath="/" />
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		expect(script).toBeDefined();
	});

	it('generates BreadcrumbList for root path', () => {
		const { container } = render(
			<BreadcrumbListSchema routes={mockRoutes} currentPath="/" />
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		expect(data['@context']).toBe('https://schema.org');
		expect(data['@type']).toBe('BreadcrumbList');
		expect(data.itemListElement).toHaveLength(1);
		expect(data.itemListElement[0].name).toBe('Home');
		expect(data.itemListElement[0].item).toBe('https://example.com/');
	});

	it('generates breadcrumbs for single-level path', () => {
		const { container } = render(
			<BreadcrumbListSchema routes={mockRoutes} currentPath="/store" />
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		expect(data.itemListElement).toHaveLength(2);
		expect(data.itemListElement[0]).toEqual({
			'@type': 'ListItem',
			position: 1,
			name: 'Home',
			item: 'https://example.com/',
		});
		expect(data.itemListElement[1]).toEqual({
			'@type': 'ListItem',
			position: 2,
			name: 'Store',
			item: 'https://example.com/store',
		});
	});

	it('generates breadcrumbs for multi-level dynamic path', () => {
		const { container } = render(
			<BreadcrumbListSchema routes={mockRoutes} currentPath="/store/vintage-oakley" />
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		expect(data.itemListElement).toHaveLength(3);
		expect(data.itemListElement[0].name).toBe('Home');
		expect(data.itemListElement[1].name).toBe('Store');
		// Third level humanizes the segment since "/store/vintage-oakley" doesn't exist in routes
		expect(data.itemListElement[2].name).toBe('Vintage Oakley');
		expect(data.itemListElement[2].item).toBe('https://example.com/store/vintage-oakley');
	});

	it('uses custom siteUrl from props', () => {
		const { container } = render(
			<BreadcrumbListSchema
				routes={mockRoutes}
				currentPath="/store"
				siteUrl="https://www.pixelvivid.com"
			/>
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		expect(data.itemListElement[0].item).toBe('https://www.pixelvivid.com/');
		expect(data.itemListElement[1].item).toBe('https://www.pixelvivid.com/store');
	});

	it('handles siteUrl with trailing slash correctly', () => {
		const { container } = render(
			<BreadcrumbListSchema
				routes={mockRoutes}
				currentPath="/projects"
				siteUrl="https://www.palmetto-epoxy.com/"
			/>
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		expect(data.itemListElement[0].item).toBe('https://www.palmetto-epoxy.com/');
		expect(data.itemListElement[1].item).toBe('https://www.palmetto-epoxy.com/projects');
	});

	it('defaults to "/" path if currentPath not provided', () => {
		const { container } = render(<BreadcrumbListSchema routes={mockRoutes} />);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		expect(data.itemListElement).toHaveLength(1);
		expect(data.itemListElement[0].name).toBe('Home');
	});

	it('defaults to https://example.com if siteUrl not provided', () => {
		const { container } = render(
			<BreadcrumbListSchema routes={mockRoutes} currentPath="/about" />
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		expect(data.itemListElement[0].item).toBe('https://example.com/');
		expect(data.itemListElement[1].item).toBe('https://example.com/about');
	});

	it('humanizes path segments without matching routes', () => {
		const routes = [
			{ name: 'Home', path: '/' },
			{ name: 'Products', path: '/products' },
		];
		const { container } = render(
			<BreadcrumbListSchema routes={routes} currentPath="/products/awesome-product-name" />
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		expect(data.itemListElement[2].name).toBe('Awesome Product Name');
	});

	it('matches parent routes for deeply nested dynamic paths', () => {
		const routes = [
			{ name: 'Home', path: '/' },
			{ name: 'Projects', path: '/projects' },
		];
		const { container } = render(
			<BreadcrumbListSchema
				routes={routes}
				currentPath="/projects/2024/residential-kitchen"
			/>
		);
		const script = container.querySelector('script[type="application/ld+json"]');
		const data = JSON.parse(script?.textContent || '{}');

		// Should match "/projects" parent
		expect(data.itemListElement[1].name).toBe('Projects');
		expect(data.itemListElement[1].item).toContain('/projects');
	});
});
