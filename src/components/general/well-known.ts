import PropTypes, { InferProps } from 'prop-types';
import { readFile } from 'fs/promises';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { flattenRoutes } from './sitemap';

/**
 * Read JSON from disk safely — returns null on error. Exported for testing.
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
 * Normalize a value into a single-line trimmed string (safe for humans.txt / security.txt).
 * Exported for testing.
 */
export function sanitizeString(v: unknown) {
	return v == null ? '' : String(v).replace(/\s+/g, ' ').trim();
}

/**
 * Build a plain-text response payload including ETag and standard headers.
 * Exported for testing and reuse across .well-known generators.
 */
export function createTextResponsePayload(body: string) {
	const etag = crypto.createHash('sha1').update(body).digest('hex');
	const headers = {
		'Content-Type': 'text/plain; charset=utf-8',
		'Cache-Control': 'public, max-age=60, stale-while-revalidate=3600',
		ETag: etag,
	} as Record<string, string>;
	return { body, etag, headers };
}

/* ========== HUMANS.TXT ========== */

generateHumansTxt.propTypes = {
	/** base directory to read package.json / routes.json from (defaults to process.cwd()) */
	cwd: PropTypes.string,
	/** optional package.json object (if provided, fs is not used) */
	pkg: PropTypes.object,
	/** optional routes.json object (if provided, fs is not used) */
	routesJson: PropTypes.object,
	/** limit how many routes to include (default 50) */
	maxRoutes: PropTypes.number,
};
export type GenerateHumansTxtType = InferProps<typeof generateHumansTxt.propTypes>;
export async function generateHumansTxt(opts: GenerateHumansTxtType = {}) {
	const cwd = opts.cwd ?? process.cwd();
	const pkg = opts.pkg ?? (await safeJSON(cwd + '/package.json')) ?? {};
	const data = opts.routesJson ?? (await safeJSON(cwd + '/src/app/data/routes.json')) ?? {};
	const site = data.siteInfo ?? {};
	const routes = Array.isArray(data.routes) ? data.routes : [];

	const lines: string[] = [
		'/* HUMAN-READABLE SITE INFORMATION - generated at runtime */',
		'',
		'/* AUTHOR */',
		`   Author Name: ${sanitizeString(site.author ?? '')}`,
		`   Author Address: ${sanitizeString(
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
		`   Author Email: ${sanitizeString(site.email ?? '')}`,
		`   Author Telephone: ${sanitizeString(site.telephone ?? '')}`,

		'',
		'/* DEVELOPER */',
		`   Developer Name: Brian Whaley`,
		`   Developer Company: Pixelated Technologies LLC`,
		`   Developer Address: 10 Jade Circle, Denville NJ 07834 USA`,
		`   Developer Email: brian@pixelated.tech`,
		`   Developer Website: https://www.pixelated.tech`,
		`   Developer Telephone: +1 (973) 722-2601`,
		'',
		'/* SITE */',
		`   Site Name: ${sanitizeString(site.name ?? '')}`,
		`   Site Package Name: ${sanitizeString(pkg.name ?? '')}`,
		`   Site Package Version: ${sanitizeString(pkg.version ?? '')}`,
		`   Site URL: ${sanitizeString(site.url ?? '')}`,
		`   Site Languages: React, Node, NextJS, JavaScript, HTML5, CSS3, SASS `,
		`   Site Tools: VSCode, GitHub, AWS, Contently, Cloudinary, Wordpress, Google Analytics, Google Search Console`,
		`   Site Pages: (${routes.length})`,
	];

	const limit = typeof opts.maxRoutes === 'number' ? opts.maxRoutes : 50;
	for (const r of flattenRoutes(routes).slice(0, limit)) {
		lines.push(`      - ${sanitizeString(r.path ?? r.pathname ?? r.url ?? '')} - ${sanitizeString(r.title ?? '')}`);
	}

	const body = lines.join('\n');
	return createTextResponsePayload(body);
}



/* ========== SECURITY.TXT ========== */

generateSecurityTxt.propTypes = {
	routesJson: PropTypes.object,
};
export type GenerateSecurityTxtType = InferProps<typeof generateSecurityTxt.propTypes>;
export async function generateSecurityTxt(props: GenerateSecurityTxtType = {}) {
	const data = props.routesJson ?? (await safeJSON(process.cwd() + '/src/app/data/routes.json')) ?? {};
	const siteInfo = data.siteInfo ?? {};

	const lines: string[] = [
		'# Contact methods for security researchers',
		`Contact: mailto:${sanitizeString(siteInfo.email ?? '')}`,
		'',
		"# Link to your vulnerability disclosure policy",
		'Policy: ',
		'',
		"# Link to your PGP public key for encrypted communication",
		'Encryption: ',
		'',
		"# Languages supported",
		'Preferred-Languages: en',
		'',
		"# Date and time the file should be considered stale",
		`Expires: ${new Date(new Date().getFullYear(), 11, 31).toISOString()}`,
	];
	const body = lines.join('\n');
	return createTextResponsePayload(body);
}



/* ========== Convenience helper ========== */
/**
 * Create a response for a well-known resource.
 * @param {'humans'|'security'} type - Which resource to generate ('humans' | 'security').
 */
export async function createWellKnownResponse(type: 'humans' | 'security', req?: NextRequest, opts: any = {}) {
	const payload = (type === 'humans') ? await generateHumansTxt(opts) : await generateSecurityTxt(opts);
	const { body, etag, headers } = payload;
	if (req?.headers?.get && req.headers.get('if-none-match') === etag) {
		return new NextResponse(null, { status: 304, headers });
	}
	return new NextResponse(body, { status: 200, headers });
}
