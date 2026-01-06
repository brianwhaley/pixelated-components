/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React, { useState, useEffect } from 'react';
import { SiteHealthOverview } from '../components/admin/site-health/site-health-overview';
import type { CoreWebVitalsResponse, CoreWebVitalsData } from '../components/admin/site-health/site-health-types';

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
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockData: CoreWebVitalsData = {
    site: 'test-site',
    url: 'https://test-site.com',
    status: 'success',
    timestamp: '2024-01-01T00:00:00Z',
    metrics: {
      cls: 0.05,
      fid: 50,
      lcp: 2000,
      fcp: 1500,
      ttfb: 200,
      speedIndex: 2500,
      interactive: 3000,
      totalBlockingTime: 100,
      firstMeaningfulPaint: 1800,
    },
    scores: {
      performance: 0.85,
      accessibility: 0.9,
      'best-practices': 0.8,
      seo: 0.75,
      pwa: 0.7,
    },
    categories: {
      performance: {
        id: 'performance',
        title: 'Performance',
        score: 0.85,
        audits: []
      },
      accessibility: {
        id: 'accessibility',
        title: 'Accessibility',
        score: 0.9,
        audits: []
      },
      'best-practices': {
        id: 'best-practices',
        title: 'Best Practices',
        score: 0.8,
        audits: []
      },
      seo: {
        id: 'seo',
        title: 'SEO',
        score: 0.75,
        audits: []
      },
      pwa: {
        id: 'pwa',
        title: 'PWA',
        score: 0.7,
        audits: []
      },
    }
  };

  const mockResponse: CoreWebVitalsResponse = {
    success: true,
    data: [mockData]
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

    expect(screen.getByText('URL: https://test-site.com')).toBeInTheDocument();
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
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
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
    expect(screen.getByText('0.050')).toBeInTheDocument();
    expect(screen.getByText('First Input Delay:')).toBeInTheDocument();
    expect(screen.getByText('50ms')).toBeInTheDocument();
    expect(screen.getByText('Largest Contentful Paint:')).toBeInTheDocument();
    expect(screen.getByText('2000ms')).toBeInTheDocument();
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
    expect(screen.getByText('90%')).toBeInTheDocument();
  });
});