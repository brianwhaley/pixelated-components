/**
 * Google API Integration Services
 * Centralized integration for Google services (Analytics, Search Console, etc.)
 * Combines authentication, caching, and data processing logic
 */

"use server";

import { google } from 'googleapis';
import { CacheManager } from '../../general/cache-manager';
import { calculateDateRanges, formatChartDate, getCachedData, setCachedData } from './google.api.utils';

// Migration-time debug flag (owner requested): verbose cache traces during migration
const debug = false; // keep as literal during migration for traceability

export interface GoogleAuthConfig {
  serviceAccountKey?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface GoogleServiceAuth {
  auth: any;
  client: any;
}

/**
 * Create authenticated Google API client for a specific service
 */
export async function createGoogleAuthClient(
	config: GoogleAuthConfig,
	scopes: string[]
): Promise<{ success: boolean; auth?: any; error?: string }> {
	try {
		let auth: any;

		if (config.serviceAccountKey) {
			// Use service account authentication (recommended)
			const credentials = JSON.parse(config.serviceAccountKey);
			auth = new google.auth.GoogleAuth({
				credentials,
				scopes,
			});
		} else if (config.clientId && config.clientSecret && config.refreshToken) {
			// Fallback to OAuth2 (deprecated for server-side apps)
			const oauth2Client = new google.auth.OAuth2(
				config.clientId,
				config.clientSecret
			);
			oauth2Client.setCredentials({
				refresh_token: config.refreshToken,
			});
			auth = oauth2Client;
		} else {
			return {
				success: false,
				error: 'Google credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY or OAuth credentials.'
			};
		}

		return { success: true, auth };
	} catch (error) {
		return {
			success: false,
			error: `Authentication failed: ${(error as Error).message}`
		};
	}
}

export interface GoogleAuthResult {
  success: boolean;
  auth?: any;
  client?: any;
  error?: string;
}

/**
 * Create Analytics Data API client
 */
export async function createAnalyticsClient(config: GoogleAuthConfig): Promise<GoogleAuthResult> {
	const result = await createGoogleAuthClient(config, ['https://www.googleapis.com/auth/analytics.readonly']);
	if (!result.success) return result;

	return {
		success: true,
		client: google.analyticsdata({ version: 'v1beta', auth: result.auth }),
		auth: result.auth
	};
}

/**
 * Create Search Console API client
 */
export async function createSearchConsoleClient(config: GoogleAuthConfig): Promise<GoogleAuthResult> {
	const result = await createGoogleAuthClient(config, ['https://www.googleapis.com/auth/webmasters.readonly']);
	if (!result.success) return result;

	return {
		success: true,
		client: google.searchconsole({ version: 'v1', auth: result.auth }),
		auth: result.auth
	};
}

// General utility functions


export interface GoogleAnalyticsConfig {
  ga4PropertyId: string;
  serviceAccountKey?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface ChartDataPoint {
	date: string;
	currentPageViews: number;
	previousPageViews: number;
}

export interface GoogleAnalyticsResponse {
	success: boolean;
	data?: ChartDataPoint[];
	error?: string;
}

// Cache for analytics data (1 hour)
const analyticsCache = new CacheManager({ prefix: 'sitehealth-analytics-', ttl: 60 * 60 * 1000 });

/**
 * Get Google Analytics data for a site with current/previous period comparison
 */
export async function getGoogleAnalyticsData(
	config: GoogleAnalyticsConfig,
	siteName: string,
	startDate?: string,
	endDate?: string
): Promise<GoogleAnalyticsResponse> {
	try {
		// Check cache first
		const cacheKey = `analytics-${siteName}-${startDate || 'default'}-${endDate || 'default'}`;
		const cached = getCachedData(analyticsCache, cacheKey);
		if (cached) {
			if (debug) console.debug('[site-health][analytics] cache HIT', cacheKey);
			return { success: true, data: cached };
		}
		if (debug) console.debug('[site-health][analytics] cache MISS', cacheKey);

		if (!config.ga4PropertyId || config.ga4PropertyId === 'GA4_PROPERTY_ID_HERE') {
			return {
				success: false,
				error: 'GA4 Property ID not configured for this site'
			};
		}

		// Set up authentication
		const authResult = await createAnalyticsClient(config);
		if (!authResult.success) {
			return {
				success: false,
				error: authResult.error || 'Authentication failed'
			};
		}

		const analyticsData = (authResult as any).client;
		const dateRange = calculateDateRanges(startDate, endDate);

		// Fetch current period data
		const currentResponse = await analyticsData.properties.runReport({
			property: `properties/${config.ga4PropertyId}`,
			requestBody: {
				dateRanges: [{ startDate: dateRange.currentStartStr, endDate: dateRange.currentEndStr }],
				dimensions: [{ name: 'date' }],
				metrics: [{ name: 'screenPageViews' }],
				orderBys: [{ dimension: { dimensionName: 'date' } }],
			},
		});

		// Fetch previous period data
		const previousResponse = await analyticsData.properties.runReport({
			property: `properties/${config.ga4PropertyId}`,
			requestBody: {
				dateRanges: [{ startDate: dateRange.previousStartStr, endDate: dateRange.previousEndStr }],
				dimensions: [{ name: 'date' }],
				metrics: [{ name: 'screenPageViews' }],
				orderBys: [{ dimension: { dimensionName: 'date' } }],
			},
		});

		// Create a map of previous period data by date
		const previousDataMap = new Map();
		previousResponse.data.rows?.forEach((row: any) => {
			const dateStr = row.dimensionValues?.[0]?.value || '';
			if (dateStr) {
				previousDataMap.set(dateStr, parseInt(row.metricValues?.[0]?.value || '0'));
			}
		});

		// Combine current and previous period data
		const chartData: ChartDataPoint[] = [];
		const daysInRange = Math.ceil((dateRange.currentEnd.getTime() - dateRange.currentStart.getTime()) / (24 * 60 * 60 * 1000));

		for (let i = daysInRange - 1; i >= 0; i--) {
			const currentDate = new Date(dateRange.currentEnd);
			currentDate.setDate(currentDate.getDate() - i);
			const currentDateStr = currentDate.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

			// Calculate corresponding previous period date
			const previousDate = new Date(currentDate.getTime() - (dateRange.currentEnd.getTime() - dateRange.currentStart.getTime()));
			const previousDateStr = previousDate.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

			// Get current period data
			const currentRow = currentResponse.data.rows?.find((row: any) =>
				row.dimensionValues?.[0]?.value === currentDateStr
			);
			const currentPageViews = parseInt(currentRow?.metricValues?.[0]?.value || '0');

			// Get previous period data
			const previousPageViews = previousDataMap.get(previousDateStr) || 0;

			chartData.push({
				date: formatChartDate(currentDate),
				currentPageViews: currentPageViews,
				previousPageViews: previousPageViews,
			});
		}

		// Cache the result
		if (debug) console.debug('[site-health][analytics] caching', cacheKey, 'rows=', chartData.length);
		setCachedData(analyticsCache, cacheKey, chartData);

		return { success: true, data: chartData };
	} catch (error) {
		console.error('Google Analytics error:', error);
		return {
			success: false,
			error: (error as Error).message
		};
	}
} 

export interface SearchConsoleConfig {
  siteUrl: string;
  serviceAccountKey?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
}

export interface SearchConsoleChartDataPoint {
	date: string;
	currentImpressions: number;
	currentClicks: number;
	previousImpressions: number;
	previousClicks: number;
}

export interface SearchConsoleResponse {
  success: boolean;
  data?: SearchConsoleChartDataPoint[];
  error?: string;
  code?: number;
  details?: string;
}

// Cache for search console data (1 hour)
const searchConsoleCache = new CacheManager({ prefix: 'sitehealth-searchconsole-', ttl: 60 * 60 * 1000 });

/**
 * Get Google Search Console data for a site with current/previous period comparison
 */
export async function getSearchConsoleData(
	config: SearchConsoleConfig,
	siteName: string,
	startDate?: string,
	endDate?: string
): Promise<SearchConsoleResponse> {
	try {
		// Check cache first
		const cacheKey = `searchconsole-${siteName}-${startDate || 'default'}-${endDate || 'default'}`;
		const cached = getCachedData(searchConsoleCache, cacheKey);
		if (cached) {
			return { success: true, data: cached };
		}

		if (!config.siteUrl) {
			return {
				success: false,
				error: 'Site URL not configured for Search Console'
			};
		}

		// Set up authentication
		const authResult = await createSearchConsoleClient(config);
		if (!authResult.success) {
			return {
				success: false,
				error: authResult.error || 'Authentication failed'
			};
		}

		const searchconsole = (authResult as any).client;
		const dateRange = calculateDateRanges(startDate, endDate);

		// Fetch current period data
		const currentResponse = await searchconsole.searchanalytics.query({
			siteUrl: config.siteUrl,
			requestBody: {
				startDate: dateRange.currentStartStr,
				endDate: dateRange.currentEndStr,
				dimensions: ['date'],
				rowLimit: 10000,
			},
		});

		// Fetch previous period data
		const previousResponse = await searchconsole.searchanalytics.query({
			siteUrl: config.siteUrl,
			requestBody: {
				startDate: dateRange.previousStartStr,
				endDate: dateRange.previousEndStr,
				dimensions: ['date'],
				rowLimit: 10000,
			},
		});

		// Create a map of previous period data by date
		const previousDataMap = new Map();
		previousResponse.data.rows?.forEach((row: any) => {
			const dateStr = row.keys?.[0] || '';
			if (dateStr) {
				previousDataMap.set(dateStr, {
					clicks: parseFloat(String(row.clicks || '0')),
					impressions: parseFloat(String(row.impressions || '0'))
				});
			}
		});

		// Combine current and previous period data
		const chartData: SearchConsoleChartDataPoint[] = [];
		const daysInRange = Math.ceil((dateRange.currentEnd.getTime() - dateRange.currentStart.getTime()) / (24 * 60 * 60 * 1000));

		for (let i = daysInRange - 1; i >= 0; i--) {
			const currentDate = new Date(dateRange.currentEnd);
			currentDate.setDate(currentDate.getDate() - i);
			const currentDateStr = currentDate.toISOString().split('T')[0];

			// Calculate corresponding previous period date
			const previousDate = new Date(currentDate.getTime() - (dateRange.currentEnd.getTime() - dateRange.currentStart.getTime()));
			const previousDateStr = previousDate.toISOString().split('T')[0];

			// Get current period data
			const currentRow = currentResponse.data.rows?.find((row: any) =>
				row.keys?.[0] === currentDateStr
			);
			const currentClicks = parseFloat(String(currentRow?.clicks || '0'));
			const currentImpressions = parseFloat(String(currentRow?.impressions || '0'));

			// Get previous period data
			const previousData = previousDataMap.get(previousDateStr) || { clicks: 0, impressions: 0 };

			chartData.push({
				date: formatChartDate(currentDate),
				currentImpressions: Math.round(currentImpressions),
				currentClicks: Math.round(currentClicks),
				previousImpressions: Math.round(previousData.impressions),
				previousClicks: Math.round(previousData.clicks),
			});
		}

		// Cache the result
		if (debug) console.debug('[site-health][searchconsole] caching', cacheKey, 'rows=', chartData.length);
		setCachedData(searchConsoleCache, cacheKey, chartData);

		return { success: true, data: chartData };
	} catch (error) {
		console.error('Google Search Console error:', error);
		const errMessage = (error as any)?.message || String(error);
		// Detect common permission message from Search Console (service account / property access)
		if (errMessage.includes('User does not have sufficient permission') || (error as any)?.code === 403 || (error as any)?.statusCode === 403) {
			return {
				success: false,
				error: 'insufficient_permission',
				code: 403,
				details: errMessage
			};
		}

		return {
			success: false,
			error: errMessage
		};
	}
} 