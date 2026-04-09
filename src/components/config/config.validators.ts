import type { SiteInfo } from './config.types';

/**
 * Assert that an object is a valid SiteInfo with required fields.
 * Throws with a clear message if validation fails.
 */
export function assertSiteInfo(v: any): asserts v is SiteInfo {
	const missing: string[] = [];
	if (!v || typeof v !== 'object') {
		throw new Error('Invalid routes.json: siteInfo is missing or not an object');
	}
	['name', 'url', 'description'].forEach(k => {
		if (!v[k] || typeof v[k] !== 'string' || String(v[k]).trim() === '') missing.push(k);
	});
	if (missing.length) {
		throw new Error(`Invalid routes.json: siteInfo missing required fields: ${missing.join(', ')}`);
	}
}

/**
 * Basic validation for a routes object/array. Ensures the structure looks like
 * a routes data blob and contains at least one named route.
 */
export function assertRoutes(routes: any): void {
	if (!routes || (typeof routes !== 'object' && !Array.isArray(routes))) {
		throw new Error('Invalid routes.json: routes is missing or not an object/array');
	}

	const found = (function findAnyNamed(obj: any): boolean {
		if (!obj || typeof obj !== 'object') return false;
		if (Array.isArray(obj)) return obj.some(item => findAnyNamed(item));
		if (obj.name && typeof obj.name === 'string') return true;
		for (const k of Object.keys(obj)) {
			if (findAnyNamed(obj[k])) return true;
		}
		return false;
	})(routes);

	if (!found) {
		throw new Error('Invalid routes.json: expected at least one route entry with a `name` property');
	}
}

/**
 * Basic validation for visualdesign tokens. Ensures it's an object and contains
 * at least the common tokens we care about (e.g., colors or fonts may be optional)
 */
export function assertVisualDesign(v: any): void {
	if (v === undefined || v === null) {
		throw new Error('Invalid routes.json: visualdesign is missing');
	}
	if (typeof v !== 'object' || Array.isArray(v)) {
		throw new Error('Invalid routes.json: visualdesign must be an object');
	}
	const keys = Object.keys(v || {});
	if (keys.length === 0) {
		throw new Error('Invalid routes.json: visualdesign must contain at least one token');
	}
	for (const k of keys) {
		const val = v[k];
		// Accept simple string tokens or objects with a string `value` property
		if (typeof val === 'string') continue;
		if (val && typeof val === 'object' && typeof val.value === 'string') continue;
		throw new Error(`Invalid routes.json: visualdesign token '${k}' has an invalid value`);
	}
}
