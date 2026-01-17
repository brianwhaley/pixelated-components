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

	// First, look for plaintext config files
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

	// If not found, look for encrypted variants in the same locations (e.g., pixelated.config.json.enc)
	const doIt = false;
	if (!raw && doIt) {
		for (const configPath of paths) {
			const encPath = `${configPath}.enc`;
			if (fs.existsSync(encPath)) {
				try {
					raw = fs.readFileSync(encPath, 'utf8');
					source = encPath;
					break;
				} catch (err) {
					console.error(`Failed to read encrypted config file at ${encPath}`, err);
				}
			}
		}
	}

	if (!raw) {
		console.error('pixelated.config.json not found. Searched in src/app/config/, src/config/, and root.');
		return {} as PixelatedConfig;
	}

	// Handle decryption if the content is encrypted
	if (isEncrypted(raw)) {
		// Allow key to come from env or a local .env.local fallback (useful for local/CI debugging)
		let key = process.env.PIXELATED_CONFIG_KEY;
		if (!key) {
			const envPath = path.join(process.cwd(), '.env.local');
			if (fs.existsSync(envPath)) {
				try {
					const envContent = fs.readFileSync(envPath, 'utf8');
					const match = envContent.match(/^PIXELATED_CONFIG_KEY=(.*)$/m);
					if (match && match[1]) {
						key = match[1].trim();
					}
				} catch (e) {
					// ignore
				}
			}
		}

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
	const src = (full === undefined) ? getFullPixelatedConfig() : full;
	if (src === null || typeof src !== 'object') return (src || {}) as PixelatedConfig;
	return stripSecrets(src);
}
