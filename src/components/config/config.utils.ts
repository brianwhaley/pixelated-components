import { type PixelatedConfig, SECRET_CONFIG_KEYS } from './config.types';

/**
 * Produce a client-safe copy of a config by removing secret-like keys.
 */
export function getClientOnlyPixelatedConfig(src: PixelatedConfig): PixelatedConfig {
	const visited = new WeakSet();

	function isSecretKey(key: string, serviceName?: string) {
		// 1. Check Global Secret List
		if (SECRET_CONFIG_KEYS.global.includes(key)) return true;

		// 2. Check Service-Specific Secret List
		if (serviceName && (SECRET_CONFIG_KEYS.services as any)[serviceName]) {
			const serviceSecrets = (SECRET_CONFIG_KEYS.services as any)[serviceName];
			if (serviceSecrets.includes(key)) {
				// console.log(`Config Stripper: Removing secret key "${key}" from service "${serviceName}"`);
				return true;
			}
		}

		return false;
	}

	function strip(obj: any, serviceName?: string): any {
		// Base case for non-objects
		if (obj === null || typeof obj !== 'object') return obj;
		
		// Avoid circular references
		if (visited.has(obj)) return '[Circular]';
		visited.add(obj);

		// Handle Arrays
		if (Array.isArray(obj)) {
			return obj.map((item: any) => strip(item, serviceName));
		}
		
		const out: any = {};
		for (const k of Object.keys(obj)) {
			// At the top level (serviceName is undefined), k is the service name
			const currentService = serviceName || k;
			
			// Check if this key should be stripped
			if (isSecretKey(k, serviceName)) {
				continue;
			}
			
			out[k] = strip(obj[k], currentService);
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
