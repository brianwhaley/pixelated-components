"use server";

import { RouteType, SiteInfoType } from '../sitebuilder/config/ConfigBuilder';

// Debug logging: set to true to inspect raw Gemini API responses locally
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

/**
 * Parse the response from Google Gemini API
 */
function parseGeminiResponse(data: any): GeminiRecommendationResponse {
	try {
		if (debug) console.log('Gemini API raw response:', JSON.stringify(data, null, 2));
    
		// Check if we have candidates
		if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
			throw new Error('No candidates in Gemini API response');
		}

		const candidate = data.candidates[0];
    
		// Check if response was truncated due to token limits
		if (candidate.finishReason === 'MAX_TOKENS') {
			throw new Error('AI response was truncated due to token limits. Please try again or use a shorter prompt.');
		}
    
		if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
			throw new Error('No content parts in Gemini API response');
		}

		const text = candidate.content.parts[0].text;
		if (debug) console.log('Gemini API response text:', text);
    
		if (!text) {
			throw new Error('No text content in Gemini API response');
		}

		// Remove markdown code block markers if present
		let jsonText = text.trim();
		if (jsonText.startsWith('```json')) {
			jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
		} else if (jsonText.startsWith('```')) {
			jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
		}
    
		if (debug) console.log('Cleaned JSON text:', jsonText);

		// The text should be JSON, try to parse it
		const parsedResponse = JSON.parse(jsonText);
		if (debug) console.log('Parsed JSON response:', parsedResponse);
    
		// Validate the expected structure
		if (typeof parsedResponse !== 'object' || parsedResponse === null) {
			throw new Error('Parsed response is not a valid object');
		}

		return {
			title: parsedResponse.title || undefined,
			keywords: Array.isArray(parsedResponse.keywords) ? parsedResponse.keywords : undefined,
			description: parsedResponse.description || undefined
		};

	} catch (error) {
		console.error('Error parsing Gemini API response:', error);
		console.error('Raw response data:', JSON.stringify(data, null, 2));
		throw new Error('Failed to parse AI recommendations');
	}
}
function buildRecommendationPrompt(request: GeminiRecommendationRequest): string {
	const { route, siteInfo } = request;

	// Extract location information
	const address = siteInfo.address;
	const locationInfo = address ? 
		`${address.addressLocality || ''}, ${address.addressRegion || ''} ${address.postalCode || ''}`.trim() : 
		'';

	return `Generate SEO recommendations as JSON:

Business: ${siteInfo.name || 'Unknown'} - ${siteInfo.description || 'Not provided'}
${locationInfo ? `Location: ${locationInfo}` : ''}
Route: ${route.name || route.path || '/'}
Current: Title="${route.title || ''}", Keywords="${Array.isArray(route.keywords) ? route.keywords.join(', ') : route.keywords || ''}", Description="${route.description || ''}"

Return only this JSON:
{
  "title": "50-60 char optimized title",
  "keywords": ["relevant", "keywords", "for", "this", "page", "including", "location-based", "terms"],
  "description": "150-160 char meta description including location when relevant"
}`;
}

/**
 * Parse the PaLM API response and extract recommendations
 */
function parsePaLMResponse(data: any): GeminiRecommendationResponse {
	try {
		// Try Gemini API format first
		let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
		// Fallback to PaLM format
		if (!text) {
			text = data.candidates?.[0]?.output;
		}
    
		if (!text) {
			throw new Error('No response text from AI API');
		}

		// Try to parse JSON from the response
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('No JSON found in AI response');
		}

		const parsed = JSON.parse(jsonMatch[0]);

		return {
			title: parsed.title,
			keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
			description: parsed.description
		};

	} catch (error) {
		console.error('Error parsing AI response:', error);
		return {
			error: 'Failed to parse AI recommendations'
		};
	}
}

/**
 * Infer business type from site information
 */
function inferBusinessType(siteInfo: SiteInfoType): string {
	// Simple inference based on description keywords
	const description = (siteInfo.description || '').toLowerCase();

	if (description.includes('restaurant') || description.includes('food')) return 'restaurant';
	if (description.includes('real estate') || description.includes('property')) return 'real estate';
	if (description.includes('law') || description.includes('legal')) return 'legal services';
	if (description.includes('medical') || description.includes('health')) return 'healthcare';
	if (description.includes('consulting') || description.includes('consultant')) return 'consulting';
	if (description.includes('retail') || description.includes('store')) return 'retail';

	return 'general business';
}

/**
 * Generate AI recommendations for SEO using Google Gemini API
 */
export async function generateAiRecommendations(
	request: GeminiRecommendationRequest,
	apiKey: string
): Promise<GeminiRecommendationResponse> {
	try {
		// Build the prompt using the shared function
		const prompt = buildRecommendationPrompt(request);

		// Make request to Google Gemini API
		const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: [{
					parts: [{
						text: prompt
					}]
				}],
				generationConfig: {
					temperature: 0.7,
					maxOutputTokens: 4096,
					topP: 0.95,
					topK: 40
				}
			})
		});

		if (!response.ok) {
			console.error('Google API Response Status:', response.status);
			console.error('Google API Response Status Text:', response.statusText);
      
			// Try to get the response body for debugging
			try {
				const errorBody = await response.text();
				console.error('Google API Error Response Body:', errorBody);
			} catch (e) {
				console.error('Could not read error response body');
			}
      
			if (response.status === 429) {
				// Check if it's quota exceeded vs rate limit
				if (response.statusText === 'Too Many Requests') {
					// This might be quota exceeded, not just rate limit
					throw new Error('AI API quota exceeded. Please check your Google AI Studio billing settings and enable billing.');
				}
				throw new Error('AI API rate limit exceeded. Please try again later.');
			}
			throw new Error(`AI API error: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();
		// Parse the Gemini API response
		return parseGeminiResponse(data);

	} catch (error) {
		console.error('AI API error:', error);
		return {
			error: error instanceof Error ? error.message : 'Unknown error occurred'
		};
	}
}