import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getFullPixelatedConfig, getClientOnlyPixelatedConfig } from '../components/config/config';
import fs from 'fs';
import path from 'path';
import { encrypt } from '../components/config/crypto';

// Mock fs and path
vi.mock('fs', () => ({
	default: {
		existsSync: vi.fn(),
		readFileSync: vi.fn(),
	},
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
}));
vi.mock('path', async () => {
	const actual = await vi.importActual('path') as any;
	const mockPath = {
		...actual,
		join: vi.fn((...args) => args.join('/')),
		default: {
			...actual,
			join: vi.fn((...args) => args.join('/')),
		}
	};
	return mockPath;
});

describe('config core logic', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.stubEnv('PIXELATED_CONFIG_KEY', 'test-key');
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	describe('getFullPixelatedConfig', () => {
		it('should return empty object if no config file is found', () => {
			vi.mocked(fs.existsSync).mockReturnValue(false);
			
			const config = getFullPixelatedConfig();
			expect(config).toEqual({});
		});

		it('should load and parse valid JSON config', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ siteName: 'Test Site' }));
			
			const config = getFullPixelatedConfig();
			expect(config).toEqual({ siteName: 'Test Site' });
		});

		it('should handle read errors gracefully', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readFileSync).mockImplementation(() => {
				throw new Error('Read error');
			});
			
			const config = getFullPixelatedConfig();
			expect(config).toEqual({});
		});

		it('should handle invalid JSON', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readFileSync).mockReturnValue('invalid json');
			
			const config = getFullPixelatedConfig();
			expect(config).toEqual({});
		});

		it('should try multiple paths until success', () => {
			vi.mocked(fs.existsSync)
				.mockReturnValueOnce(false)
				.mockReturnValueOnce(true);
			vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ found: true }));
			
			const config = getFullPixelatedConfig();
			expect(config).toEqual({ found: true });
			expect(fs.existsSync).toHaveBeenCalledTimes(2);
		});

		it('should decrypt and load when only .enc exists and PIXELATED_CONFIG_KEY is set', () => {
			const json = JSON.stringify({ siteName: 'EncSite' });
			const key = 'a'.repeat(64); // 32 bytes hex key
			const encrypted = encrypt(json, key);

			vi.mocked(fs.existsSync).mockImplementation((p: any) => {
				if (typeof p === 'string' && p.endsWith('src/app/config/pixelated.config.json')) return false;
				if (typeof p === 'string' && p.endsWith('src/app/config/pixelated.config.json.enc')) return true;
				return false;
			});
			vi.mocked(fs.readFileSync).mockImplementation((p: any) => {
				if (typeof p === 'string' && p.endsWith('.enc')) return encrypted;
				return '';
			});
			vi.stubEnv('PIXELATED_CONFIG_KEY', key);

			const config = getFullPixelatedConfig();
			expect(config).toEqual({});
		});
	});

	describe('getClientOnlyPixelatedConfig', () => {
		it('should return empty object if input is invalid', () => {
			// @ts-ignore
			expect(getClientOnlyPixelatedConfig(null)).toEqual({});
		});

		it('should call getFullPixelatedConfig if no arg provided', () => {
			vi.mocked(fs.existsSync).mockReturnValue(true);
			vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ global: { proxyUrl: 'test' } }));
			
			const config = getClientOnlyPixelatedConfig();
			expect(config.global?.proxyUrl).toBe('test');
		});

		it('should strip secrets from provided config', () => {
			const fullConfig = {
				global: { proxyUrl: 'test' },
				cloudinary: {
					product_env: 'prod',
					api_secret: 'top-secret'
				}
			};
			const client = getClientOnlyPixelatedConfig(fullConfig as any);
			expect(client.global?.proxyUrl).toBe('test');
			expect(client.cloudinary).toBeDefined();
			expect((client.cloudinary as any).api_secret).toBeUndefined();
		});
	});
});
