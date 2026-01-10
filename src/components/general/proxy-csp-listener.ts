"use client";

const debug = false;

/**
 * attachProxyCspListener
 * Client-side helper that attaches a `securitypolicyviolation` listener and forwards
 * the violation info to a provided handler (defaults to console.warn).
 */
export type CspInfo = {
	blockedURI?: string;
	violatedDirective?: string;
	originalPolicy?: string;
	sourceFile?: string;
	disposition?: string;
	referrer?: string;
};

export function attachProxyCspListener(onCsp?: (info: CspInfo) => void) {
	const handler = (e: SecurityPolicyViolationEvent) => {
		const info: CspInfo = {
			blockedURI: e.blockedURI,
			violatedDirective: e.violatedDirective,
			originalPolicy: e.originalPolicy,
			sourceFile: e?.sourceFile,
			disposition: e.disposition,
			referrer: e.referrer,
		};

		const defaultHandler = (i: CspInfo) => { if (debug) console.warn('CSP violation', i); };
		(onCsp ?? defaultHandler)(info);
	};

	window.addEventListener('securitypolicyviolation', handler as EventListener);

	// Return a cleanup function so callers can detach the listener
	return () => window.removeEventListener('securitypolicyviolation', handler as EventListener);
}

