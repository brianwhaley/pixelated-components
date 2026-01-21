import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation(query => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	disconnect() {}
	observe() {}
	takeRecords() {
		return [];
	}
	unobserve() {}
} as any;

// Provide a deterministic, pattern-based `fetch` mock for tests so external APIs
// (Google Fonts, Contentful, eBay, WordPress, Maps, etc.) return sane, overrideable
// defaults. Individual tests may still spyOn/override `global.fetch` to simulate
// error conditions — this default reduces noisy external failures in CI.
const realFetch = globalThis.fetch;
const defaultFetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
	const url = String(input);

	// Google Fonts API
	if (url.includes('www.googleapis.com/webfonts')) {
		return {
			ok: true,
			status: 200,
			json: async () => ({ items: [{ family: 'Montserrat', category: 'sans-serif' }, { family: 'Open Sans', category: 'sans-serif' }] }),
			text: async () => JSON.stringify({ items: [] }),
		};
	}

	// Google Maps / Places (simple success shape)
	if (url.includes('maps.googleapis.com')) {
		return {
			ok: true,
			status: 200,
			json: async () => ({ result: {}, status: 'OK' }),
			text: async () => '{}',
		};
	}

	// Contentful CDN / API
	if (url.includes('contentful.com')) {
		return {
			ok: true,
			status: 200,
			json: async () => ({ items: [], includes: {} }),
			text: async () => JSON.stringify({ items: [] }),
		};
	}

	// WordPress JSON endpoints
	if (/wp-json|wordpress/.test(url)) {
		return {
			ok: true,
			status: 200,
			json: async () => ([]),
			text: async () => '[]',
		};
	}

	// eBay token / browse APIs (return simple successful token or empty results)
	if (url.includes('ebay.com') || url.includes('api.ebay')) {
		if (url.includes('/identity/v1/oauth2/token')) {
			return { ok: true, status: 200, json: async () => ({ access_token: 'test-ebay-token', expires_in: 7200 }), text: async () => '{}' };
		}
		return { ok: true, status: 200, json: async () => ({ itemSummaries: [] }), text: async () => '{}' };
	}

	// Fallback: if test code expects network failures they should stub/spy; otherwise
	// return a neutral 200 + empty body so components that call fetch can proceed.
	try {
		// prefer to delegate to the real fetch if present for non-mocked hosts
		if (realFetch && !/localhost|127\.0\.0\.1/.test(url)) {
			return realFetch(input, init);
		}
	} catch (err) {
		// swallow and fallthrough to neutral response
	}

	return { ok: true, status: 200, json: async () => ({}), text: async () => '{}' };
});

// Install the default fetch mock but keep it spy-able so tests can override per-test
globalThis.fetch = defaultFetchMock as unknown as typeof fetch;

// Expose helper so tests can restore the original fetch if necessary
(globalThis as any).__restoreFetch = () => {
	globalThis.fetch = realFetch as any;
};



// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
	console.error = (...args: any[]) => {
		if (
			typeof args[0] === 'string' &&
			(args[0].includes('Warning: ReactDOM.render') ||
				args[0].includes('Not implemented: HTMLFormElement.prototype.submit'))
		) {
			return;
		}
		originalError.call(console, ...args);
	};
});

afterAll(() => {
	console.error = originalError;
});
