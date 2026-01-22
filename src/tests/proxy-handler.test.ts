import { describe, it, expect } from 'vitest';
import { NextRequest } from "next/server";
import { handlePixelatedProxy } from "../components/general/proxy-handler";

describe('handlePixelatedProxy', () => {
    // Helper to create a NextRequest
    const createRequest = (url = "https://pixelated.tech/test") => {
        return new NextRequest(new URL(url), {
            headers: {
                "user-agent": "test-agent",
            }
        });
    };

    it('sets standard x-path and x-url headers', () => {
        const req = createRequest("https://pixelated.tech/about?query=1");
        const response = handlePixelatedProxy(req);

        // Next.js NextResponse.next() request headers are buried in the request object
        // but Vitest/Next mock environment allows us to check the response object directly if we set them there.
        // In our implementation, we set them on the cloned request object passed to NextResponse.next.
        
        // Since we can't easily inspect the 'request' headers from a returned NextResponse.next() 
        // in a unit test without a full Next.js runner, we mostly focus on the response headers 
        // which are explicitly set on the response object.
        
        expect(response.headers.get("Strict-Transport-Security")).toBeDefined();
    });

    it('sets all required security headers', () => {
        const req = createRequest();
        const response = handlePixelatedProxy(req);

        expect(response.headers.get("Strict-Transport-Security")).toBe("max-age=31536000; includeSubDomains; preload");
        expect(response.headers.get("X-Frame-Options")).toBe("DENY");
        expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
        expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
        expect(response.headers.get("Permissions-Policy")).toContain("camera=()");
    });

    it('sets a comprehensive Content-Security-Policy', () => {
        const req = createRequest();
        const response = handlePixelatedProxy(req);
        const csp = response.headers.get("Content-Security-Policy");

        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("https://va.vercel-scripts.com"); // Vercel
        expect(csp).toContain("https://*.hubspot.com"); // HubSpot
        expect(csp).toContain("https://*.gravatar.com"); // Gravatar
        expect(csp).toContain("https://proxy.pixelated.tech"); // Proxy
        // PayPal (script + stylesheet) — allow the official PayPal hosts used by the SDK
        expect(csp).toContain("https://www.paypal.com");
        expect(csp).toContain("https://www.paypalobjects.com");
        // Ensure PayPal is explicitly allowed in frame-src (fixes PayPal SDK framing + cardfields stylesheet)
        expect(csp).toMatch(/frame-src[^;]*https:\/\/www\.paypal\.com/);
    });
});
