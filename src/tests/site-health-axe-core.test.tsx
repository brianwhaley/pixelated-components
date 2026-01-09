/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import React, { useState, useEffect } from 'react';
import { SiteHealthAxeCore } from '../components/admin/site-health/site-health-axe-core';
import type { AxeCoreResponse, AxeCoreData } from '../components/admin/site-health/site-health-types';

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
      if (!siteName) return;

      setLoading(true);
      // Simulate the endpoint call
      const url = `http://localhost:3000${endpoint.endpoint}?siteName=${siteName}`;
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

describe('SiteHealthAxeCore', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const mockViolation: any = {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    help: 'Ensure sufficient color contrast',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
    nodes: [{
      target: ['.button'],
      html: '<button>Click me</button>',
      failureSummary: 'Fix the color contrast'
    }],
    tags: ['cat.color', 'wcag2aa', 'wcag143']
  };

  const mockData: AxeCoreData = {
    site: 'test-site',
    url: 'https://test-site.com',
    status: 'success',
    timestamp: '2024-01-01T00:00:00Z',
    result: {
      violations: [mockViolation],
      passes: [],
      incomplete: [],
      inapplicable: [],
      testEngine: {
        name: 'axe-core',
        version: '4.4.0'
      },
      testRunner: {
        name: 'axe'
      },
      testEnvironment: {
        userAgent: 'Mozilla/5.0...',
        windowWidth: 1200,
        windowHeight: 800
      },
      timestamp: '2024-01-01T00:00:00Z',
      url: 'https://test-site.com'
    },
    summary: {
      violations: 1,
      passes: 0,
      incomplete: 0,
      inapplicable: 0,
      critical: 0,
      serious: 1,
      moderate: 0,
      minor: 0
    }
  };

  const mockResponse: AxeCoreResponse = {
    success: true,
    data: [mockData]
  };

  it('renders nothing when no siteName is provided', () => {
    const { container } = render(<SiteHealthAxeCore siteName="" />);
    expect(container.firstChild).toBeNull();
  });

  it('fetches data and renders site information', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthAxeCore siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('test site')).toBeInTheDocument();
    });

    expect(screen.getByText('URL: https://test-site.com')).toBeInTheDocument();
  });

  it('displays accessibility summary statistics', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthAxeCore siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Accessibility Summary')).toBeInTheDocument();
    });

    expect(screen.getByText('Violations :')).toBeInTheDocument();
    expect(screen.getByText('Passes :')).toBeInTheDocument();
    expect(screen.getByText('Incomplete :')).toBeInTheDocument();
  });

  it('renders violation details with impact indicators', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthAxeCore siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Accessibility Violations')).toBeInTheDocument();
    });

    expect(screen.getByText('Elements must have sufficient color contrast')).toBeInTheDocument();
  });

  it('displays error message when API fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: false,
        error: 'API Error'
      })
    });

    render(<SiteHealthAxeCore siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Error: API Error')).toBeInTheDocument();
    });
  });

  it('shows no data message when data array is empty', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: []
      })
    });

    render(<SiteHealthAxeCore siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('No axe-core data available for this site.')).toBeInTheDocument();
    });
  });

  it('handles error status in data', async () => {
    const errorData = { ...mockData, status: 'error' as const, error: 'Data error' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        data: [errorData]
      })
    });

    render(<SiteHealthAxeCore siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Error: Data error')).toBeInTheDocument();
    });
  });

  it('formats node information correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthAxeCore siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('.button')).toBeInTheDocument();
    });
  });

  it('displays impact breakdown statistics', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    render(<SiteHealthAxeCore siteName="test-site" />);

    await waitFor(() => {
      expect(screen.getByText('Violation Impact Levels')).toBeInTheDocument();
    });

    expect(screen.getByText('Critical :')).toBeInTheDocument();
    expect(screen.getByText('Serious :')).toBeInTheDocument();
    expect(screen.getByText('Moderate :')).toBeInTheDocument();
    expect(screen.getByText('Minor :')).toBeInTheDocument();
  });
});