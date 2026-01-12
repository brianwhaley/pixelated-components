// Types for Pixelated integration configuration

export interface AWSConfig {
	/** Programmatic credentials for AWS (if not using instance/IAM role). Prefer using instance roles */
	access_key_id?: string;
	secret_access_key?: string;
	session_token?: string;
	region?: string;
}

export interface CloudinaryConfig {
	product_env: string;
	baseUrl?: string; // optional custom CDN base, e.g. https://res.cloudinary.com
	secure?: boolean;
	transforms?: string; // e.g. "f_auto,q_auto"
	api_key?: string;
	api_secret?: string;
}

export interface ContentfulConfig {
	proxyURL?: string;
	base_url: string;
	space_id: string;
	environment: string;
	delivery_access_token?: string;
	management_access_token?: string;
	preview_access_token?: string;
}

export interface EbayConfig {
	proxyURL?: string,
	appId: string;
	appDevId?: string;
	appCertId: string;
	sbxAppId: string;
	sbxAppDevId?: string;
	sbxAppCertId: string;
	globalId: string;
	environment?: string;
	tokenScope?: string;
	baseTokenURL?: string,
	baseSearchURL?: string,
	baseAnalyticsURL?: string,
	qsSearchURL?: string,
	baseItemURL?: string,
	qsItemURL?: string,
	itemCategory?: string,
	cacheTTL?: number;
}

export interface FlickrConfig {
	baseURL: string; // e.g. 'https://api.flickr.com/services/rest/?'
	urlProps: {
		method?: string; // 'flickr.photos.search',
		api_key: string;
		user_id: string;
		tags?: string; // e.g. 'pixelatedviewsgallery' or photoset_id
		photoset_id?: string; // e.g. '72177720326903710', for photo albums, or use tags for search
		extras: string; // 'date_taken,description,owner_name',
		sort: string; //'date-taken-desc',
		per_page: number; // 500,
		format: string; // 'json',
		photoSize: string; // 'Medium',
		callback?: string; // function name for JSONP
		nojsoncallback?: string; // 'true' if no callback function, else omit or set to 'false'
	}
}

export interface GitHubConfig {
	/** Personal Access Token or App token used to call GitHub REST API (use a fine-grained token with readonly repo access) */
	token?: string;
	/** Optional custom API base URL (enterprise installations). Defaults to https://api.github.com */
	apiBaseUrl?: string;
	/** Optional default organization/owner to use when a repo name is specified without owner */
	defaultOwner?: string;
}

export interface GlobalConfig {
	proxyUrl?: string; // e.g. 'https://proxy.pixelated.tech/prod/proxy?url='
	pagesDir?: string; // override pages directory used by page builder
}

export interface Google {
	client_id: string;
	client_secret: string;
	api_key: string;
	refresh_token: string;
}

export interface GoogleAnalyticsConfig {
	id: string; // e.g. G-XXXXXXX
	adId?: string; // e.g. AW-XXXXXXXXX
}

export interface GoogleMapsConfig {
	apiKey: string;
}

export interface GoogleSearchConsoleConfig {
	id: string;
}

export interface HubspotConfig {
	region?: string; // HubSpot region, e.g. 'na1', 'eu1', 'ap1'
	portalId?: string; // HubSpot portal/account id
	formId?: string; // default contact form id to embed
	trackingCode?: string; // optional tracking code snippet or id
	endpoint?: string; // optional API endpoint for server use
}

export interface InstagramConfig {
	accessToken?: string;
	userId?: string;
}

export interface NextAuth {
	secret: string;
	/** Optional explicit URLs for different environments. Use `local_url`, `dev_url`, and/or `prod_url`. */
	local_url?: string; // local developer machine
	dev_url?: string;   // preview/staging environments
	prod_url?: string;  // production
}

export interface PaypalConfig {
	sandboxPayPalApiKey: string;
	sandboxPayPalSecret: string;
	payPalApiKey: string;
	payPalSecret: string;
}

export interface WordpressConfig {
	baseURL: string; // REST API base URL, e.g. 'https://public-api.wordpress.com/rest/v1/sites/'
	site: string; // WordPress site identifier (e.g., 'pixelatedviews.wordpress.com')
}

export type DisplayMode = 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';

export interface SiteInfo {
	// Core site fields are required for downstream schemas (Website, LocalBusiness).
	// Keep secondary fields optional for backward compatibility.
	name: string;
	description: string;
	url: string;
	email?: string;
	image?: string;
	image_height?: string | number;
	image_width?: string | number;
	favicon?: string;
	telephone?: string;
	address?: {
		streetAddress?: string;
		addressLocality?: string;
		addressRegion?: string;
		postalCode?: string;
		addressCountry?: string;
	};
	openingHours?: string;
	priceRange?: string;
	sameAs?: string[];
	keywords?: string;
	publisherType?: string;
	copyrightYear?: number;
	potentialAction?: {
		"@type"?: string;
		target?: string;
		"query-input"?: string;
		queryInput?: string;
	};
	// PWA Manifest properties
	author?: string;
	theme_color?: string;
	background_color?: string;
	default_locale?: string;
	display?: DisplayMode;
	favicon_sizes?: string;
	favicon_type?: string;
}

/**
 * Metadata defining which configuration keys are secrets and must be stripped
 * before being sent to the client (browser).
 */
export const SECRET_CONFIG_KEYS = {
	// Keys found at the root of the configuration object
	global: [
		'PIXELATED_CONFIG_KEY'
	],
	// Keys found within specific service configuration blocks
	services: {
		aws: [
			'access_key_id',
			'secret_access_key',
			'session_token'
		],
		cloudinary: [
			'api_key', 
			'api_secret'
		],
		contentful: [
			'management_access_token', 
			'preview_access_token'
		],
		ebay: [
			'sbxAppId'
		],
		github: [
			'token'
		],
		instagram: [
			'accessToken'
		],
		paypal: [
			'sandboxPayPalApiKey',
			'sandboxPayPalSecret',
			'payPalApiKey',
			'payPalSecret'
		]
	}
};

export interface PixelatedConfig {
	global?: GlobalConfig;
	aws?: AWSConfig;
	cloudinary?: CloudinaryConfig;
	contentful?: ContentfulConfig;
	ebay?: EbayConfig;
	flickr?: FlickrConfig;
	github?: GitHubConfig;
	globlalConfig?: GlobalConfig;
	google?: Google;
	googleAnalytics?: GoogleAnalyticsConfig;
	googleMaps?: GoogleMapsConfig;
	googleSearchConsole?: GoogleSearchConsoleConfig;
	hubspot?: HubspotConfig;
	instagram?: InstagramConfig;
	nextAuth?: NextAuth;
	paypal?: PaypalConfig;
	wordpress?: WordpressConfig;
}
