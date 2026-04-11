import { describe, it, expect } from 'vitest';
import { GenerateFlickrCards } from '../components/integrations/flickr';

describe('GenerateFlickrCards', () => {
	const sampleImage = {
		farm: '1',
		server: 'server',
		id: '123',
		secret: 'abc',
		title: 'Test Photo',
		ownername: 'photographer',
		datetaken: '2026-01-01 00:00:00',
		description: { _content: 'A test image' },
	};

	it('returns undefined when no images are provided', () => {
		const result = GenerateFlickrCards({ flickrImages: [], photoSize: 'Medium' });
		expect(result).toBeUndefined();
	});

	it('builds Flickr card image URLs with no suffix for Medium size', () => {
		const result = GenerateFlickrCards({ flickrImages: [sampleImage], photoSize: 'Medium' });
		expect(result).toHaveLength(1);
		expect(result?.[0].image).toContain('123_abc.jpg');
		expect(result?.[0].image).toContain('farm1.static.flickr.com/server/');
		expect(result?.[0].subHeaderText).toContain('1 of 1 by photographer on 2026-01-01 00:00:00');
	});

	it('uses the correct size suffix for Square images', () => {
		const result = GenerateFlickrCards({ flickrImages: [sampleImage], photoSize: 'Square' });
		expect(result?.[0].image).toContain('123_abc_s.jpg');
	});

	it('uses the correct size suffix for Large images', () => {
		const result = GenerateFlickrCards({ flickrImages: [sampleImage], photoSize: 'Large' });
		expect(result?.[0].image).toContain('123_abc_b.jpg');
	});

	it('falls back to default image size when an unknown size is provided', () => {
		const result = GenerateFlickrCards({ flickrImages: [sampleImage], photoSize: 'Unknown' });
		expect(result?.[0].image).toContain('123_abc.jpg');
	});
});
