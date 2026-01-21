import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Mock the cache and utils
const mockCacheManagerInstance = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock('../components/general/cache-manager', () => {
  const getMock = vi.fn();
  const setMock = vi.fn();
  class MockCacheManager {
    get = getMock;
    set = setMock;
    remove = vi.fn();
    clear = vi.fn();
  }
  // Store references for test access
  (globalThis as any).__mockCacheManager = { get: getMock, set: setMock };
  return {
    CacheManager: MockCacheManager,
  };
});

vi.mock('../components/admin/site-health/google.api.utils', () => ({
  calculateDateRanges: vi.fn(),
  formatChartDate: vi.fn(),
  getCachedData: vi.fn(),
  setCachedData: vi.fn(),
}));

// Mock the googleapis module
vi.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: vi.fn(),
      OAuth2: vi.fn(),
    },
    analyticsdata: vi.fn(),
    searchconsole: vi.fn(),
  },
}));

import { google } from 'googleapis';
import { CacheManager } from '../components/general/cache-manager';
import {
  calculateDateRanges,
  formatChartDate,
  getCachedData,
  setCachedData
} from '../components/admin/site-health/google.api.utils';

import {
  createGoogleAuthClient,
  createAnalyticsClient,
  createSearchConsoleClient,
  getGoogleAnalyticsData,
  getSearchConsoleData,
  type GoogleAuthConfig,
  type GoogleAnalyticsConfig,
  type SearchConsoleConfig,
} from '../components/admin/site-health/google.api.integration';

describe('Google API Integration', () => {
  let mockGoogleAuth: any;
  let mockOAuth2: any;
  let mockAnalyticsData: any;
  let mockSearchConsole: any;
  let mockCacheManager: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup Google API mocks
    mockGoogleAuth = {
      type: 'service_account',
      project_id: 'test-project',
      private_key_id: 'test-key-id',
      private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
      client_email: 'test@test-project.iam.gserviceaccount.com',
      client_id: 'test-client-id',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/test%40test-project.iam.gserviceaccount.com',
    };

    mockOAuth2 = {
      setCredentials: vi.fn(),
      generateAuthUrl: vi.fn(),
      getToken: vi.fn(),
    };

    mockAnalyticsData = {
      properties: {
        runReport: vi.fn(),
      },
    };

    mockSearchConsole = {
      sites: {
        list: vi.fn(),
      },
      searchanalytics: {
        query: vi.fn(),
      },
    };

    // Set global references for mocks
    (globalThis as any).__mockGoogleAuth = mockGoogleAuth;
    (globalThis as any).__mockOAuth2 = mockOAuth2;
    (globalThis as any).__mockAnalyticsData = mockAnalyticsData;
    (globalThis as any).__mockSearchConsole = mockSearchConsole;

    // Set up mock implementations
    (google.auth.GoogleAuth as any).mockImplementation(function() { return mockGoogleAuth; });
    (google.auth.OAuth2 as any).mockImplementation(function() { return mockOAuth2; });
    (google.analyticsdata as any).mockImplementation(function() { return mockAnalyticsData; });
    (google.searchconsole as any).mockImplementation(function() { return mockSearchConsole; });

    // Mock the googleapis constructors are already set up in the module mock
    // (google.auth.GoogleAuth as any).mockImplementation(() => mockGoogleAuth);
    // (google.auth.OAuth2 as any).mockImplementation(() => mockOAuth2);
    // (google.analyticsdata as any).mockImplementation(() => mockAnalyticsData);
    // (google.searchconsole as any).mockImplementation(() => mockSearchConsole);

    // CacheManager is already mocked at module level

    // Mock utility functions
    (calculateDateRanges as Mock).mockReturnValue({
      currentStart: new Date('2024-01-01'),
      currentEnd: new Date('2024-01-15'),
      previousStart: new Date('2023-12-18'),
      previousEnd: new Date('2023-12-31'),
      currentStartStr: '2024-01-01',
      currentEndStr: '2024-01-15',
      previousStartStr: '2023-12-18',
      previousEndStr: '2023-12-31',
    });

    (formatChartDate as Mock).mockImplementation((date: Date) => {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    (getCachedData as Mock).mockReturnValue(null); // No cached data by default
    (setCachedData as Mock).mockImplementation(() => {}); // No-op
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createGoogleAuthClient', () => {
    const scopes = ['https://www.googleapis.com/auth/analytics.readonly'];

    it('should create auth client with service account key', async () => {
      const config: GoogleAuthConfig = {
        serviceAccountKey: JSON.stringify({
          type: 'service_account',
          project_id: 'test-project',
        }),
      };

      const result = await createGoogleAuthClient(config, scopes);

      expect(result.success).toBe(true);
      expect(result.auth).toBe(mockGoogleAuth);
      expect(google.auth.GoogleAuth).toHaveBeenCalledWith({
        credentials: {
          type: 'service_account',
          project_id: 'test-project',
        },
        scopes,
      });
    });

    it('should create auth client with OAuth2 credentials', async () => {
      const config: GoogleAuthConfig = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        refreshToken: 'test-refresh-token',
      };

      const result = await createGoogleAuthClient(config, scopes);

      expect(result.success).toBe(true);
      expect(result.auth).toBe(mockOAuth2);
      expect(google.auth.OAuth2).toHaveBeenCalledWith('test-client-id', 'test-client-secret');
      expect(mockOAuth2.setCredentials).toHaveBeenCalledWith({
        refresh_token: 'test-refresh-token',
      });
    });

    it('should fail when no credentials provided', async () => {
      const config: GoogleAuthConfig = {};

      const result = await createGoogleAuthClient(config, scopes);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Google credentials not configured');
    });

    it('should handle authentication errors', async () => {
      const config: GoogleAuthConfig = {
        serviceAccountKey: 'invalid-json',
      };

      const result = await createGoogleAuthClient(config, scopes);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication failed');
    });
  });

  describe('createAnalyticsClient', () => {
    it('should create analytics client successfully', async () => {
      const config: GoogleAuthConfig = {
        serviceAccountKey: JSON.stringify({ type: 'service_account' }),
      };

      const result = await createAnalyticsClient(config);

      expect(result.success).toBe(true);
      expect(result.client).toBeDefined();
      expect(result.auth).toBe(mockGoogleAuth);
      expect(google.analyticsdata).toHaveBeenCalledWith({
        version: 'v1beta',
        auth: mockGoogleAuth,
      });
    });

    it('should fail when auth creation fails', async () => {
      const config: GoogleAuthConfig = {};

      const result = await createAnalyticsClient(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('credentials not configured');
    });
  });

  describe('createSearchConsoleClient', () => {
    it('should create search console client successfully', async () => {
      const config: GoogleAuthConfig = {
        serviceAccountKey: JSON.stringify({ type: 'service_account' }),
      };

      const result = await createSearchConsoleClient(config);

      expect(result.success).toBe(true);
      expect(result.client).toBeDefined();
      expect(result.auth).toBe(mockGoogleAuth);
      expect(google.searchconsole).toHaveBeenCalledWith({
        version: 'v1',
        auth: mockGoogleAuth,
      });
    });

    it('should fail when auth creation fails', async () => {
      const config: GoogleAuthConfig = {};

      const result = await createSearchConsoleClient(config);

      expect(result.success).toBe(false);
      expect(result.error).toContain('credentials not configured');
    });
  });

  describe('getGoogleAnalyticsData', () => {
    const validConfig: GoogleAnalyticsConfig = {
      ga4PropertyId: '123456789',
      serviceAccountKey: JSON.stringify({ type: 'service_account' }),
    };

    beforeEach(() => {
      // Mock successful API responses
      mockAnalyticsData.properties.runReport
        .mockResolvedValueOnce({
          data: {
            rows: [
              { dimensionValues: [{ value: '20240101' }], metricValues: [{ value: '100' }] },
              { dimensionValues: [{ value: '20240102' }], metricValues: [{ value: '150' }] },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            rows: [
              { dimensionValues: [{ value: '20231219' }], metricValues: [{ value: '80' }] },
              { dimensionValues: [{ value: '20231220' }], metricValues: [{ value: '120' }] },
            ],
          },
        });
    });

    it('should return cached data when available', async () => {
      const cachedData = [{ date: 'Jan 1', currentPageViews: 100, previousPageViews: 80 }];
      (getCachedData as Mock).mockReturnValue(cachedData);

      const result = await getGoogleAnalyticsData(validConfig, 'test-site');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(cachedData);
      expect(mockAnalyticsData.properties.runReport).not.toHaveBeenCalled();
    });

    it('should fail when GA4 property ID is not configured', async () => {
      const configWithoutProperty = { ...validConfig, ga4PropertyId: 'GA4_PROPERTY_ID_HERE' };

      const result = await getGoogleAnalyticsData(configWithoutProperty, 'test-site');

      expect(result.success).toBe(false);
      expect(result.error).toContain('GA4 Property ID not configured');
    });

    it('should fetch and process analytics data successfully', async () => {
      const result = await getGoogleAnalyticsData(validConfig, 'test-site');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);

      // Verify API calls
      expect(mockAnalyticsData.properties.runReport).toHaveBeenCalledTimes(2);
      expect(setCachedData).toHaveBeenCalled();
    });

    it('should handle authentication failures', async () => {
      const invalidConfig = { ga4PropertyId: '123456789' }; // No credentials

      const result = await getGoogleAnalyticsData(invalidConfig, 'test-site');

      expect(result.success).toBe(false);
      expect(result.error).toContain('credentials not configured');
    });
  });

  describe('getSearchConsoleData', () => {
    const validConfig: SearchConsoleConfig = {
      siteUrl: 'https://example.com',
      serviceAccountKey: JSON.stringify({ type: 'service_account' }),
    };

    beforeEach(() => {
      // Mock successful API responses
      mockSearchConsole.searchanalytics.query
        .mockResolvedValueOnce({
          data: {
            rows: [
              { keys: ['2024-01-01'], clicks: 10, impressions: 100 },
              { keys: ['2024-01-02'], clicks: 15, impressions: 150 },
            ],
          },
        })
        .mockResolvedValueOnce({
          data: {
            rows: [
              { keys: ['2023-12-19'], clicks: 8, impressions: 80 },
              { keys: ['2023-12-20'], clicks: 12, impressions: 120 },
            ],
          },
        });
    });

    it('should return cached data when available', async () => {
      const cachedData = [{
        date: 'Jan 1',
        currentImpressions: 100,
        currentClicks: 10,
        previousImpressions: 80,
        previousClicks: 8
      }];
      (getCachedData as Mock).mockReturnValue(cachedData);

      const result = await getSearchConsoleData(validConfig, 'test-site');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(cachedData);
      expect(mockSearchConsole.searchanalytics.query).not.toHaveBeenCalled();
    });

    it('should fail when site URL is not configured', async () => {
      const configWithoutUrl = { ...validConfig, siteUrl: '' };

      const result = await getSearchConsoleData(configWithoutUrl, 'test-site');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Site URL not configured');
    });

    it('should fetch and process search console data successfully', async () => {
      const result = await getSearchConsoleData(validConfig, 'test-site');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);

      // Verify API calls
      expect(mockSearchConsole.searchanalytics.query).toHaveBeenCalledTimes(2);
      expect(setCachedData).toHaveBeenCalled();
    });

    it('should handle authentication failures', async () => {
      const invalidConfig = { siteUrl: 'https://example.com' }; // No credentials

      const result = await getSearchConsoleData(invalidConfig, 'test-site');

      expect(result.success).toBe(false);
      expect(result.error).toContain('credentials not configured');
    });

    it('should map permission errors to code 403 with insufficient_permission', async () => {
      // Reset the mock responses and simulate the API throwing a permission error
      mockSearchConsole.searchanalytics.query.mockReset();
      mockSearchConsole.searchanalytics.query.mockRejectedValueOnce(new Error('User does not have sufficient permission for site "https://example.com"'));

      const result = await getSearchConsoleData(validConfig, 'test-site');

      expect(result.success).toBe(false);
      expect((result as any).code).toBe(403);
      expect(result.error).toBe('insufficient_permission');
      expect((result as any).details).toContain('User does not have sufficient permission');
    });
  });
});