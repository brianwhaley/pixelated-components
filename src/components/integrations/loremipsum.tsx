"use client";

import React, { useEffect, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { usePixelatedConfig } from '../config/config.client';
import { smartFetch } from '../general/smartfetch';
import { buildUrl } from '../general/urlbuilder';

const debug = false; 

/**
 * LoremIpsum — Fetch and render placeholder paragraphs via an external API (with optional proxy fallback).
 *
 * @param {number} [props.paragraphs] - Number of paragraphs to fetch.
 * @param {string} [props.seed] - Optional seed to generate deterministic content.
 * @param {string} [props.proxyBase] - Optional proxy base URL to use when direct fetch fails due to CORS.
 * @param {string} [props.className] - CSS class name(s) applied to the wrapper element.
 */
LoremIpsum.propTypes = {
/** Paragraph count to request */
	paragraphs: PropTypes.number,
	/** Optional deterministic seed for content */
	seed: PropTypes.string,
	/** Proxy base URL used as a fallback */
	proxyBase: PropTypes.string,
	/** Wrapper CSS class name */
	className: PropTypes.string,
};
export type LoremIpsumType = InferProps<typeof LoremIpsum.propTypes> & { proxyBase?: string };
export function LoremIpsum({ paragraphs = 1, seed = '', proxyBase, className = '' }: LoremIpsumType) {
	const config = usePixelatedConfig();
	// Prefer the global proxy from the app/config provider when present —
	// that ensures Storybook and in-browser environments use the site-wide proxy
	// instead of a per-call `proxyBase` (per user request).
	const resolvedProxy = config?.global?.proxyUrl || proxyBase || undefined;

	const [items, setItems] = useState<string[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const apiUrl = new URL('https://lorem-api.com/api/lorem');
		apiUrl.searchParams.set('paragraphs', String(paragraphs));
		if (seed) apiUrl.searchParams.set('seed', String(seed));

		(async () => {
			setItems(null);
			setError(null);
			try {
				// Fetch with proxy fallback support built into smartFetch
				let txt: string;
				try {
					const res = await smartFetch(apiUrl.toString(), {
						responseType: 'text',
						proxy: resolvedProxy ? {
							url: resolvedProxy,
							fallbackOnCors: true
						} : undefined
					});
					txt = res;
					if (debug) console.log('LoremIpsum: fetched directly or via proxy', txt);
				} catch (err) {
					// If we have a proxy configured but direct fetch failed, try proxy explicitly
					if (resolvedProxy) {
						const proxied = buildUrl({
							baseUrl: apiUrl.toString(),
							proxyUrl: resolvedProxy,
						});
						txt = await smartFetch(proxied, { responseType: 'text' });
						if (debug) console.log('LoremIpsum: fetched via explicit proxy', txt);
					} else {
						throw err;
					}
				}

				// Attempt to parse JSON; otherwise treat as plaintext.
				try {
					const parsed = JSON.parse(txt);
					if (Array.isArray(parsed)) {
						if (debug) console.log('LoremIpsum: parsed array', parsed);
						const newItems = parsed.map(String);
						if (debug) console.log('LoremIpsum: setting items', newItems);
						setItems(newItems);
						return;
					}
					// JSON string literal containing paragraphs -> split
					if (typeof parsed === 'string') {
						if (debug) console.log('LoremIpsum: parsed json string', parsed);
						const newItems = parsed.split(/\n+/).map((s) => s.trim()).filter(Boolean);
						if (debug) console.log('LoremIpsum: setting items', newItems);
						setItems(newItems);
						return;
					}
					if (parsed && Array.isArray((parsed as any).paragraphs)) {
						if (debug) console.log('LoremIpsum: parsed object with paragraphs', parsed);
						const newItems = (parsed as any).paragraphs.map(String);
						if (debug) console.log('LoremIpsum: setting items', newItems);
						setItems(newItems);
						return;
					}
					// object with `text` property
					if (parsed && typeof (parsed as any).text === 'string') {
						if (debug) console.log('LoremIpsum: parsed object with text property', parsed);
						const newItems = (parsed as any).text.split(/\n+/).map((s: string) => s.trim()).filter(Boolean);
						if (debug) console.log('LoremIpsum: setting items', newItems);
						setItems(newItems);
						return;
					}
					// fallback: stringify into single paragraph
					setItems([String(parsed)]);
				} catch (_) {
					if (debug) console.log('LoremIpsum: parsed plaintext', txt);
					const newItems = txt.split(/\n+/).map((s) => s.trim()).filter(Boolean);
					if (debug) console.log('LoremIpsum: setting items', newItems);
					setItems(newItems);
					return;
				}
			} catch (err: any) {
				setError(err?.message ?? 'Unable to load placeholder text.');
			}
		})();
	}, [paragraphs, seed, resolvedProxy]);

	if (error) return <div className={`loremipsum ${className}`} aria-live="polite">{error}</div>;
	if (!items) return <div className={`loremipsum ${className}`}>Loading…</div>;

	return (
		<div className={`loremipsum ${className}`}>
			{items.map((p, i) => (
				<p key={i}>{p}</p>
			))}
		</div>
	);
}
