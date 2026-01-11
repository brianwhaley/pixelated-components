import { describe, it, expect, vi, beforeEach } from 'vitest';

function stubNextAuthResponse(location: string) {
	return {
		default: (_opts: any) => {
			return async () =>
				new Response('', {
					status: 302,
					headers: { Location: location },
				});
		},
	};
}

function makeReq(path: string, headers?: Record<string, string | undefined>) {
	const headerEntries = headers
		? Object.entries(headers).filter(([, value]) => value !== undefined)
		: [];
	return new Request(path, {
		method: 'GET',
		headers: Object.fromEntries(headerEntries) as HeadersInit,
	});
}

function makeContext(nextauth: string[]) {
	return { params: Promise.resolve({ nextauth }) };
}

describe('nextauth/[...nextauth] route', () => {
	beforeEach(() => {
		vi.resetModules();
		delete process.env.NEXTAUTH_URL;
	});

	it('rewrites redirect_uri to the configured callback URL', async () => {
		process.env.NEXTAUTH_URL = 'https://localhost:3006';
		vi.doMock('next-auth', () => stubNextAuthResponse('https://accounts.google.com/o/oauth2/auth?redirect_uri=https%3A%2F%2Ffoo.local%2Fcb'));
		const routeModule = await import('@/app/api/auth/[...nextauth]/route');
		const req = makeReq('https://localhost:3006/api/auth/signin/google', { host: 'localhost:3006' });
		const res = await routeModule.GET(req as any, makeContext(['signin', 'google']) as any);
		const location = res.headers.get('Location') ?? res.headers.get('location');
		const parsed = new URL(String(location));
		expect(parsed.searchParams.get('redirect_uri')).toBe('https://localhost:3006/api/auth/callback/google');
	});

	it('rewrites redirect_uri to NEXTAUTH_URL when the env targets the dev host', async () => {
		process.env.NEXTAUTH_URL = 'https://dev.admin.pixelated.tech';
		vi.doMock('next-auth', () => stubNextAuthResponse('https://accounts.google.com/o/oauth2/auth?redirect_uri=https%3A%2F%2Ffoo.local%2Fcb'));
		const routeModule = await import('@/app/api/auth/[...nextauth]/route');
		const req = makeReq('https://dev.admin.pixelated.tech/api/auth/signin/google', { host: 'dev.admin.pixelated.tech' });
		const res = await routeModule.GET(req as any, makeContext(['signin', 'google']) as any);
		const location = res.headers.get('Location') ?? res.headers.get('location');
		const parsed = new URL(String(location));
		expect(parsed.searchParams.get('redirect_uri')).toBe('https://dev.admin.pixelated.tech/api/auth/callback/google');
	});

	it('returns the handler response when no redirect_uri is present', async () => {
		process.env.NEXTAUTH_URL = 'https://admin.pixelated.tech';
		vi.doMock('next-auth', () => ({
			default: () => async () =>
				new Response('ok', { status: 200, headers: { 'Content-Type': 'text/plain' } }),
		}));
		const routeModule = await import('@/app/api/auth/[...nextauth]/route');
		const req = makeReq('https://admin.pixelated.tech/api/auth/session', { host: 'admin.pixelated.tech' });
		const res = await routeModule.GET(req as any, makeContext(['session']) as any);
		expect(await res.text()).toBe('ok');
	});
});
