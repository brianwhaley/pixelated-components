import { type PixelatedConfig, SECRET_CONFIG_KEYS } from './config.types';
import { decrypt, isEncrypted } from './crypto';
import { getClientOnlyPixelatedConfig as stripSecrets } from './config.utils';
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
		path.join(process.cwd(), 'src/config', filename),
		path.join(process.cwd(), filename),
		path.join(process.cwd(), '.next/server', filename), // Sometimes moved here in build
		path.join(process.cwd(), 'dist', 'config', filename), // Support dist when project outputs a dist/config
		// If this library is installed as a package, check its dist/config as a fallback
		path.join(process.cwd(), 'node_modules', '@pixelated-tech', 'components', 'dist', 'config', filename),
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
		console.error('pixelated.config.json not found. Searched in src/app/config/, src/config/, and root.');
		return {} as PixelatedConfig;
	}

	// Handle decryption if the content is encrypted
	if (isEncrypted(raw)) {
		const key = process.env.PIXELATED_CONFIG_KEY;
		// Diagnostic logging: show which path contained the encrypted config and whether a key is available.
		const keyPresent = Boolean(key);
		const keyInfo = keyPresent ? `${key.length} chars` : 'missing';
		console.warn(`PIXELATED_CONFIG found encrypted at ${source}. PIXELATED_CONFIG_KEY presence: ${keyInfo}${process.env.PIXELATED_CONFIG_DEBUG ? ' (debug mode on)' : ''}`);
		if (!key) {
			console.error('PIXELATED_CONFIG is encrypted but PIXELATED_CONFIG_KEY is not set in the environment.');
			return {} as PixelatedConfig;
		}
		try {
			raw = decrypt(raw, key);
			if (debug) console.log(`PIXELATED_CONFIG decrypted using key.`);
			if (process.env.PIXELATED_CONFIG_DEBUG) console.warn('PIXELATED_CONFIG: decryption succeeded');
		} catch (err) {
			console.error('Failed to decrypt PIXELATED_CONFIG at', source, err?.message || err);
			if (process.env.PIXELATED_CONFIG_DEBUG) console.error('PIXELATED_CONFIG: decryption failed (debug mode on)');
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
	const src = (full === undefined) ? getFullPixelatedConfig() : full;
	if (src === null || typeof src !== 'object') return (src || {}) as PixelatedConfig;
	return stripSecrets(src);
}
