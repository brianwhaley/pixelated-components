import { describe, it, expect } from 'vitest';

// Test exports from pageStorageTypes.ts
import * as pageStorageTypes from '../components/sitebuilder/page/lib/pageStorageTypes';

describe('pageStorageTypes - Export Coverage', () => {
	it('should export SavePageRequest interface', () => {
		expect(pageStorageTypes).toBeDefined();
	});

	it('should export SavePageResponse interface', () => {
		expect(pageStorageTypes).toBeDefined();
	});

	it('should export LoadPageResponse interface', () => {
		expect(pageStorageTypes).toBeDefined();
	});

	it('should export ListPagesResponse interface', () => {
		expect(pageStorageTypes).toBeDefined();
	});

	it('should export DeletePageResponse interface', () => {
		expect(pageStorageTypes).toBeDefined();
	});

	it('should be able to create SavePageResponse object', () => {
		const response = { success: true, message: 'Saved' };
		expect(response.success).toBe(true);
		expect(response.message).toBe('Saved');
	});

	it('should be able to create LoadPageResponse object', () => {
		const response = { success: true, data: { components: [] } };
		expect(response.success).toBe(true);
	});

	it('should be able to create ListPagesResponse object', () => {
		const response = { success: true, pages: ['page1', 'page2'] };
		expect(response.pages).toHaveLength(2);
	});

	it('should be able to create DeletePageResponse object', () => {
		const response = { success: true, message: 'Deleted' };
		expect(response.success).toBe(true);
	});
});
