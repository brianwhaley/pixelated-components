import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use the repository's canonical module-level mock for `googleapis` so constructor
// functions are stubbed before any module that imports them is evaluated.
vi.mock('googleapis', () => ({
	google: {
		auth: { GoogleAuth: vi.fn(), OAuth2: vi.fn() },
		analyticsdata: vi.fn(),
		searchconsole: vi.fn(),
	},
}));

// canonical imports used by other google API tests in this repo
import { google } from 'googleapis';
import * as googleIntegration from '../components/admin/site-health/google.api.integration';
import * as googleUtils from '../components/admin/site-health/google.api.utils';

// These are consumer-focused integration tests that exercise the observable cache
// contract for Google Analytics consumers (uses RouteCache internally).

describe('Site-Health RouteCache — Google Analytics (consumer contract)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // wire canonical google API mocks (same pattern as other tests)
    const mockGoogleAuth = { type: 'service_account' } as any;
    const mockAnalyticsData = { properties: { runReport: vi.fn() } } as any;

    // expose mocks for test-time configuration (matches repo pattern)
    (globalThis as any).__mockGoogleAuth = mockGoogleAuth;
    (globalThis as any).__mockAnalyticsData = mockAnalyticsData;

    (google.auth.GoogleAuth as any).mockImplementation(function () { return mockGoogleAuth; });
    (google.analyticsdata as any).mockImplementation(function () { return mockAnalyticsData; });

    // deterministic date ranges used by the integration logic
    const utils = await vi.importActual('../components/admin/site-health/google.api.utils');
    vi.spyOn(utils as any, 'calculateDateRanges').mockReturnValue({
      currentStart: new Date('2024-01-01'),
      currentEnd: new Date('2024-01-02'),
      previousStart: new Date('2023-12-31'),
      previousEnd: new Date('2024-01-01'),
      currentStartStr: '2024-01-01',
      currentEndStr: '2024-01-02',
      previousStartStr: '2023-12-31',
      previousEndStr: '2024-01-01',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls upstream on first request and returns cached value on immediate retry', async () => {
    const utils = await vi.importActual('../components/admin/site-health/google.api.utils');
    const getCachedSpy = vi.spyOn(utils as any, 'getCachedData').mockImplementation(() => null);
    const setCachedSpy = vi.spyOn(utils as any, 'setCachedData').mockImplementation(() => undefined);

    // prepare two successful runReport responses (current + previous)
    const mockAnalytics = (globalThis as any).__mockAnalyticsData as any;
    mockAnalytics.properties.runReport
      .mockResolvedValueOnce({ data: { rows: [{ dimensionValues: [{ value: '20240101' }], metricValues: [{ value: '100' }] }] } })
      .mockResolvedValueOnce({ data: { rows: [{ dimensionValues: [{ value: '20231231' }], metricValues: [{ value: '80' }] }] } });

    const cfg = { ga4PropertyId: '123', serviceAccountKey: JSON.stringify({ type: 'service_account' }) };

    // first call should invoke upstream and populate cache
    const first = await googleIntegration.getGoogleAnalyticsData(cfg as any, 'example.com');
    // debug output (narrow failure surface if it appears)
    if (!first.success) console.error('DBG analytics first ->', JSON.stringify(first));
    expect(first.success).toBe(true);
    expect(mockAnalytics.properties.runReport).toHaveBeenCalledTimes(2);
    expect(setCachedSpy).toHaveBeenCalled();

    // simulate cache now contains previously returned value
    getCachedSpy.mockImplementation(() => first.data);

    // immediate retry should be served from cache (no additional upstream calls)
    const second = await googleIntegration.getGoogleAnalyticsData(cfg as any, 'example.com');
    expect(mockAnalytics.properties.runReport).toHaveBeenCalledTimes(2);
    expect(second).toEqual(first);
  });

  it('re-calls upstream after simulated cache expiry', async () => {
    const utils = await vi.importActual('../components/admin/site-health/google.api.utils');
    const getCachedSpy = vi.spyOn(utils as any, 'getCachedData').mockImplementation(() => null);
    const setCachedSpy = vi.spyOn(utils as any, 'setCachedData').mockImplementation(() => undefined);

    // ensure we configure the same mock instance the integration will receive
    const mockAnalytics = (globalThis as any).__mockAnalyticsData || ((globalThis as any).__mockAnalyticsData = { properties: { runReport: vi.fn() } });
    // ensure the google mock will return our test instance
    (google.analyticsdata as any).mockImplementation(function () { return mockAnalytics; });

    mockAnalytics.properties.runReport
      .mockResolvedValueOnce({ data: { rows: [{ dimensionValues: [{ value: '20240101' }], metricValues: [{ value: '100' }] }] } })
      .mockResolvedValueOnce({ data: { rows: [{ dimensionValues: [{ value: '20231231' }], metricValues: [{ value: '80' }] }] } })
      // responses for expiry path (clear, obviously different values so chart differs)
      .mockResolvedValueOnce({ data: { rows: [{ dimensionValues: [{ value: '20240102' }], metricValues: [{ value: '200' }] }] } })
      .mockResolvedValueOnce({ data: { rows: [{ dimensionValues: [{ value: '20240101' }], metricValues: [{ value: '180' }] }] } });

    const cfg = { ga4PropertyId: '123', serviceAccountKey: JSON.stringify({ type: 'service_account' }) };

    const first = await googleIntegration.getGoogleAnalyticsData(cfg as any, 'example.com');
    expect(first.success).toBe(true);
    expect(setCachedSpy).toHaveBeenCalledTimes(1);

    // simulate cache hit
    getCachedSpy.mockImplementation(() => first.data);
    const second = await googleIntegration.getGoogleAnalyticsData(cfg as any, 'example.com');
    expect(setCachedSpy).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);

    // simulate expiry -> cache miss
    getCachedSpy.mockImplementation(() => null);
    const third = await googleIntegration.getGoogleAnalyticsData(cfg as any, 'example.com');
    expect(setCachedSpy).toHaveBeenCalledTimes(2);
    expect(third).not.toEqual(first);
  });
});
