 

import { handlePixelatedProxy } from "@pixelated-tech/components/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
	return handlePixelatedProxy(req);
}

// Limit middleware to page routes (avoid _next static, api, etc.)
export const config = {
	matcher: ["/((?!_next/image|_next/static|api|favicon.ico).*)"],
};
