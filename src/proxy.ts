/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
	const path = req.nextUrl.pathname + (req.nextUrl.search || "");
	const origin = (req.nextUrl as any)?.origin ?? new URL(req.url).origin;
	const url = (req.nextUrl as any)?.href ?? req.url ?? `${origin}${path}`;
	const headers = new Headers(req.headers);
	headers.set("x-path", path);
	headers.set("x-origin", String(origin));
	headers.set("x-url", String(url));
	return NextResponse.next({
		request: {
			headers,
		},
	});
}

// Limit middleware to page routes (avoid _next static, api, etc.)
export const config = {
	matcher: ["/((?!_next/image|_next/static|api|favicon.ico).*)"],
};
