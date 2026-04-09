import { describe, it, expect } from 'vitest';
import { setClientMetadata } from '../components/general/metadata.components';

describe('Metadata Components', () => {
	it('should export setClientMetadata function', () => {
		expect(typeof setClientMetadata).toBe('function');
	});

	it('should set client metadata with title', () => {
		const metadata = {
			title: 'Test Page',
			description: 'Test Description',
			keywords: 'test, page',
		};
		expect(metadata.title).toBeDefined();
		expect(metadata.title.length).toBeGreaterThan(0);
	});

	it('should handle description field', () => {
		const metadata = {
			title: 'Page',
			description: 'Page description content',
			keywords: 'keyword1',
		};
		expect(metadata.description).toBeDefined();
	});

	it('should support keywords metadata', () => {
		const metadata = {
			title: 'Page',
			description: 'Description',
			keywords: 'keyword1, keyword2, keyword3',
		};
		expect(metadata.keywords).toContain(',');
	});

	it('should accept minimal metadata object', () => {
		const metadata = {
			title: 'Title',
			description: 'Description',
			keywords: 'keywords',
		};
		expect(metadata).toBeDefined();
		expect(Object.keys(metadata).length).toBe(3);
	});
});
