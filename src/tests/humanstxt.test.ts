import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as fs from 'fs/promises';

import {
  safeJSON,
  sanitizeString,
  generateHumansTxt,
  createHumansTxtResponse,
} from '@/components/general/humanstxt';

describe('humanstxt (server)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sanitizeString collapses whitespace and trims', () => {
    expect(sanitizeString('  foo   bar \n baz ')).toBe('foo bar baz');
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
  });

  it('safeJSON returns null on missing/invalid file', async () => {
    // avoid spying on the ESM fs/promises namespace (not configurable in some runners)
    const v = await safeJSON('/no/such/path.json');
    expect(v).toBeNull();
  });

  it('generateHumansTxt produces expected body + headers when passed data', async () => {
    const pkg = { name: 'acme', version: '9.9.9' };
    const routes = [ { path: '/a', title: 'A' }, { path: '/b', title: 'B' } ];

    const { body, headers, etag } = await generateHumansTxt({ pkg, routesJson: { siteInfo: { name: 'ACME', url: 'https://acme.test', author: 'Jane' }, routes } });

    expect(body).toContain('Site name: ACME');
    expect(body).toContain('/a - A');
    expect(headers['Content-Type']).toContain('text/plain');
    expect(typeof etag).toBe('string');
  });

  it('createHumansTxtResponse returns 200 and body, and 304 when if-none-match matches', async () => {
    const pkg = { name: 'acme', version: '9.9.9' };
    const routes = [ { path: '/a', title: 'A' } ];

    const generated = await generateHumansTxt({ pkg, routesJson: { siteInfo: { name: 'ACME' }, routes } });

    const req1 = new NextRequest(new URL('https://example.test/humans.txt'));
    const resp1 = await createHumansTxtResponse(req1, { pkg, routesJson: { siteInfo: { name: 'ACME' }, routes } });
    expect(resp1.status).toBe(200);
    const text = await resp1.text();
    expect(text).toBe(generated.body);

    const req2 = new NextRequest(new URL('https://example.test/humans.txt'), { headers: { 'if-none-match': generated.etag } });
    const resp2 = await createHumansTxtResponse(req2, { pkg, routesJson: { siteInfo: { name: 'ACME' }, routes } });
    expect(resp2.status).toBe(304);
  });
});
