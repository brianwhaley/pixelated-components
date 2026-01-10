import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * handlePixelatedProxy
 *
 * A centralized middleware handler for all Pixelated Technology sites.
 * Manages standard headers (x-path, x-url) and enforces a robust Security Policy.
 *
 * TODO: Future enhancement - Accept an options object to allow per-site CSP overrides,
 * enabling/disabling specific permissions (e.g., camera access), or setting custom rate limits.
 */

/**
 * STANDARD_PROXY_MATCHER
 *
 * A statically analyzable matcher array for Next.js middleware.
 * Excludes static assets, images, API routes, and favicons from proxy processing.
 */
export const STANDARD_PROXY_MATCHER = ["/((?!_next/image|_next/static|api|favicon.ico).*)"];

export function handlePixelatedProxy(req: NextRequest) {
	const path = req.nextUrl.pathname + (req.nextUrl.search || "");
	const origin = (req.nextUrl as any)?.origin ?? new URL(req.url).origin;
	const url = (req.nextUrl as any)?.href ?? req.url ?? `${origin}${path}`;

	const requestHeaders = new Headers(req.headers);
	requestHeaders.set("x-path", path);
	requestHeaders.set("x-origin", String(origin));
	requestHeaders.set("x-url", String(url));

	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});

	// --- Security Headers ---

	// HSTS: Force HTTPS for 1 year
	response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

	// Clickjacking Protection
	response.headers.set("X-Frame-Options", "DENY");

	// MIME-Sniffing Protection
	response.headers.set("X-Content-Type-Options", "nosniff");

	// Referrer Policy
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Permissions Policy: Lock down hardware access
	response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

	// Content Security Policy (CSP)
	// Includes all discovered domains in the workspace: HubSpot, Gravatar, Flickr, Contentful, Cloudinary, eBay, and Google Analytics + Search.
	const scriptSrc = "'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://*.googletagmanager.com https://*.hs-scripts.com https://*.hs-analytics.net https://*.hsforms.net https://*.hscollectedforms.net https://*.hs-banner.com https://*.google.com https://*.doubleclick.net https://*.googleadservices.com https://*.adtrafficquality.google https://*.hsappstatic.net https://assets.calendly.com https://cdn.jsdelivr.net";
	const csp = [
		"default-src 'self'",
		`script-src ${scriptSrc}`,
		`script-src-elem ${scriptSrc}`,
		"connect-src 'self' https: https://*.hubspot.com https://proxy.pixelated.tech https://sendmail.pixelated.tech https://*.google-analytics.com https://*.analytics.google.com https://cdn.jsdelivr.net",
		"img-src 'self' data: https: https://*.gravatar.com https://*.staticflickr.com https://*.ctfassets.net https://res.cloudinary.com https://*.ebayimg.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.google.com",
		"font-src 'self' data: https://fonts.gstatic.com",
		"frame-src 'self' https://*.hubspot.com https://*.googletagmanager.com https://*.adtrafficquality.google https://*.google.com https://calendly.com https://*.calendly.com https://*.hsforms.net",
		"frame-ancestors 'none'",
		"object-src 'none'",
	].join("; ");

	response.headers.set("Content-Security-Policy", csp);

	return response;
}
