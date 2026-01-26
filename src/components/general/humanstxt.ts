import { readFile } from 'fs/promises';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { flattenRoutes } from './sitemap';

/**
 * Read JSON from disk safely — returns null on error.
 * Exported for testing.
 */
export async function safeJSON(path: string) {
	try {
		const raw = await readFile(path, 'utf8');
		return JSON.parse(raw);
	} catch {
		return null;
	}
}

/**
 * Normalize a value into a single-line trimmed string (safe for humans.txt).
 * Exported for testing.
 */
export function sanitizeString(v: unknown) {
	return v == null ? '' : String(v).replace(/\s+/g, ' ').trim();
}

export type GenerateHumansOpts = {
  /** base directory to read package.json / routes.json from (defaults to process.cwd()) */
  cwd?: string;
  /** optional package.json object (if provided, fs is not used) */
  pkg?: Record<string, any> | null;
  /** optional routes.json object (if provided, fs is not used) */
  routesJson?: any;
  /** limit how many routes to include (default 50) */
  maxRoutes?: number;
};

/**
 * Generate the humans.txt body + metadata. Pure function when pkg/routesJson are provided —
 * otherwise will attempt to read from disk (runtime apps).
 */
export async function generateHumansTxt(opts: GenerateHumansOpts = {}) {
	const cwd = opts.cwd ?? process.cwd();
	const pkg = opts.pkg ?? (await safeJSON(cwd + '/package.json')) ?? {};
	const data = opts.routesJson ?? (await safeJSON(cwd + '/src/app/data/routes.json')) ?? {};
	const site = data.siteInfo ?? {};
	const routes = Array.isArray(data.routes) ? data.routes : [];

	const lines: string[] = [
		'/* HUMAN-READABLE SITE INFORMATION - generated at runtime */',
		'',
		`   Site name: ${sanitizeString(site.name ?? '')}`,
		`   Site Package Name: ${sanitizeString(pkg.name ?? '')}`,
		`   Site Package Version: ${sanitizeString(pkg.version ?? '')}`,
		`   Site URL: ${sanitizeString(site.url ?? '')}`,
		`   Author: ${sanitizeString(site.author ?? '')}`,
		`   Address: ${sanitizeString(
			site.address
				? [
					site.address.streetAddress,
					site.address.addressLocality,
					site.address.addressRegion,
					site.address.postalCode,
					site.address.addressCountry,
				]
					.filter(Boolean)
					.join(' ')
				: ''
		)}`,
		`   Email: ${sanitizeString(site.email ?? '')}`,
		`   Telephone: ${sanitizeString(site.telephone ?? '')}`,
		`   Pages: (${routes.length})`,
	];

	const limit = typeof opts.maxRoutes === 'number' ? opts.maxRoutes : 50;
	for (const r of flattenRoutes(routes).slice(0, limit)) {
		lines.push(`      - ${sanitizeString(r.path ?? r.pathname ?? r.url ?? '')} - ${sanitizeString(r.title ?? '')}`);
	}

	const body = lines.join('\n');
	const etag = crypto.createHash('sha1').update(body).digest('hex');
	const headers = {
		'Content-Type': 'text/plain; charset=utf-8',
		'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
		ETag: etag,
	} as Record<string, string>;

	return { body, etag, headers };
}

/**
 * Next.js convenience: return a NextResponse for a humans.txt request.
 * Accepts the same options as `generateHumansTxt` (pass `pkg`/`routesJson` in tests).
 */
export async function createHumansTxtResponse(req?: NextRequest, opts: GenerateHumansOpts = {}) {
	const { body, etag, headers } = await generateHumansTxt(opts);
	if (req?.headers?.get && req.headers.get('if-none-match') === etag) {
		return new NextResponse(null, { status: 304, headers });
	}
	return new NextResponse(body, { status: 200, headers });
}
