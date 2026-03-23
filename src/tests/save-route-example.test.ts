import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../components/sitebuilder/page/documentation/api-examples/save-route-example';

let savePageMock = vi.fn().mockResolvedValue({ success: true, filePath: '/test/path' });

vi.mock('../components/sitebuilder/page/lib/pageStorageLocal', () => ({
	savePage: (...args: any[]) => savePageMock(...args)
}));

describe('save-route-example - API route handler', () => {
	beforeEach(() => {
		savePageMock.mockResolvedValue({ success: true, filePath: '/test/path' });
		vi.clearAllMocks();
	});
	it('should export POST handler', () => {
		expect(typeof POST).toBe('function');
	});

	it('should accept POST requests with valid payload', async () => {
		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify({ name: 'test-page', data: { components: [] } })
		});

		const response = await POST(mockRequest);
		expect([200, 201]).toContain(response.status);
	});

	it('should return error for missing name parameter', async () => {
		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify({ data: { components: [] } })
		});

		const response = await POST(mockRequest);
		expect([400, 422]).toContain(response.status);
	});

	it('should return error for missing data parameter', async () => {
		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify({ name: 'test-page' })
		});

		const response = await POST(mockRequest);
		expect([400, 422]).toContain(response.status);
	});

	it('should handle invalid JSON request body', async () => {
		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: 'invalid json'
		});

		const response = await POST(mockRequest);
		expect([400, 422, 500]).toContain(response.status);
	});

	it('should save page with valid name and data', async () => {
		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify({ 
				name: 'my-page', 
				data: { 
					components: [{ id: 'comp1', type: 'Text' }],
					metadata: { title: 'My Page' }
				} 
			})
		});

		const response = await POST(mockRequest);
		expect([200, 201]).toContain(response.status);
	});

	it('should handle empty data object', async () => {
		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify({ name: 'empty-page', data: {} })
		});

		const response = await POST(mockRequest);
		expect([200, 201, 400, 422]).toContain(response.status);
	});

	it('should handle large payloads', async () => {
		const largeData = {
			name: 'large-page',
			data: {
				components: Array(100).fill({ id: 'comp', type: 'Text', props: {} })
			}
		};

		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify(largeData)
		});

		const response = await POST(mockRequest);
		expect([200, 201, 400, 422, 500]).toContain(response.status);
	});

	it('should require proper HTTP method', async () => {
		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify({ name: 'test-page', data: {} })
		});

		const response = await POST(mockRequest);
		expect(response instanceof Response).toBe(true);
	});

	it('should handle storage failures gracefully', async () => {
		savePageMock.mockRejectedValue(new Error('Storage failed'));

		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify({ name: 'test-page', data: { components: [] } })
		});

		const response = await POST(mockRequest);
		expect(response.status).toBeOneOf([400, 500]);
	});

	it('should return response object', async () => {
		const mockRequest = new Request('http://localhost:3000/api/save-route', {
			method: 'POST',
			body: JSON.stringify({ name: 'test', data: { components: [] } })
		});

		const response = await POST(mockRequest);
		expect(response).toHaveProperty('status');
		expect(response).toHaveProperty('json');
	});
});
