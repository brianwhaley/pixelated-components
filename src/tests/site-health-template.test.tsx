/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '../test/test-utils';
import { SiteHealthTemplate } from '../components/admin/site-health/site-health-template';
import * as smartFetchModule from '../components/foundation/smartfetch';

// Mock smartFetch
const mockSmartFetch = vi.fn();
vi.spyOn(smartFetchModule, 'smartFetch').mockImplementation(mockSmartFetch);

describe('SiteHealthTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when siteName is empty', () => {
    const { container } = render(
      <SiteHealthTemplate 
        siteName="" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result
        }}
      >
        {() => <div>Test content</div>}
      </SiteHealthTemplate>
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state initially', () => {
    mockSmartFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <SiteHealthTemplate 
        siteName="test-site" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result
        }}
      >
        {() => <div>Test content</div>}
      </SiteHealthTemplate>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders children with data when fetch succeeds', async () => {
    const mockData = { success: true, data: { test: 'data' } };
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockData)
    };
    mockSmartFetch.mockResolvedValue(mockResponse);

    render(
      <SiteHealthTemplate 
        siteName="test-site" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result.data
        }}
      >
        {(data: { test: string } | null) => <div>Data: {data?.test}</div>}
      </SiteHealthTemplate>
    );

    await waitFor(() => {
      expect(screen.getByText('Data: data')).toBeInTheDocument();
    });

    expect(mockSmartFetch).toHaveBeenCalledWith('http://localhost:3000/api/test?siteName=test-site', {
      responseType: 'ok',
      requestInit: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      }
    });
  });

  it('shows error state when fetch fails', async () => {
    mockSmartFetch.mockRejectedValue(new Error('Fetch failed'));

    render(
      <SiteHealthTemplate 
        siteName="test-site" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result
        }}
      >
        {() => <div>Test content</div>}
      </SiteHealthTemplate>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Fetch failed')).toBeInTheDocument();
    });
  });

  it('handles non-Error thrown values', async () => {
    mockSmartFetch.mockRejectedValue('String error');

    render(
      <SiteHealthTemplate 
        siteName="test-site" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result
        }}
      >
        {() => <div>Test content</div>}
      </SiteHealthTemplate>
    );

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to load data')).toBeInTheDocument();
    });
  });

  it('re-fetches data when siteName changes', async () => {
    const mockData = { success: true, data: { test: 'data' } };
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockData)
    };
    mockSmartFetch.mockResolvedValue(mockResponse);

    const { rerender } = render(
      <SiteHealthTemplate 
        siteName="site1" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result.data
        }}
      >
        {(data: { test: string } | null) => <div>Data: {data?.test}</div>}
      </SiteHealthTemplate>
    );

    await waitFor(() => {
      expect(screen.getByText('Data: data')).toBeInTheDocument();
    });

    expect(mockSmartFetch).toHaveBeenCalledTimes(1);
    expect(mockSmartFetch).toHaveBeenCalledWith('http://localhost:3000/api/test?siteName=site1', {
      responseType: 'ok',
      requestInit: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      }
    });

    // Change siteName
    rerender(
      <SiteHealthTemplate 
        siteName="site2" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result.data
        }}
      >
        {(data: { test: string } | null) => <div>Data: {data?.test}</div>}
      </SiteHealthTemplate>
    );

    await waitFor(() => {
      expect(mockSmartFetch).toHaveBeenCalledTimes(2);
    });

    expect(mockSmartFetch).toHaveBeenLastCalledWith('http://localhost:3000/api/test?siteName=site2', {
      responseType: 'ok',
      requestInit: {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      }
    });
  });

  it('does not fetch when siteName becomes empty', async () => {
    const mockData = { success: true, data: { test: 'data' } };
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockData)
    };
    mockSmartFetch.mockResolvedValue(mockResponse);

    const { rerender } = render(
      <SiteHealthTemplate 
        siteName="site1" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result.data
        }}
      >
        {(data: { test: string } | null) => <div>Data: {data?.test}</div>}
      </SiteHealthTemplate>
    );

    await waitFor(() => {
      expect(screen.getByText('Data: data')).toBeInTheDocument();
    });

    // Change to empty siteName
    rerender(
      <SiteHealthTemplate 
        siteName="" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result.data
        }}
      >
        {(data: { test: string } | null) => <div>Data: {data?.test}</div>}
      </SiteHealthTemplate>
    );

    expect(mockSmartFetch).toHaveBeenCalledTimes(1); // Should not call again
  });

  it('cleans up on unmount', async () => {
    mockSmartFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { unmount } = render(
      <SiteHealthTemplate 
        siteName="test-site" 
        endpoint={{
          endpoint: '/api/test',
          responseTransformer: (result) => result
        }}
      >
        {() => <div>Test content</div>}
      </SiteHealthTemplate>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    unmount();

    // Component should be unmounted, no state updates should occur
  });
});