import type { PixelatedConfig } from './config.types';
import { decrypt, isEncrypted } from './crypto';
import fs from 'fs';
import path from 'path';

const debug = false;
/**
 * Read the full master config blob from environment or local file.
 * This function is intended for server-side use only.
 */
export function getFullPixelatedConfig(): PixelatedConfig {
	let raw = '';
	let source = 'none';

	// Try reading from the conventional file location
	const configPath = path.join(process.cwd(), 'src/app/config/pixelated.config.json');
	if (fs.existsSync(configPath)) {
		try {
			raw = fs.readFileSync(configPath, 'utf8');
			source = 'src/app/config/pixelated.config.json';
		} catch (err) {
			console.error(`Failed to read config file at ${configPath}`, err);
		}
	}

	if (!raw) {
		console.error('PIXELATED_CONFIG not found: src/app/config/pixelated.config.json is not available.');
		return {} as PixelatedConfig;
	}

	// Handle decryption if the content is encrypted
	if (isEncrypted(raw)) {
		const key = process.env.PIXELATED_CONFIG_KEY;
		if (!key) {
			console.error('PIXELATED_CONFIG is encrypted but PIXELATED_CONFIG_KEY is not set in the environment.');
			return {} as PixelatedConfig;
		}
		try {
			raw = decrypt(raw, key);
			if (debug) console.log(`PIXELATED_CONFIG decrypted using key from environment.`);
		} catch (err) {
			console.error('Failed to decrypt PIXELATED_CONFIG', err);
			return {} as PixelatedConfig;
		}
	}

	try {
		const parsed = JSON.parse(raw);
		if (debug) console.log(`PIXELATED_CONFIG loaded from ${source}; raw length=${raw.length}`);
		return parsed as PixelatedConfig;
	} catch (err) {
		console.error('Failed to parse PIXELATED_CONFIG JSON; source=', source, 'rawLength=', raw.length, err);
		return {} as PixelatedConfig;
	}
}

/**
 * Produce a client-safe copy of a full config by removing secret-like keys.
 * This will walk the object and drop any fields that match a secret pattern.
 */
export function getClientOnlyPixelatedConfig(full?: PixelatedConfig): PixelatedConfig {
	const src = full ?? getFullPixelatedConfig();

	function isSecretKey(key: string) {
		return /token|secret|key|password|management|access/i.test(key);
	}

	function strip(obj: any): any {
		if (!obj || typeof obj !== 'object') return obj;
		if (Array.isArray(obj)) return obj.map(strip);
		const out: any = {};
		for (const k of Object.keys(obj)) {
			if (isSecretKey(k)) continue;
			out[k] = strip(obj[k]);
		}
		return out;
	}

	try {
		return strip(src) as PixelatedConfig;
	} catch (err) {
		console.error('Failed to strip secrets from config', err);
		return {} as PixelatedConfig;
	}
}

