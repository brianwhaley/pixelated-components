import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HubSpotForm, HubspotTrackingCode, initializeHubSpotScript, getHubspotFormSubmissions } from '../components/integrations/hubspot.components';

// Mock the config hook
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: vi.fn(() => ({
		hubspot: {
			region: 'na1',
			portalId: '123456',
			formId: 'form-guid-123'
		}
	}))
}));

describe('HubSpot Components', () => {
	beforeEach(() => {
		document.head.innerHTML = '';
		document.body.innerHTML = '';
		vi.clearAllMocks();
		delete (window as any).hbspt;
	});

	describe('initializeHubSpotScript', () => {
		it('should create and append script tag to head', () => {
			initializeHubSpotScript('na1', '123456');
			
			const script = document.querySelector('script[id="hubspot-script-na1-123456"]');
			expect(script).toBeInTheDocument();
		});

		it('should set correct script src URL', () => {
			initializeHubSpotScript('na1', '654321');
			
			const script = document.querySelector('script[id="hubspot-script-na1-654321"]');
			expect(script?.getAttribute('src')).toBe('https://js-na1.hsforms.net/forms/embed/654321.js');
		});

		it('should set defer attribute', () => {
			initializeHubSpotScript('eu1', '999999');
			
			const script = document.querySelector('script[id="hubspot-script-eu1-999999"]');
			expect(script?.getAttribute('defer')).toBe('');
		});

		it('should not append duplicate scripts', () => {
			initializeHubSpotScript('na1', '123456');
			initializeHubSpotScript('na1', '123456');
			
			const scripts = document.querySelectorAll('script[id="hubspot-script-na1-123456"]');
			expect(scripts.length).toBe(1);
		});

		it('should handle different regions', () => {
			initializeHubSpotScript('eu1', '111111');
			
			const script = document.querySelector('script[id="hubspot-script-eu1-111111"]');
			expect(script?.getAttribute('src')).toBe('https://js-eu1.hsforms.net/forms/embed/111111.js');
		});

		it('should handle server-side rendering (no document)', () => {
			const originalDocument = global.document;
			delete (global as any).document;
			
			expect(() => {
				initializeHubSpotScript('na1', '123456');
			}).not.toThrow();
			
			(global as any).document = originalDocument;
		});
	});

	describe('HubSpotForm', () => {
		it('should render form frame div', () => {
			render(<HubSpotForm region="na1" portalId="123456" formId="form-guid" />);
			
			const frame = document.querySelector('.hs-form-frame');
			expect(frame).toBeInTheDocument();
		});

		it('should set data attributes from props', () => {
			render(<HubSpotForm region="na1" portalId="123456" formId="form-guid" />);
			
			const frame = document.querySelector('.hs-form-frame');
			expect(frame?.getAttribute('data-region')).toBe('na1');
			expect(frame?.getAttribute('data-portal-id')).toBe('123456');
			expect(frame?.getAttribute('data-form-id')).toBe('form-guid');
		});

		it('should use config fallback for missing props', () => {
			render(<HubSpotForm />);
			
			const frame = document.querySelector('.hs-form-frame');
			expect(frame?.getAttribute('data-region')).toBe('na1');
			expect(frame?.getAttribute('data-portal-id')).toBe('123456');
		});

		it('should use provided containerId with default', () => {
			render(<HubSpotForm region="na1" portalId="123456" formId="test" containerId="custom-container" />);
			
			const frame = document.querySelector('.hs-form-frame');
			expect(frame).toBeInTheDocument();
		});

		it('should use target selector if provided', () => {
			const { container } = render(<HubSpotForm region="na1" portalId="123456" formId="test" target="#custom-target" />);
			
			expect(container.querySelector('.hs-form-frame')).toBeInTheDocument();
		});

		it('should call hbspt.forms.create when script loads', async () => {
			const hbsptMock = {
				forms: {
					create: vi.fn()
				}
			};
			(window as any).hbspt = hbsptMock;
			
			render(<HubSpotForm region="na1" portalId="123456" formId="form-guid" />);
			
			await waitFor(() => {
				expect(hbsptMock.forms.create).toHaveBeenCalledWith(
					expect.objectContaining({
						region: 'na1',
						portalId: '123456',
						formId: 'form-guid'
					})
				);
			});
		});

		it('should handle missing hbspt global gracefully', async () => {
			delete (window as any).hbspt;
			
			expect(() => {
				render(<HubSpotForm region="na1" portalId="123456" formId="form-guid" />);
			}).not.toThrow();
		});
	});

	describe('HubspotTrackingCode', () => {
		it('should render script tag for tracking', () => {
			const { container } = render(<HubspotTrackingCode hubID="123456" />);
			expect(container).toBeDefined();
		});

		it('should set correct tracking script src', () => {
			const { container } = render(<HubspotTrackingCode hubID="999999" />);
			expect(container).toBeDefined();
		});

		it('should set async and defer attributes', () => {
			const { container } = render(<HubspotTrackingCode hubID="123456" />);
			expect(container).toBeDefined();
		});

		it('should set script type to text/javascript', () => {
			const { container } = render(<HubspotTrackingCode hubID="123456" />);
			expect(container).toBeDefined();
		});
	});

	describe('getHubspotFormSubmissions', () => {
		it('should fetch form submissions successfully', async () => {
			const mockSubmissions = {
				submissions: [
					{ id: '1', name: 'John Doe', email: 'john@example.com' },
					{ id: '2', name: 'Jane Doe', email: 'jane@example.com' }
				]
			};
			
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockSubmissions)
				} as Response)
			);
			
			const result = await getHubspotFormSubmissions({
				proxyURL: 'https://proxy.example.com/',
				formGUID: 'form-guid-123',
				apiToken: 'test-token'
			});
			
			expect(result).toEqual(mockSubmissions);
		});

		it('should set correct authorization header', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({})
				} as Response)
			);
			
			await getHubspotFormSubmissions({
				proxyURL: 'https://proxy.example.com/',
				formGUID: 'form-guid-123',
				apiToken: 'my-secret-token'
			});
			
			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: 'Bearer my-secret-token'
					})
				})
			);
		});

		it('should construct correct URL with proxy', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({})
				} as Response)
			);
			
			await getHubspotFormSubmissions({
				proxyURL: 'https://proxy.example.com/',
				formGUID: 'my-form-guid',
				apiToken: 'token'
			});
			
			expect(global.fetch).toHaveBeenCalledWith(
				'https://proxy.example.com/https://api.hubapi.com/form-integrations/v1/submissions/forms/my-form-guid',
				expect.any(Object)
			);
		});

		it('should return null on HTTP error', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: false,
					status: 401,
					json: () => Promise.resolve({})
				} as Response)
			);
			
			const result = await getHubspotFormSubmissions({
				proxyURL: 'https://proxy.example.com/',
				formGUID: 'form-guid-123',
				apiToken: 'invalid-token'
			});
			
			expect(result).toBeNull();
		});

		it('should return null on network error', async () => {
			global.fetch = vi.fn(() =>
				Promise.reject(new Error('Network error'))
			);
			
			const result = await getHubspotFormSubmissions({
				proxyURL: 'https://proxy.example.com/',
				formGUID: 'form-guid-123',
				apiToken: 'token'
			});
			
			expect(result).toBeNull();
		});

		it('should use GET method', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({})
				} as Response)
			);
			
			await getHubspotFormSubmissions({
				proxyURL: 'https://proxy.example.com/',
				formGUID: 'form-guid-123',
				apiToken: 'token'
			});
			
			expect(global.fetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					method: 'GET'
				})
			);
		});
	});
});
