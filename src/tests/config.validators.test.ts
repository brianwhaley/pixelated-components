import { describe, it, expect } from 'vitest';
import { assertSiteInfo, assertRoutes, assertVisualDesign } from '../components/config/config.validators';

describe('config.validators', () => {
	describe('assertSiteInfo', () => {
		it('accepts valid siteInfo', () => {
			expect(() => assertSiteInfo({ name: 'A', url: 'https://a', description: 'desc' })).not.toThrow();
		});
		it('throws when missing fields', () => {
			expect(() => assertSiteInfo({ name: 'A' } as any)).toThrow(/siteInfo missing required fields/);
		});
	});

	describe('assertRoutes', () => {
		it('accepts route blobs with names', () => {
			expect(() => assertRoutes([{ name: 'Home', path: '/' }])).not.toThrow();
		});
		it('throws on missing route structure', () => {
			expect(() => assertRoutes(undefined)).toThrow(/routes is missing/);
		});
		it('throws if no named routes found', () => {
			expect(() => assertRoutes({ foo: { bar: {} } })).toThrow(/expected at least one route entry/);
		});
	});

	describe('assertVisualDesign', () => {
		it('accepts simple visualdesign objects', () => {
			expect(() => assertVisualDesign({ 'primary-color': '#fff' })).not.toThrow();
		});
		it('throws when missing or not an object', () => {
			expect(() => assertVisualDesign(null)).toThrow(/visualdesign is missing/);
			expect(() => assertVisualDesign('string' as any)).toThrow(/visualdesign must be an object/);
		});
		it('throws when object has no tokens', () => {
			expect(() => assertVisualDesign({} as any)).toThrow(/visualdesign must contain at least one token/);
		});
		it('throws when token values are invalid', () => {
			expect(() => assertVisualDesign({ 'primary-color': 123 as any })).toThrow(/visualdesign token 'primary-color' has an invalid value/);
			expect(() => assertVisualDesign({ 'primary-color': { type: 'string' } as any })).toThrow(/visualdesign token 'primary-color' has an invalid value/);
		});
		it('accepts tokens with object value property', () => {
			expect(() => assertVisualDesign({ 'primary-color': { value: '#fff' }, 'header-font': 'Montserrat' } as any)).not.toThrow();
		});
	});
});
