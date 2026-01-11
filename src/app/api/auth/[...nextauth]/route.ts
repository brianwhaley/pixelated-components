import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

type AuthRouteContext = { params: Promise<{ nextauth: string[] }> };

const handler = NextAuth(authOptions);

async function authHandler(req: NextRequest, context: AuthRouteContext) {
	const callbackUrl = canonicalCallback(req);
	const response = await handler(req as any, context as any);
	if (callbackUrl) {
		const rewritten = rewriteRedirectLocation(response, callbackUrl);
		if (rewritten) return rewritten;
	}
	return response;
}

function getRequestOrigin(req: Request): string | undefined {
	const candidate = req.headers.get('x-origin') ?? req.headers.get('origin') ?? req.headers.get('x-url');
	if (candidate) {
		try {
			return new URL(candidate).origin;
		} catch {
			try {
				const fallback = candidate.split('?')[0].split('#')[0];
				if (/^[a-z]+:\/\//i.test(fallback)) {
					return new URL(fallback).origin;
				}
			} catch {
				/* ignore */
			}
		}
	}
	const hostHeader = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
	if (hostHeader) {
		const first = hostHeader.split(',')[0].trim();
		if (first) {
			const hostname = first.split(':')[0];
			if (hostname) {
				const proto = req.headers.get('x-forwarded-proto') ?? 'https';
				return `${proto}://${hostname}`;
			}
		}
	}
	return undefined;
}

function normalizeUrl(value?: string): string | undefined {
	if (!value) return undefined;
	return value.replace(/\/$/, '');
}
function canonicalCallback(req: Request): string | undefined {
	const base = normalizeUrl(process.env.NEXTAUTH_URL);
	if (base) return `${base}/api/auth/callback/google`;
	const origin = getRequestOrigin(req);
	if (!origin) return undefined;
	return `${normalizeUrl(origin)}/api/auth/callback/google`;
}

function replaceRedirectUri(location: string, callbackUrl: string): string | null {
	try {
		const locUrl = new URL(location);
		locUrl.searchParams.set('redirect_uri', callbackUrl);
		return locUrl.toString();
	} catch {
		return null;
	}
}

function rewriteRedirectLocation(response: Response, callbackUrl: string): Response | null {
	const location = response.headers.get('location') ?? response.headers.get('Location');
	if (!location || !location.includes('redirect_uri=')) return null;
	const updated = replaceRedirectUri(location, callbackUrl);
	if (!updated || updated === location) return null;
	const headers = new Headers(response.headers);
	headers.set('Location', updated);
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

export { authHandler as GET, authHandler as POST };
