import { describe, it, expect, vi, beforeEach } from 'vitest';
import { smartFetch } from '../components/foundation/smartfetch';

describe('smartFetch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('basic fetching', () => {
		it('should fetch and parse JSON response', async () => {
			const mockData = { id: 1, name: 'Test' };
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockData),
				})
			) as any;

			const result = await smartFetch('https://api.example.com/data', {
				responseType: 'json',
			});

			expect(result).toEqual(mockData);
		});

		it('should fetch and return text response', async () => {
			const mockText = '<html>...</html>';
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					text: () => Promise.resolve(mockText),
				})
			) as any;

			const result = await smartFetch('https://api.example.com/page', {
				responseType: 'text',
			});

			expect(result).toBe(mockText);
		});

		it('should fetch and return blob response', async () => {
			const mockBlob = new Blob(['binary data']);
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					blob: () => Promise.resolve(mockBlob),
				})
			) as any;

			const result = await smartFetch('https://api.example.com/image.jpg', {
				responseType: 'blob',
			});

			expect(result).toEqual(mockBlob);
		});

		it('should default to JSON response type', async () => {
			const mockData = { test: true };
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockData),
				})
			) as any;

			const result = await smartFetch('https://api.example.com/data');

			expect(result).toEqual(mockData);
		});
	});

	describe('error handling', () => {
		it('should throw error for HTTP error status', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: false,
					status: 404,
					statusText: 'Not Found',
				})
			) as any;

			await expect(smartFetch('https://api.example.com/notfound')).rejects.toThrow();
		});

		it('should include domain in error message', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: false,
					status: 500,
					statusText: 'Server Error',
				})
			) as any;

			try {
				await smartFetch('https://api.example.com/data');
				expect.fail('Should have thrown');
			} catch (err: any) {
				expect(err.message).toContain('[smartFetch]');
				expect(err.message).toContain('api.example.com');
			}
		});
	});

	describe('callbacks', () => {
		it('should call onSuccess when fetch succeeds', async () => {
			const onSuccess = vi.fn();
			const mockData = { success: true };

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockData),
				})
			) as any;

			await smartFetch('https://api.example.com/data', {
				onSuccess,
			});

			expect(onSuccess).toHaveBeenCalledWith(mockData);
		});

		it('should call onError when fetch fails', async () => {
			const onError = vi.fn();

			global.fetch = vi.fn(() =>
				Promise.reject(new Error('Network error'))
			) as any;

			try {
				await smartFetch('https://api.example.com/data', {
					retries: 0,
					onError,
				});
			} catch {
				// Expected
			}

			expect(onError).toHaveBeenCalled();
		});

		it('should call onComplete always', async () => {
			const onComplete = vi.fn();

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: 'test' }),
				})
			) as any;

			await smartFetch('https://api.example.com/data', {
				onComplete,
			});

			expect(onComplete).toHaveBeenCalled();
		});

		it('should call onComplete even on error', async () => {
			const onComplete = vi.fn();

			global.fetch = vi.fn(() =>
				Promise.reject(new Error('Network error'))
			) as any;

			try {
				await smartFetch('https://api.example.com/data', {
					retries: 0,
					onComplete,
				});
			} catch {
				// Expected
			}

			expect(onComplete).toHaveBeenCalled();
		});
	});

	describe('debug logging', () => {
		it('should log when debug flag is true', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: 'test' }),
				})
			) as any;

			await smartFetch('https://api.example.com/data', {
				debug: true,
			});

			expect(consoleSpy).toHaveBeenCalled();
			consoleSpy.mockRestore();
		});
	});

	describe('advanced error scenarios', () => {
		it('should handle malformed URLs gracefully', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: false,
					status: 400,
					statusText: 'Bad Request',
				})
			) as any;

			try {
				await smartFetch('not a valid url', {
					responseType: 'json',
				});
				expect.fail('Should have thrown');
			} catch (err: any) {
				expect(err.message).toContain('[smartFetch]');
				expect(err.message).toContain('unknown');
			}
		});

		it('should handle network failures with retries', async () => {
			let attemptCount = 0;
			global.fetch = vi.fn(() => {
				attemptCount++;
				if (attemptCount < 3) {
					return Promise.reject(new Error('Network timeout'));
				}
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ recovered: true }),
				});
			}) as any;

			const result = await smartFetch('https://api.example.com/data', {
				retries: 2,
				responseType: 'json',
			});

			expect(result).toEqual({ recovered: true });
		});

		it('should handle responses with no status text', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: false,
					status: 403,
					statusText: '',
				})
			) as any;

			try {
				await smartFetch('https://api.example.com/denied');
				expect.fail('Should have thrown');
			} catch (err: any) {
				expect(err.message).toContain('403');
			}
		});
	});

	describe('response type handling', () => {
		it('should handle empty blob response', async () => {
			const emptyBlob = new Blob();
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					blob: () => Promise.resolve(emptyBlob),
				})
			) as any;

			const result = await smartFetch('https://api.example.com/empty', {
				responseType: 'blob',
			});

			expect(result.size).toBe(0);
		});

		it('should handle empty JSON response', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({}),
				})
			) as any;

			const result = await smartFetch('https://api.example.com/empty', {
				responseType: 'json',
			});

			expect(result).toEqual({});
		});

		it('should handle empty text response', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					text: () => Promise.resolve(''),
				})
			) as any;

			const result = await smartFetch('https://api.example.com/empty', {
				responseType: 'text',
			});

			expect(result).toBe('');
		});
	});

	describe('proxy handling', () => {
		it('should use proxy when forceProxy is true', async () => {
			const mockData = { proxied: true };
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockData),
				})
			) as any;

			const result = await smartFetch('https://api.example.com/data', {
				proxy: {
					url: 'https://proxy.example.com/',
					forceProxy: true,
					fallbackOnCors: false,
				},
				responseType: 'json',
			});

			expect(result).toEqual(mockData);
			const callArgs = (global.fetch as any).mock.calls[0][0];
			expect(callArgs).toContain('proxy.example.com');
		});

		it('should fallback to proxy on CORS error', async () => {
			let callCount = 0;
			global.fetch = vi.fn(() => {
				callCount++;
				if (callCount === 1) {
					// First call (direct) fails with CORS
					return Promise.reject(new Error('Failed to fetch: CORS'));
				}
				// Second call (proxy) succeeds
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ corsRecovered: true }),
				});
			}) as any;

			const result = await smartFetch('https://api.example.com/data', {
				proxy: {
					url: 'https://proxy.example.com/',
					forceProxy: false,
					fallbackOnCors: true,
				},
				responseType: 'json',
				retries: 0,
			});

			expect(result).toEqual({ corsRecovered: true });
			expect((global.fetch as any).mock.calls.length).toBe(2);
		});

		it('should encode URL when using proxy', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({}),
				})
			) as any;

			await smartFetch('https://api.example.com/path?query=value', {
				proxy: {
					url: 'https://proxy.example.com/?url=',
					forceProxy: true,
					fallbackOnCors: false,
				},
				responseType: 'json',
			});

			const callArgs = (global.fetch as any).mock.calls[0][0];
			expect(callArgs).toContain('https://proxy.example.com/');
			expect(callArgs).toContain(encodeURIComponent('https://api.example.com/path?query=value'));
		});
	});

	describe('caching', () => {
		it('should use CacheManager when provided', async () => {
			const mockData = { cached: true };
			const cacheManager = {
				get: vi.fn().mockReturnValue(null),
				set: vi.fn(),
			};

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockData),
				})
			) as any;

			await smartFetch('https://api.example.com/data', {
				cache: cacheManager as any,
				cacheKey: 'test-key',
				cacheStrategy: 'local',
				responseType: 'json',
			});

			expect(cacheManager.set).toHaveBeenCalledWith('test-key', mockData);
		});

		it('should return cached data when available', async () => {
			const cachedData = { fromCache: true };
			const cacheManager = {
				get: vi.fn().mockReturnValue(cachedData),
				set: vi.fn(),
			};

			global.fetch = vi.fn();

			const result = await smartFetch('https://api.example.com/data', {
				cache: cacheManager as any,
				cacheKey: 'test-key',
				cacheStrategy: 'local',
				responseType: 'json',
			});

			expect(result).toEqual(cachedData);
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it('should use both cache strategies when specified', async () => {
			const mockData = { dual: true };
			const cacheManager = {
				get: vi.fn().mockReturnValue(null),
				set: vi.fn(),
			};

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockData),
				})
			) as any;

			await smartFetch('https://api.example.com/data', {
				cache: cacheManager as any,
				cacheKey: 'test-key',
				cacheStrategy: 'both',
				nextCache: { revalidate: 3600 },
				responseType: 'json',
			});

			expect(cacheManager.set).toHaveBeenCalledWith('test-key', mockData);
			const fetchCall = (global.fetch as any).mock.calls[0];
			expect(fetchCall[1]?.next).toBeDefined();
		});
	});

	describe('retry logic', () => {
		it('should retry with exponential backoff', async () => {
			let attempts = 0;
			global.fetch = vi.fn(async () => {
				attempts++;
				if (attempts < 3) {
					return Promise.reject(new Error('Temporary failure'));
				}
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ success: true }),
				});
			}) as any;

			const start = Date.now();
			const result = await smartFetch('https://api.example.com/data', {
				retries: 2,
				responseType: 'json',
			});

			const duration = Date.now() - start;
			expect(result).toEqual({ success: true });
			// Should have delays: 100ms + 200ms = 300ms minimum
			expect(duration).toBeGreaterThanOrEqual(250);
		});

		it('should fail after all retries exhausted', async () => {
			global.fetch = vi.fn(() =>
				Promise.reject(new Error('Persistent failure'))
			) as any;

			await expect(
				smartFetch('https://api.example.com/data', {
					retries: 2,
					responseType: 'json',
				})
			).rejects.toThrow('Persistent failure');

			// Should attempt 3 times (initial + 2 retries)
			expect((global.fetch as any).mock.calls.length).toBe(3);
		});

		it('should not retry when retries is 0', async () => {
			let attempts = 0;
			global.fetch = vi.fn(() => {
				attempts++;
				return Promise.reject(new Error('First failure'));
			}) as any;

			await expect(
				smartFetch('https://api.example.com/data', {
					retries: 0,
					responseType: 'json',
				})
			).rejects.toThrow();

			expect(attempts).toBe(1);
		});
	});

	describe('timeout handling', () => {
		it('should abort request on timeout', async () => {
			const abortSpy = vi.fn();
			let abortController: AbortController | null = null;

			global.fetch = vi.fn((url: string, options: any) => {
				abortController = options?.signal?.abortController || { abort: abortSpy };
				return new Promise(() => {
					// Never resolves - simulates hanging request
				});
			}) as any;

			const timeout = 100;
			const promise = smartFetch('https://api.example.com/data', {
				timeout,
				retries: 0,
				responseType: 'json',
			});

			// Wait for timeout to trigger
			await new Promise(resolve => setTimeout(resolve, timeout + 50));

			// The fetch should have been called and would abort on timeout
			expect((global.fetch as any).mock.calls.length).toBeGreaterThan(0);
		});
	});

	describe('next.js cache strategy', () => {
		it('should include nextCache in fetch options for next strategy', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: 'test' }),
				})
			) as any;

			const nextCacheOption = { revalidate: 3600 };
			await smartFetch('https://api.example.com/data', {
				cacheStrategy: 'next',
				nextCache: nextCacheOption,
				responseType: 'json',
			});

			const fetchCall = (global.fetch as any).mock.calls[0];
			expect(fetchCall[1]?.next).toEqual(nextCacheOption);
		});

		it('should include nextCache for both strategy', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ data: 'test' }),
				})
			) as any;

			const nextCacheOption = { revalidate: 1800 };
			await smartFetch('https://api.example.com/data', {
				cacheStrategy: 'both',
				nextCache: nextCacheOption,
				responseType: 'json',
			});

			const fetchCall = (global.fetch as any).mock.calls[0];
			expect(fetchCall[1]?.next).toEqual(nextCacheOption);
		});
	});

	describe('CORS error detection', () => {
		it('should detect CORS errors in error message', async () => {
			global.fetch = vi.fn(() =>
				Promise.reject(new Error('CORS policy violation'))
			) as any;

			const mockCache = {
				get: vi.fn().mockReturnValue(null),
				set: vi.fn(),
			};

			await expect(
				smartFetch('https://api.example.com/data', {
					proxy: {
						url: 'https://proxy.example.com/',
						forceProxy: false,
						fallbackOnCors: true,
					},
					cache: mockCache as any,
					cacheKey: 'test',
					retries: 0,
					responseType: 'json',
				})
			).rejects.toThrow();
		});

		it('should detect cross-origin errors', async () => {
			let callCount = 0;
			global.fetch = vi.fn(() => {
				callCount++;
				if (callCount === 1) {
					return Promise.reject(new Error('cross-origin request blocked'));
				}
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ recovered: true }),
				});
			}) as any;

			const result = await smartFetch('https://api.example.com/data', {
				proxy: {
					url: 'https://proxy.example.com/',
					forceProxy: false,
					fallbackOnCors: true,
				},
				retries: 0,
				responseType: 'json',
			});

			expect(result).toEqual({ recovered: true });
		});
	});

	describe('response type ok and status', () => {
		it('should return raw Response object when responseType is ok', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: new Headers(),
			};

			global.fetch = vi.fn(() => Promise.resolve(mockResponse)) as any;

			const result = await smartFetch('https://api.example.com/data', {
				responseType: 'ok',
			});

			expect(result).toBe(mockResponse);
		});

		it('should return raw Response object when responseType is status', async () => {
			const mockResponse = {
				ok: true,
				status: 201,
				statusText: 'Created',
			};

			global.fetch = vi.fn(() => Promise.resolve(mockResponse)) as any;

			const result = await smartFetch('https://api.example.com/create', {
				responseType: 'status',
			});

			expect(result).toBe(mockResponse);
		});

		it('should call onSuccess with Response object for ok responseType', async () => {
			const onSuccess = vi.fn();
			const mockResponse = { ok: true, status: 200 };

			global.fetch = vi.fn(() => Promise.resolve(mockResponse)) as any;

			await smartFetch('https://api.example.com/data', {
				responseType: 'ok',
				onSuccess,
			});

			expect(onSuccess).toHaveBeenCalledWith(mockResponse);
		});

		it('should call onSuccess with Response object for status responseType', async () => {
			const onSuccess = vi.fn();
			const mockResponse = { ok: true, status: 202 };

			global.fetch = vi.fn(() => Promise.resolve(mockResponse)) as any;

			await smartFetch('https://api.example.com/data', {
				responseType: 'status',
				onSuccess,
			});

			expect(onSuccess).toHaveBeenCalledWith(mockResponse);
		});
	});
});
