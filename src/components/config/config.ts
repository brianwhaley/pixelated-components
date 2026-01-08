import type { PixelatedConfig } from './config.types';
import { decrypt, isEncrypted } from './crypto';
import fs from 'fs';
import path from 'path';

const debug = false;
/**
 * Read the full master config blob from local file.
 * This function is intended for server-side use only.
 */
export function getFullPixelatedConfig(): PixelatedConfig {
	let raw = '';
	let source = 'none';

	// Focus strictly on the config file. 
	// Search multiple locations to handle different production/standalone environments.
	const filename = 'pixelated.config.json';
	const paths = [
		path.join(process.cwd(), 'src/app/config', filename),
		path.join(process.cwd(), 'app/config', filename),
		path.join(process.cwd(), filename),
		path.join(process.cwd(), '.next/server', filename), // Sometimes moved here in build
	];

	for (const configPath of paths) {
		if (fs.existsSync(configPath)) {
			try {
				raw = fs.readFileSync(configPath, 'utf8');
				source = configPath;
				break;
			} catch (err) {
				console.error(`Failed to read config file at ${configPath}`, err);
			}
		}
	}

	if (!raw) {
		console.error('PIXELATED_CONFIG not found. Ensure src/app/config/pixelated.config.json is available.');
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
			if (debug) console.log(`PIXELATED_CONFIG decrypted using key.`);
		} catch (err) {
			console.error('Failed to decrypt PIXELATED_CONFIG', err);
			return {} as PixelatedConfig;
		}
	}

	try {
		const parsed = JSON.parse(raw);
		if (debug) console.log(`PIXELATED_CONFIG loaded from ${source}`);
		return parsed as PixelatedConfig;
	} catch (err) {
		console.error('Failed to parse PIXELATED_CONFIG JSON; source=', source, err);
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
		// Explicitly allow common public-facing keys
		if (/api_key|apikey|public_key/i.test(key)) return false;
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
