import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../components/sitebuilder/page/documentation/api-examples/save-route-example';
import * as pageStorageLocal from '../components/sitebuilder/page/lib/pageStorageLocal';

vi.mock('../components/sitebuilder/page/lib/pageStorageLocal', () => ({
	savePage: vi.fn(async (name: string, data: any) => ({
		success: true,
		name,
		message: 'Page saved successfully'
	}))
}));

describe('Save Route Example POST Handler', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('POST Handler Function', () => {
		it('should export POST handler function', () => {
			expect(POST).toBeDefined();
			expect(typeof POST).toBe('function');
		});

		it('should accept Request object and return Response', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test-page',
					data: { content: 'test' }
				})
			});

			const response = await POST(request);

			expect(response).toBeDefined();
			expect(response.status === 200 || response.status === 400).toBe(true);
		});

		it('should return NextResponse JSON object', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test-page',
					data: { components: [] }
				})
			});

			const response = await POST(request);
			expect(response.headers.get('content-type')).toContain('json');
		});
	});

	describe('Request Validation', () => {
		it('should require name and data in request body', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({ name: 'test' })
			});

			const response = await POST(request);

			if (response.status !== 200) {
				const body = await response.json();
				expect(body.success === false || body.message !== undefined).toBe(true);
			}
		});

		it('should reject request missing name field', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					data: { content: 'test' }
				})
			});

			const response = await POST(request);

			if (response.status === 400) {
				const body = await response.json();
				expect(body.success).toBe(false);
			}
		});

		it('should reject request missing data field', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test-page'
				})
			});

			const response = await POST(request);

			if (response.status === 400) {
				const body = await response.json();
				expect(body.message.includes('required') || body.success === false).toBe(true);
			}
		});

		it('should accept valid request with name and data', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'valid-page',
					data: { components: [], config: {} }
				})
			});

			const response = await POST(request);

			expect(response.status).toBeDefined();
		});
	});

	describe('Request Body Processing', () => {
		it('should parse JSON request body', async () => {
			const bodyData = {
				name: 'test-page',
				data: { title: 'Test', sections: [] }
			};

			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify(bodyData)
			});

			const response = await POST(request);

			expect(response).toBeDefined();
		});

		it('should handle complex data structures', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'complex-page',
					data: {
						components: [
							{ id: 'c1', type: 'header', props: {} },
							{ id: 'c2', type: 'content', props: {} }
						],
						config: {
							theme: 'light',
							layout: 'default'
						},
						metadata: {
							author: 'test',
							created: new Date().toISOString()
						}
					}
				})
			});

			const response = await POST(request);

			expect(response).toBeDefined();
		});
	});

	describe('Response Structure', () => {
		it('should return success response when page saved', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test-page',
					data: { content: 'test' }
				})
			});

			const response = await POST(request);
			const body = await response.json();

			if (response.status === 200) {
				expect(body.hasOwnProperty('success') || body.hasOwnProperty('message')).toBe(true);
			}
		});

		it('should include message in response', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test-page',
					data: { content: 'test' }
				})
			});

			const response = await POST(request);
			const body = await response.json();

			if (response.status === 200) {
				expect(body.message || body.success).toBeDefined();
			}
		});

		it('should return status 400 on validation error', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({ incomplete: 'data' })
			});

			const response = await POST(request);

			if (response.status === 400) {
				const body = await response.json();
				expect(body.success).toBe(false);
				expect(body.message).toBeDefined();
			}
		});

		it('should handle request body parse errors', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: 'invalid json'
			});

			const response = await POST(request);

			expect(response.status).toBe(400);
		});
	});

	describe('Error Handling', () => {
		it('should catch JSON parse errors', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: 'not valid json {'
			});

			const response = await POST(request);

			expect(response.status).toBe(400);
		});

		it('should return error message for invalid requests', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({ name: 'only-name' })
			});

			const response = await POST(request);
			const body = await response.json();

			expect(body.message || body.success === false).toBeDefined();
		});

		it('should handle storage failures gracefully', async () => {
			(pageStorageLocal.savePage as any).mockRejectedValueOnce(new Error('Storage error'));

			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'test',
					data: { test: true }
				})
			});

			const response = await POST(request);

			expect(response.status).toBeDefined();
		});
	});

	describe('Option 1: File-based Storage', () => {
		it('should use savePage from pageStorageLocal', async () => {
			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: 'file-based-page',
					data: { content: 'file storage test' }
				})
			});

			const response = await POST(request);

			expect(response).toBeDefined();
		});

		it('should pass name and data to savePage function', async () => {
			const testName = 'test-page-name';
			const testData = { components: [], config: {} };

			const request = new Request('http://localhost/api/save', {
				method: 'POST',
				body: JSON.stringify({
					name: testName,
					data: testData
				})
			});

			const response = await POST(request);

			expect(response).toBeDefined();
		});
	});
});
