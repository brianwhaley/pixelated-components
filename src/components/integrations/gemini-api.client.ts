'use client';

import { RouteType, SiteInfoType } from '../sitebuilder/config/ConfigBuilder';

// Debug logging: set to true to inspect AI model responses locally
const debug = false;


import { smartFetch } from '../foundation/smartfetch';
import { buildUrl } from '../foundation/urlbuilder';

export interface GeminiRecommendationRequest {
  route: RouteType;
  siteInfo: SiteInfoType;
  baseUrl?: string;
}

export interface GeminiRecommendationResponse {
  title?: string;
  keywords?: string[];
  description?: string;
  error?: string;
}

export interface GeminiApiResponse {
  success: boolean;
  data?: GeminiRecommendationResponse;
  error?: string;
}

/**
 * Service for integrating with Google Gemini API for SEO recommendations
 */
export class GeminiApiService {
	private apiKey: string;
	private baseUrl: string;

	constructor(apiKey: string, baseUrl = 'https://generativelanguage.googleapis.com') {
		this.apiKey = apiKey;
		this.baseUrl = baseUrl;
	}

	/**
   * Generate SEO recommendations for a route
   */
	async generateRouteRecommendations(request: GeminiRecommendationRequest): Promise<GeminiApiResponse> {
		try {
			// Use the proxy API route instead of direct Google API call
			const data = await smartFetch('/api/ai/recommendations', {
				requestInit: {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(request)
				}
			});

			if (!data.success) {
				throw new Error(data.error || 'AI API request failed');
			}

			return {
				success: true,
				data: data.data
			};

		} catch (error) {
			console.error('AI API error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}

	/**
   * List available models to debug API issues
   */
	async listModels(): Promise<any> {
		try {
			const url = buildUrl({
				baseUrl: this.baseUrl,
				pathSegments: ['v1', 'models'],
				params: { key: this.apiKey },
			});
			const data = await smartFetch(url, {
				requestInit: {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				}
			});

			if (debug) console.log('Available models:', data);
			return data; 
		} catch (error) {
			console.error('Error listing models:', error);
			return null;
		}
	}
}

/**
 * Create a Gemini API service instance
 */
export function createGeminiApiService(apiKey: string): GeminiApiService {
	return new GeminiApiService(apiKey);
}