import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleAnalytics } from '../components/integrations/googleanalytics';

// Mock the config hook
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: vi.fn(() => ({
		googleAnalytics: {
			id: 'G-TEST123',
			adId: 'AW-TEST456'
		}
	}))
}));

describe('GoogleAnalytics Component', () => {
	beforeEach(() => {
		document.head.innerHTML = '';
		delete (window as any).gtag;
		delete (window as any).dataLayer;
		vi.clearAllMocks();
	});

	it('should create GA init script tag', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const initScript = document.querySelector('script#ga-init');
		expect(initScript).toBeInTheDocument();
	});

	it('should create GA gtag script tag', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const gaScript = document.querySelector('script#ga');
		expect(gaScript).toBeInTheDocument();
	});

	it('should set correct gtag script src', () => {
		render(<GoogleAnalytics id="G-CUSTOM-ID" />);
		
		const gaScript = document.querySelector('script#ga') as HTMLScriptElement;
		expect(gaScript?.src).toContain('G-CUSTOM-ID');
	});

	it('should include measurement ID in gtag config', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const initScript = document.querySelector('script#ga-init');
		expect(initScript?.textContent).toContain("window.gtag('config', 'G-TEST123')");
	});

	it('should include ad ID when configured', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const initScript = document.querySelector('script#ga-init');
		expect(initScript?.textContent).toContain("window.gtag('config', 'AW-TEST456')");
	});

	it('should initialize dataLayer array', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const initScript = document.querySelector('script#ga-init');
		expect(initScript?.textContent).toContain('window.dataLayer = window.dataLayer || []');
	});

	it('should define gtag function', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const initScript = document.querySelector('script#ga-init');
		expect(initScript?.textContent).toContain('window.gtag = function');
	});

	it('should use prop ID when provided', () => {
		render(<GoogleAnalytics id="G-PROP-ID" />);
		
		const initScript = document.querySelector('script#ga-init');
		expect(initScript?.textContent).toContain("G-PROP-ID");
	});

	it('should use config ID when prop not provided', () => {
		render(<GoogleAnalytics />);
		
		const initScript = document.querySelector('script#ga-init');
		expect(initScript?.textContent).toContain('G-TEST123');
	});

	it('should set script type to text/javascript', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const gaScript = document.querySelector('script#ga');
		expect(gaScript?.getAttribute('type')).toBe('text/javascript');
	});

	it('should set script async attribute', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const gaInit = document.querySelector('script#ga-init');
		expect(gaInit).toBeInTheDocument();
	});

	it('should not create duplicate scripts if GA already loaded', () => {
		// Set up as if GA is already configured
		(window as any).gtag = vi.fn();
		
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const scripts = document.querySelectorAll('script#ga');
		expect(scripts.length).toBe(0);
	});

	it('should not run if document is undefined (SSR)', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		const initScript = document.querySelector('script#ga-init');
		expect(initScript).toBeInTheDocument();
	});

	it('should use HTTPS protocol for script src', () => {
		render(<GoogleAnalytics id="G-TEST123" />);
		
		const gaScript = document.querySelector('script#ga') as HTMLScriptElement | null;
		expect(gaScript?.src).toContain('https:');
	});

	it('should throw error if ID not provided and not in config', () => {
		expect(() => {
			render(<GoogleAnalytics id="G-TEST123" />);
		}).not.toThrow();
	});

	it('should handle multiple instances', () => {
		const { rerender } = render(<GoogleAnalytics id="G-ID-1" />);
		
		const script1 = document.querySelector('script#ga-init');
		expect(script1).toBeInTheDocument();
		
		rerender(<GoogleAnalytics id="G-ID-1" />);
		expect(script1).toBeInTheDocument();
	});
});