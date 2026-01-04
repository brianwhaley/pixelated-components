import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting (use Redis/external service in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per window
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return false;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return true;
  }

  userLimit.count++;
  return false;
}

export function proxy(req: NextRequest) {
	const path = req.nextUrl.pathname + (req.nextUrl.search || "");
	const origin = (req.nextUrl as any)?.origin ?? new URL(req.url).origin;
	const url = (req.nextUrl as any)?.href ?? req.url ?? `${origin}${path}`;
	const headers = new Headers(req.headers);
	headers.set("x-path", path);
	headers.set("x-origin", String(origin));
	headers.set("x-url", String(url));

	// Check if running on localhost - redirect to home if not
	const hostname = req.headers.get('host')?.split(':')[0];
	if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
		return NextResponse.redirect(new URL('/', req.url));
	}

	// Rate limiting for auth endpoints
	if (req.nextUrl.pathname === '/api/auth/signin/google' || req.nextUrl.pathname === '/login') {
		const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';

		if (isRateLimited(ip)) {
			return new NextResponse('Too many requests', {
				status: 429,
				headers: {
					'Retry-After': '900', // 15 minutes
				},
			});
		}
	}

	// Additional security headers
	const response = NextResponse.next({
		request: {
			headers,
		},
	});

	// Add HSTS in production
	if (process.env.NODE_ENV === 'production') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	return response;
}

// Limit proxy to page routes (avoid _next static, api, etc.)
export const config = {
	matcher: ["/((?!_next/image|_next/static|api|favicon.ico).*)"],
};
