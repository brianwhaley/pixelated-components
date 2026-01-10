/**
 * Google Fonts Integration
 * Fetches and caches Google Fonts data for use in visual design forms
 */

import { getFullPixelatedConfig } from '../../config/config';

export interface GoogleFont {
  family: string;
  variants: string[];
  subsets: string[];
  version: string;
  lastModified: string;
  category: string;
  kind: string;
  menu: string;
  files: Record<string, string>;
}

export interface GoogleFontsResponse {
  kind: string;
  items: GoogleFont[];
}

// Cache for Google Fonts data
let fontsCache: GoogleFont[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Fallback Google fonts for when API is unavailable (sorted alphabetically)
const FALLBACK_GOOGLE_FONTS: GoogleFont[] = [
	{ family: 'Cairo', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Crimson Text', category: 'serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Fira Sans', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Inter', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Lato', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Libre Baskerville', category: 'serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Lora', category: 'serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Merriweather', category: 'serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Montserrat', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Nunito', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Open Sans', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Oswald', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Playfair Display', category: 'serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Poppins', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'PT Sans', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Raleway', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Roboto', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Source Sans Pro', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Ubuntu', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
	{ family: 'Work Sans', category: 'sans-serif', variants: [], subsets: [], version: '', lastModified: '', kind: '', menu: '', files: {} },
];

/**
 * Fetch Google Fonts list from API
 * Reads API key from `pixelated.config.json` under `google.api_key` (server-side)
 */
export async function fetchGoogleFonts(): Promise<GoogleFont[]> {
	// Check cache first
	if (fontsCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
		return fontsCache;
	}

	const cfg = getFullPixelatedConfig();
	const apiKey = cfg?.google?.api_key;
	if (!apiKey) {
		console.warn('google.api_key not set in pixelated.config.json; returning empty fonts list');
		return [];
	}

	try {
		const response = await fetch(
			`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
		);

		if (!response.ok) {
			throw new Error(`Google Fonts API error: ${response.status}`);
		}

		const data: GoogleFontsResponse = await response.json();

		// Cache the results
		fontsCache = data.items;
		cacheTimestamp = Date.now();

		return data.items;
	} catch (error) {
		console.error('Failed to fetch Google Fonts:', error);
		return [];
	}
}

/**
 * Get font options for form dropdowns
 */
export async function getFontOptions(): Promise<Array<{value: string, label: string, category: string}>> {
	const fonts = await fetchGoogleFonts();

	// If no fonts loaded from API, use fallback popular fonts
	if (!fonts || fonts.length === 0) {
		return FALLBACK_GOOGLE_FONTS
			.sort((a: GoogleFont, b: GoogleFont) => a.family.localeCompare(b.family))
			.map((font: GoogleFont) => ({
				value: font.family,
				label: `${font.family} (${font.category})`,
				category: font.category
			}));
	}

	return fonts
		.sort((a: GoogleFont, b: GoogleFont) => a.family.localeCompare(b.family))
		.map((font: GoogleFont) => ({
			value: font.family,
			label: `${font.family} (${font.category})`,
			category: font.category
		}));
}

/**
 * Generate Google Fonts CSS import URL for given fonts
 */
export function generateGoogleFontsUrl(fonts: string[]): string {
	if (!fonts.length) return '';

	// Clean font names and create URL
	const cleanFonts = fonts
		.map(font => font.replace(/['"]/g, '').trim())
		.filter(font => font.length > 0);

	if (!cleanFonts.length) return '';

	const fontParam = cleanFonts
		.map(font => font.replace(/\s+/g, '+'))
		.join('|');

	return `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
}

/**
 * Generate HTML link tag for Google Fonts
 */
export function generateGoogleFontsLink(fonts: string[]): string {
	const url = generateGoogleFontsUrl(fonts);
	if (!url) return '';

	return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${url}" rel="stylesheet">`;
}