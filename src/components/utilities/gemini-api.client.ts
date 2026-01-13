'use client';

import { RouteType, SiteInfoType } from '../sitebuilder/config/ConfigBuilder';

// Debug logging: set to true to inspect AI model responses locally
const debug = false;


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
			const response = await fetch('/api/ai/recommendations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(request)
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error('AI API Error Response:', errorText);
				throw new Error(`AI API error: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();

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
			const response = await fetch(`${this.baseUrl}/v1/models?key=${this.apiKey}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to list models: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
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