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
			if (serviceSecrets.includes(key)) return true;
		}

		return false;
	}

	function strip(obj: any, serviceName?: string): any {
		if (!obj || typeof obj !== 'object' || obj === null) return obj;
		
		if (visited.has(obj)) return '[Circular]';
		visited.add(obj);

		if (Array.isArray(obj)) return obj.map((item: any) => strip(item, serviceName));
		
		const out: any = {};
		for (const k of Object.keys(obj)) {
			// If we are at the top level, the key 'k' IS the service name (ebay, cloudinary, etc.)
			const currentService = serviceName || k;
			
			if (isSecretKey(k, serviceName)) continue;
			
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
