import React from 'react';
import { generateGoogleFontsUrl } from './google-fonts';
import { ALL_WEBSAFE_FONTS } from './fonts';
import { assertVisualDesign } from '../../config/config.validators';
import type { VisualDesignType } from './ConfigBuilder';

export function VisualDesignStyles({ visualdesign }: { visualdesign: VisualDesignType }) {
	// Validate visualdesign early so invalid routes.json fails fast
	assertVisualDesign(visualdesign);
	const tokens: Record<string, any> = visualdesign as any;

	const resolveValue = (v: any) => (v && typeof v === 'object' && 'value' in v) ? v.value : v;

	// Check if Google Fonts are being used
	const hasGoogleFonts = () => {
		for (const [key, val] of Object.entries(tokens)) {
			const value = resolveValue(val);
			if ((key === 'header-font' || key === 'body-font') && typeof value === 'string') {
				// Check if the font stack contains non-web-safe fonts
				const fonts = value.split(',').map((f: string) => f.trim().replace(/["']/g, ''));
				for (const font of fonts) {
					if (!ALL_WEBSAFE_FONTS.some(f => f.value === font)) {
						return true;
					}
				}
			}
		}
		return false;
	};

	const varLines: string[] = [];
	// Always include base font sizing first (from pixelated.visualdesign.scss)
	varLines.push(
		'--font-size1-min: 2.00rem;',
		'--font-size1-max: 3.00rem;',
		'--font-size2-min: 1.35rem;',
		'--font-size2-max: 1.75rem;',
		'--font-size3-min: 1.17rem;',
		'--font-size3-max: 1.35rem;',
		'--font-size4-min: 1.00rem;',
		'--font-size4-max: 1.25rem;',
		'--font-size5-min: 0.83rem;',
		'--font-size5-max: 1.00rem;',
		'--font-size6-min: 0.67rem;',
		'--font-size6-max: 0.85rem;',
		'--font-min-screen: 375px;',
		'--font-max-screen: 1440px;'
	);

	for (const [key, val] of Object.entries(tokens)) {
		const value = resolveValue(val);
		if (value === undefined || value === null) continue;

		// Handle font family construction from 3-field structure (legacy)
		if (key.endsWith('-primary')) {
			const baseKey = key.replace('-primary', '');
			const primary = value;
			const fallback = resolveValue((tokens as any)[`${baseKey}-fallback`]);
			const generic = resolveValue((tokens as any)[`${baseKey}-generic`]);

			// Build font stack: "Primary Font", Fallback, generic
			const fontStack = [primary, fallback, generic].filter(Boolean).map(f => `"${f}"`).join(', ');
			varLines.push(`--${baseKey}-family: ${fontStack};`);
		} else if (key === 'header-font' || key === 'body-font') {
			// Handle compound font values (new format)
			varLines.push(`--${key}: ${value};`);
		} else if (!key.endsWith('-fallback') && !key.endsWith('-generic')) {
			// Skip fallback and generic fields as they're handled above
			varLines.push(`--${key}: ${value};`);
		}
	}

	const fontLines: string[] = [];
	// Generate clamp calculations for font sizes
	for (let i = 1; i <= 6; i++) {
		varLines.push(
			`--font-size${i}: clamp(var(--font-size${i}-min), calc(var(--font-size${i}-min) + ((var(--font-size${i}-max) - var(--font-size${i}-min)) * ((100vw - var(--font-min-screen)) / (var(--font-max-screen) - var(--font-min-screen))))), var(--font-size${i}-max));`
		);
	}

	// Generate h1-h6 font-size rules
	for (let i = 1; i <= 6; i++) {
		fontLines.push(`h${i} { font-size: var(--font-size${i}); }`);
	}

	const css = [
		':root {',
		...varLines.map(l => `  ${l}`),
		'}',
		'',
		'/* Base visual design styles */',
		'body {',
		'  background-color: var(--bg-color) !important;',
		'  color: var(--text-color);',
		'  font-family: var(--body-font);',
		'  font-size: var(--font-size4);',
		'}',
		'h1, h2, h3, h4, h5, h6 {',
		'  line-height: 1.1;',
		'  font-family: var(--header-font);',
		'}',
		'html { font-size: 1.0rem; /* 16px; */ }',
		'',
		...fontLines
	].join('\n');

	const googleFontsUsed = hasGoogleFonts();

	return (
		<>
			{googleFontsUsed && (
				<>
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				</>
			)}
			<style dangerouslySetInnerHTML={{ __html: css }} />
		</>
	);
}

/**
 * Component to handle Google Fonts imports - should be used in the document head
 */
export function GoogleFontsImports({ visualdesign }: { visualdesign: VisualDesignType }) {
	const tokens: Record<string, any> = visualdesign as any;

	const fonts: string[] = [];

	// Extract Google font names from the new 3-field font structure
	for (const [key, val] of Object.entries(tokens)) {
		if (key.endsWith('-primary') && typeof val === 'string' && val.trim()) {
			// Only include fonts that are not web-safe (web-safe fonts don't need Google Fonts import)
			if (!ALL_WEBSAFE_FONTS.some(f => f.value === val.trim())) {
				fonts.push(val.trim());
			}
		}
	}

	const googleFontsUrl = generateGoogleFontsUrl(fonts);
	if (!googleFontsUrl) return null;

	return (
		<>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
			<link href={googleFontsUrl} rel="stylesheet" />
		</>
	);
}
