import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

import {
  safeJSON,
  sanitizeString,
  generateSecurityTxt,
  createWellKnownResponse,
} from '@/components/general/well-known';

import testData from '../test/test-data';

describe('securitytxt (server)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sanitizeString collapses whitespace and trims', () => {
    expect(sanitizeString('  foo   bar \n baz ')).toBe('foo bar baz');
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
  });

  it('safeJSON returns null on missing/invalid file', async () => {
    const v = await safeJSON('/no/such/path.json');
    expect(v).toBeNull();
  });

  it('generateSecurityTxt produces expected body + headers when passed data', async () => {
    const routes = testData.routes || [];
    const siteInfo = testData.siteInfo || { name: 'Test Site', email: 'test@example.com' };

    const { body, headers, etag } = await generateSecurityTxt({ routesJson: { siteInfo, routes } });

    expect(body).toContain('Contact:');
    expect(body).toContain('Expires:');
    expect(headers['Content-Type']).toContain('text/plain');
    expect(typeof etag).toBe('string');
  });

  it('createWellKnownResponse("security") returns 200 and body, and 304 when if-none-match matches', async () => {
    const routes = [{ path: '/a', title: 'A' }];

    const generated = await generateSecurityTxt({ routesJson: { siteInfo: { email: 'security@example.test' }, routes } });

    const req1 = new NextRequest(new URL('https://example.test/.well-known/security.txt'));
    const resp1 = await createWellKnownResponse('security', req1, { routesJson: { siteInfo: { email: 'security@example.test' }, routes } });
    expect(resp1.status).toBe(200);
    const text = await resp1.text();
    expect(text).toBe(generated.body);

    const req2 = new NextRequest(new URL('https://example.test/.well-known/security.txt'), { headers: { 'if-none-match': generated.etag } });
    const resp2 = await createWellKnownResponse('security', req2, { routesJson: { siteInfo: { email: 'security@example.test' }, routes } });
    expect(resp2.status).toBe(304);
  });
});
