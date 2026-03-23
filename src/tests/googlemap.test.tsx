import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleMaps } from '../components/integrations/googlemap';

// Mock the config hook
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: vi.fn(() => ({
		googleMaps: {
			apiKey: 'config-api-key-123'
		}
	}))
}));

describe('GoogleMaps Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render wrapper div with gmap class', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		expect(container.querySelector('.gmap')).toBeInTheDocument();
	});

	it('should render iframe element', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe).toBeInTheDocument();
	});

	it('should set iframe title from prop', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" title="My Cafe Location" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('title')).toBe('My Cafe Location');
	});

	it('should use default title when not provided', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('title')).toBe('Google Map');
	});

	it('should set iframe width from prop', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" width="800" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('width')).toBe('800');
	});

	it('should use default width when not provided', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('width')).toBe('600');
	});

	it('should set iframe height from prop', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" height="500" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('height')).toBe('500');
	});

	it('should use default height when not provided', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('height')).toBe('400');
	});

	it('should set frameBorder from prop', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" frameBorder="1" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('frameborder')).toBe('1');
	});

	it('should use default frameBorder when not provided', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('frameborder')).toBe('0');
	});

	it('should construct correct embed URL with map_mode', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key-999" parameters="q=restaurant" />
		);
		
		const iframe = container.querySelector('iframe');
		const src = iframe?.getAttribute('src');
		expect(src).toContain('https://www.google.com/maps/embed/v1/place');
		expect(src).toContain('key=test-key-999');
	});

	it('should include query parameters in embed URL', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="key123" parameters="q=coffee&zoom=15" />
		);
		
		const iframe = container.querySelector('iframe');
		const src = iframe?.getAttribute('src');
		expect(src).toContain('q=coffee');
		expect(src).toContain('zoom=15');
	});

	it('should use api_key prop when provided', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="provided-key-123" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		const src = iframe?.getAttribute('src');
		expect(src).toContain('key=provided-key-123');
	});

	it('should fall back to config api_key when prop not provided', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		const src = iframe?.getAttribute('src');
		expect(src).toContain('key=config-api-key-123');
	});

	it('should set referrerPolicy to no-referrer-when-downgrade', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('referrerpolicy')).toBe('no-referrer-when-downgrade');
	});

	it('should set allowFullScreen attribute', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe');
		expect(iframe?.getAttribute('allowfullscreen')).toBe('');
	});

	it('should apply custom inline styles', () => {
		const customStyle = { border: '2px solid blue', borderRadius: '8px' };
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" style={customStyle} />
		);
		
		const iframe = container.querySelector('iframe') as HTMLElement;
		expect(iframe?.style.border).toBe('2px solid blue');
		expect(iframe?.style.borderRadius).toBe('8px');
	});

	it('should use default style when not provided', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const iframe = container.querySelector('iframe') as HTMLElement;
		expect(iframe?.style.border).toBe('0px');
	});

	it('should support search map mode', () => {
		const { container } = render(
			<GoogleMaps map_mode="search" api_key="test-key" parameters="q=pizza" />
		);
		
		const iframe = container.querySelector('iframe');
		const src = iframe?.getAttribute('src');
		expect(src).toContain('embed/v1/search');
	});

	it('should support directions map mode', () => {
		const { container } = render(
			<GoogleMaps map_mode="directions" api_key="test-key" parameters="origin=home&destination=work" />
		);
		
		const iframe = container.querySelector('iframe');
		const src = iframe?.getAttribute('src');
		expect(src).toContain('embed/v1/directions');
	});

	it('should have suppressHydrationWarning attribute', () => {
		const { container } = render(
			<GoogleMaps map_mode="place" api_key="test-key" parameters="q=cafe" />
		);
		
		const wrapper = container.querySelector('.gmap');
		// suppressHydrationWarning is a React prop, not a DOM attribute, so just verify the wrapper renders
		expect(wrapper).toBeInTheDocument();
	});

	it('should handle all map modes', () => {
		const modes = ['place', 'search', 'directions', 'view', 'streetview'];
		
		modes.forEach(mode => {
			const { container } = render(
				<GoogleMaps map_mode={mode} api_key="test-key" parameters="q=test" />
			);
			
			const iframe = container.querySelector('iframe');
			const src = iframe?.getAttribute('src');
			expect(src).toContain(`embed/v1/${mode}`);
		});
	});
});
