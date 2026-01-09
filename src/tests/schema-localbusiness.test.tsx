import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import type { SiteInfo } from '@/components/config/config.types';
import { LocalBusinessSchema, type LocalBusinessSchemaType } from '@/components/general/schema-localbusiness';
import configData from '@/tests/configbuilder.test.json';

const siteInfo: SiteInfo = configData.siteInfoFull as SiteInfo;

const defaultProps: LocalBusinessSchemaType = {
	name: 'Test Business',
	streetAddress: '123 Main St',
	addressLocality: 'Springfield',
	addressRegion: 'IL',
	postalCode: '62701',
	addressCountry: 'United States',
	telephone: '+1-217-555-0123',
	url: 'https://testbusiness.com'
};

const renderSchema = (
	props: Partial<LocalBusinessSchemaType> = {},
	siteMeta: SiteInfo = siteInfo
) => {
	return render(<LocalBusinessSchema {...defaultProps} {...props} siteInfo={siteMeta} />);
};

const getSchema = (container: Element | null) => {
	const script = container?.querySelector('script[type="application/ld+json"]');
	return script ? JSON.parse(script.textContent || '{}') : null;
};

describe('LocalBusinessSchema', () => {
	it('outputs LocalBusiness JSON-LD script with schema.org context', () => {
		const { container } = renderSchema();
		const schema = getSchema(container);
		expect(schema).toBeTruthy();
		expect(schema['@context']).toBe('https://schema.org');
		expect(schema['@type']).toBe('LocalBusiness');
	});

	it('falls back to siteInfo values when props omit them', () => {
		const { container } = renderSchema({ telephone: undefined });
		const schema = getSchema(container);
		expect(schema.telephone).toBe(siteInfo.telephone);
		expect(schema.name).toBe(defaultProps.name);
	});

	it('renders address from siteInfo when props do not override it', () => {
		const { container } = renderSchema({ addressRegion: undefined });
		const schema = getSchema(container);
		expect(schema.address.addressCountry).toBe(siteInfo.address?.addressCountry);
		expect(schema.address.addressRegion).toBe(siteInfo.address?.addressRegion);
	});

	it('uses the siteInfo image as logo', () => {
		const { container } = renderSchema();
		const schema = getSchema(container);
		expect(schema.logo).toBe(siteInfo.image);
	});

	it('includes priceRange and social links supplied by siteInfo', () => {
		const { container } = renderSchema();
		const schema = getSchema(container);
		expect(schema.priceRange).toBe(siteInfo.priceRange);
		expect(schema.sameAs).toEqual(siteInfo.sameAs);
	});

	it('renders additional fields passed via props', () => {
		const { container } = renderSchema({ description: 'Great service' });
		const schema = getSchema(container);
		expect(schema.description).toBe('Great service');
	});
});
