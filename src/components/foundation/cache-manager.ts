/**
 * CacheManager
 * 
 * A unified caching utility that supports Memory, LocalStorage, and SessionStorage. 
 * Includes TTL (Time-To-Live) support and automatic SSR fallback.
 * 
 * ARCHITECTURE NOTE: The `domain` parameter is required to enforce clear namespace separation and
 * provide future-proofing. While the library is currently deployed **per-domain** (each site gets
 * its own isolated copy of this library), the domain parameter serves important purposes:
 * 1. **Code Clarity**: Makes the multi-tenant intent explicit in code
 * 2. **Future-Proofing**: If architecture changes to shared backends (Redis), isolation is built-in
 * 3. **Safety**: Prevents accidental empty prefixes that could cause collisions
 * 
 * Each domain runs in isolation:
 * - Client-side: Uses window.location to determine domain (e.g., pixelvivid.com → "pixelvivid")
 * - Server-side: Defaults to 'pixelated' (safe because server caches are in-memory per process)
 * - Memory caches: Naturally isolated to their process, so multi-tenancy doesn't apply
 * - Local/Session storage: Browser-based, inherently isolated by domain
 */

export type CacheMode = 'memory' | 'local' | 'session' | 'none';

export interface CacheOptions {
	domain: string;    // Tenant/domain name (e.g., 'pixelvivid', 'sitehealth') - prevents multi-tenant collisions
	namespace?: string; // Optional namespace within domain (e.g., 'cart', 'analytics', 'cloudwatch')
	ttl?: number;      // Expiration time in milliseconds (Default: 1 hour)
	mode?: CacheMode;  // Storage engine (Default: 'memory')
}

interface CacheWrapper<T> {
	data: T;
	expiry: number;
}

export class CacheManager {
	private memoryCache = new Map<string, CacheWrapper<any>>();
	private readonly defaultTTL = 60 * 60 * 1000; // 1 hour
	private mode: CacheMode;
	private prefix: string;
	private ttl: number;

	constructor(options: CacheOptions) {
		this.mode = options.mode || 'memory';
		this.ttl = options.ttl || this.defaultTTL;

		// Build prefix from domain + optional namespace
		// domain + namespace pattern: "pixelvivid_cart_" or "sitehealth_analytics_"
		this.prefix = options.namespace 
			? `${options.domain}_${options.namespace}_`
			: `${options.domain}_`;

		// Fallback to memory if browser storage is requested but unavailable (SSR/Node environment)
		if (typeof window === 'undefined' && (this.mode === 'local' || this.mode === 'session')) {
			this.mode = 'memory';
		}
	}

	/**
	 * Returns the storage engine based on the mode
	 */
	private getStorage(): Storage | null {
		if (typeof window === 'undefined') return null;
		if (this.mode === 'local') return window.localStorage;
		if (this.mode === 'session') return window.sessionStorage;
		return null;
	}

	/**
	 * Generates a prefixed key to avoid collisions
	 */
	private getFullKey(key: string): string {
		return `${this.prefix}${key}`;
	}

	/**
	 * Retrieves data from the cache
	 */
	get<T>(key: string): T | null {
		if (this.mode === 'none') return null;

		const fullKey = this.getFullKey(key);
		let wrapper: CacheWrapper<T> | null = null;

		// 1. Check Memory cache first (fastest)
		const memMatch = this.memoryCache.get(fullKey);
		if (memMatch) {
			wrapper = memMatch;
		} 
		
		// 2. Check Browser storage if memory failed or was bypassed
		if (!wrapper) {
			const storage = this.getStorage();
			if (storage) {
				const raw = storage.getItem(fullKey);
				if (raw) {
					try {
						wrapper = JSON.parse(raw);
					} catch (e) {
						return null;
					}
				}
			}
		}

		// 3. Validate Expiry
		if (wrapper) {
			if (Date.now() < wrapper.expiry) {
				// Resync memory cache if we pulled from storage
				if (!memMatch) {
					this.memoryCache.set(fullKey, wrapper);
				}
				return wrapper.data;
			}
			// Clean up expired items
			this.remove(key);
		}

		return null;
	}

	/**
	 * Stores data in the cache with a specified TTL
	 */
	set<T>(key: string, data: T, customTTL?: number): void {
		if (this.mode === 'none') return;

		const fullKey = this.getFullKey(key);
		const expiry = Date.now() + (customTTL || this.ttl);
		const wrapper: CacheWrapper<T> = { data, expiry };

		// Always update memory
		this.memoryCache.set(fullKey, wrapper);

		// Update browser storage if applicable
		const storage = this.getStorage();
		if (storage) {
			storage.setItem(fullKey, JSON.stringify(wrapper));
		}
	}

	/**
	 * Removes a specific item from all storage engines
	 */
	remove(key: string): void {
		const fullKey = this.getFullKey(key);
		this.memoryCache.delete(fullKey);
		const storage = this.getStorage();
		if (storage) {
			storage.removeItem(fullKey);
		}
	}

	/**
	 * Clears only the items belonging to this manager (by prefix)
	 */
	clear(): void {
		this.memoryCache.clear();
		const storage = this.getStorage();
		if (storage) {
			Object.keys(storage).forEach(k => {
				if (k.startsWith(this.prefix)) {
					storage.removeItem(k);
				}
			});
		}
	}
}
