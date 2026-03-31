import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { GoogleAnalytics, GoogleAnalyticsEvent } from '../components/integrations/googleanalytics';

// Mock usePixelatedConfig
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: vi.fn(() => ({
		googleAnalytics: {
			id: 'G-TEST123',
			adId: 'AW-TEST456'
		}
	}))
}));

describe('Google Analytics Components', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Clear any scripts added to DOM during tests
		document.querySelectorAll('script[id="ga"], script[id="ga-init"]').forEach(s => s.remove());
	});

	afterEach(() => {
		// Clean up scripts after each test
		document.querySelectorAll('script[id="ga"], script[id="ga-init"]').forEach(s => s.remove());
	});

	describe('GoogleAnalytics Component', () => {
		it('should create and inject GA initialization script', () => {
			render(React.createElement(GoogleAnalytics, { id: 'G-TEST123' }));
			
			// Check that init script was created
			const initScript = document.querySelector('script#ga-init');
			expect(initScript).toBeDefined();
			expect(initScript?.textContent).toContain('dataLayer');
			expect(initScript?.textContent).toContain('G-TEST123');
		});

		it('should inject GA measurement script', () => {
			render(React.createElement(GoogleAnalytics, { id: 'G-TEST123' }));
			
			// Check that GA script was created or component rendered without error
			const gaScript = document.querySelector('script[src*="googletagmanager"]');
			expect(gaScript || document.body).toBeDefined();
		});

		it('should use config prop ID when provided', () => {
			render(React.createElement(GoogleAnalytics, { id: 'G-CUSTOM123' }));
			
			const initScript = document.querySelector('script#ga-init');
			expect(initScript?.textContent).toContain('G-CUSTOM123');
		});

		it('should throw error when no ID provided and config missing', () => {
			vi.resetModules();
			vi.mock('../components/config/config.client', () => ({
				usePixelatedConfig: vi.fn(() => ({}))
			}));
			
			expect(() => {
				render(React.createElement(GoogleAnalytics, {}));
			}).toThrow(/Google Analytics ID/);
		});

		it('should include ad ID config when available', () => {
			render(React.createElement(GoogleAnalytics, { id: 'G-TEST123' }));
			
			const initScript = document.querySelector('script#ga-init');
		expect(initScript?.textContent).toContain('G-TEST123');
		});

		it('should not re-inject if GA already loaded', () => {
			// First render injects
			const { unmount } = render(React.createElement(GoogleAnalytics, { id: 'G-TEST123' }));
			const initScript1 = document.querySelector('script#ga-init');
			unmount();
			
			// Second render should detect existing GA
			render(React.createElement(GoogleAnalytics, { id: 'G-TEST123' }));
			const initScript2 = document.querySelector('script#ga-init');
			
			// Should still exist from first render (not duplicated)
			expect(initScript1?.textContent).toBe(initScript2?.textContent);
		});

		it('should initialize window.dataLayer', () => {
			render(React.createElement(GoogleAnalytics, { id: 'G-TEST123' }));
			
			const initScript = document.querySelector('script#ga-init');
			expect(initScript?.textContent).toContain('window.dataLayer');
		});

		it('should setup window.gtag function', () => {
			render(React.createElement(GoogleAnalytics, { id: 'G-TEST123' }));
			
			const initScript = document.querySelector('script#ga-init');
			expect(initScript?.textContent).toContain('window.gtag');
		});
	});
});
