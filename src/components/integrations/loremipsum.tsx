"use client";

import React, { useEffect, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { usePixelatedConfig } from '../config/config.client';

const debug = false; 

LoremIpsum.propTypes = {
	paragraphs: PropTypes.number,
	seed: PropTypes.string,
	proxyBase: PropTypes.string,
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
		const controller = new AbortController();
		const apiUrl = new URL('https://lorem-api.com/api/lorem');
		apiUrl.searchParams.set('paragraphs', String(paragraphs));
		if (seed) apiUrl.searchParams.set('seed', String(seed));

		const tryFetch = async (url: string) => {
			const res = await fetch(url, { signal: controller.signal });
			if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
			return res;
		};

		(async () => {
			setItems(null);
			setError(null);
			try {
				// First attempt: direct fetch
				let res;
				try {
					res = await tryFetch(apiUrl.toString());
					if (debug) console.log('LoremIpsum: fetched directly', res);
				} catch (err) {
					// If CORS/network error and we have a proxy, retry via proxy
					if (resolvedProxy) {
						const proxied = `${resolvedProxy}${encodeURIComponent(apiUrl.toString())}`;
						res = await tryFetch(proxied);
						if (debug) console.log('LoremIpsum: fetched via proxy', res);
					} else {
						throw err;
					}
				}

				// Read response as text to avoid "body stream already read" errors,
				// then attempt to parse JSON; otherwise treat as plaintext.
				const txt = await res.text();
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
				if (err?.name === 'AbortError') return;
				setError(err?.message ?? 'Unable to load placeholder text.');
			}
		})();

		return () => controller.abort();
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
