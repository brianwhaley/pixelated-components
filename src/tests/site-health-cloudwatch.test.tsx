/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React, { useState, useEffect } from 'react';
import { SiteHealthCloudwatch } from '../components/admin/site-health/site-health-cloudwatch';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
  SiteHealthTemplate: ({ children, endpoint, siteName, startDate, endDate }: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [data, setData] = useState(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [loading, setLoading] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!siteName) return;

      setLoading(true);
      // Simulate the endpoint call with params
      const params = new URLSearchParams({ siteName });
      if (endpoint.params?.startDate) params.append('startDate', endpoint.params.startDate);
      if (endpoint.params?.endDate) params.append('endDate', endpoint.params.endDate);
      const url = `http://localhost:3000${endpoint.endpoint}?${params.toString()}`;
      global.fetch(url, { method: 'GET' })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(result => {
          if (!result.success) {
            throw new Error(result.error || 'API request failed');
          }
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

// Mock Recharts components to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ComposedChart: ({ children }: any) => <div data-testid="composed-chart">{children}</div>,
  Bar: () => <div data-testid="bar-chart" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>
}));

describe('SiteHealthCloudwatch', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockCloudwatchData = [
    {
      date: '2024-01-01',
      successCount: 95,
      failureCount: 5,
      totalChecks: 100,
      successRate: 0.95
    },
    {
      date: '2024-01-02',
      successCount: 98,
      failureCount: 2,
      totalChecks: 100,
      successRate: 0.98
    },
    {
      date: '2024-01-03',
      successCount: 97,
      failureCount: 3,
      totalChecks: 100,
      successRate: 0.97
    }
  ];

  const mockResponse = {
    success: true,
    data: mockCloudwatchData
  };

  it('renders nothing when no siteName is provided', () => {
    const { container } = render(<SiteHealthCloudwatch siteName="" />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches data and renders CloudWatch chart', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthCloudwatch siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByTestId('composed-chart')).toBeInTheDocument();
    });
  });

  it('displays no data message when data array is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] })
    });

    render(<SiteHealthCloudwatch siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('No uptime data available. Route53 health checks may not be configured to send metrics to CloudWatch.')).toBeInTheDocument();
    });
  });

  it('displays no metric data message when all checks are zero', async () => {
    const zeroData = [
      {
        date: '2024-01-01',
        successCount: 0,
        failureCount: 0,
        totalChecks: 0,
        successRate: 0
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, data: zeroData })
    });

    render(<SiteHealthCloudwatch siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText(/Health check exists but has no metric data/)).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });

    render(<SiteHealthCloudwatch siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Error: HTTP error! status: 500')).toBeInTheDocument();
    });
  });

  it('handles health check not configured error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        error: 'Health Check ID not configured for site test-site'
      })
    });

    render(<SiteHealthCloudwatch siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Error: Health Check ID not configured for site test-site')).toBeInTheDocument();
    });
  });

  it('passes startDate and endDate parameters to API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthCloudwatch siteName="test-site" startDate="2024-01-01" endDate="2024-01-31" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/site-health/cloudwatch?siteName=test-site&startDate=2024-01-01&endDate=2024-01-31', { method: 'GET' });
    });
  });
});