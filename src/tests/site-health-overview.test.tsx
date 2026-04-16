/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import React, { useState, useEffect } from 'react';
import { SiteHealthOverview } from '../components/admin/site-health/site-health-overview';
import type { CoreWebVitalsResponse, CoreWebVitalsData } from '../components/admin/site-health/site-health-types';
import { processPSIData } from '../components/admin/site-health/site-health-core-web-vitals.integration';
import { googlePsiExampleCom } from '../test/test-data';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
  SiteHealthTemplate: ({ children, endpoint, siteName }: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [data, setData] = useState(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!siteName || !endpoint) return;

      setLoading(true);
      
      // Simulate endpoint-based fetching like SiteHealthTemplate does
      const url = new URL(endpoint.endpoint, 'http://localhost');
      url.searchParams.set('siteName', encodeURIComponent(siteName));

      mockFetch(url.toString())
        .then((response: any) => response.json())
        .then((result: any) => {
          if (!result.success) {
            throw new Error(result.error || 'API request failed');
          }
          // Apply response transformer if provided
          return endpoint.responseTransformer ? endpoint.responseTransformer(result) : result;
        })
        .then(setData)
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    }, [siteName, endpoint]);

    if (!siteName) return null;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return <>{children(data)}</>;
  }
}));

describe('SiteHealthOverview', () => {
  let mockData: CoreWebVitalsData;

  beforeAll(async () => {
    mockData = await processPSIData(googlePsiExampleCom, 'test-site', 'https://www.example.com');
  });

  beforeEach(() => {
    mockFetch.mockClear();
    mockResponse.data = [mockData];
  });

  const mockResponse: CoreWebVitalsResponse = {
    success: true,
    data: [] as CoreWebVitalsData[]
  };

  it('renders nothing when no siteName is provided', () => {
    const { container } = render(<SiteHealthOverview siteName="" />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches data and renders site information', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthOverview siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('test site')).toBeInTheDocument();
    });

    expect(screen.getByText(`URL: ${mockData.url}`)).toBeInTheDocument();
  });

  it('renders performance scores with correct colors', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthOverview siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('performance')).toBeInTheDocument();
    });

    // Check that scores are displayed
    Object.values(mockData.scores)
      .filter((score): score is number => score !== null)
      .forEach((score) => {
        expect(screen.getAllByText(`${Math.round(score * 100)}%`).length).toBeGreaterThan(0);
      });
  });

  it('renders Core Web Vitals metrics', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthOverview siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Core Web Vitals')).toBeInTheDocument();
    });

    expect(screen.getByText('Cumulative Layout Shift:')).toBeInTheDocument();
    expect(screen.getByText(`${mockData.metrics.cls.toFixed(3)}`)).toBeInTheDocument();
    expect(screen.getByText('First Input Delay:')).toBeInTheDocument();
    expect(screen.getAllByText(`${Math.round(mockData.metrics.fid)}ms`).length).toBeGreaterThan(0);
    expect(screen.getByText('Largest Contentful Paint:')).toBeInTheDocument();
    expect(screen.getAllByText(`${Math.round(mockData.metrics.lcp)}ms`).length).toBeGreaterThan(0);
  });

  it('displays error message when API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: false,
        error: 'API Error'
      })
    });

    render(<SiteHealthOverview siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    });
  });

  it('shows no data message when data array is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: []
      })
    });

    render(<SiteHealthOverview siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('No site health data available for this site.')).toBeInTheDocument();
    });
  });

  it('handles error status in data', async () => {
    const errorData = { ...mockData, status: 'error' as const, error: 'Data error' };
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: [errorData]
      })
    });

    render(<SiteHealthOverview siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Error: Data error')).toBeInTheDocument();
    });
  });

  it('displays timestamp correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthOverview siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText(/Last checked:/)).toBeInTheDocument();
    });
  });

  it('filters out null scores from display', async () => {
    const dataWithNulls = {
      ...mockData,
      scores: {
        ...mockData.scores,
        performance: null,
      }
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        data: [dataWithNulls]
      })
    });

    render(<SiteHealthOverview siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('test site')).toBeInTheDocument();
    });

    // Performance score should not be displayed since it's null
    expect(screen.queryByText('performance')).not.toBeInTheDocument();
    // Other scores should still be displayed
    const otherScoreValue = Math.round((dataWithNulls.scores.accessibility ?? 0) * 100);
    expect(screen.getAllByText(`${otherScoreValue}%`).length).toBeGreaterThan(0);
  });
});