import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { LoremIpsum } from '@/components/integrations/loremipsum';

describe('LoremIpsum', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches default 1 paragraph and renders it (direct)', async () => {
    const mock = vi.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify({ paragraphs: ['one'] }) });
    // @ts-ignore
    global.fetch = mock;

    render(<LoremIpsum />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('one')).toBeInTheDocument());
    expect(mock).toHaveBeenCalledWith(expect.stringContaining('https://lorem-api.com/api/lorem?paragraphs=1'), expect.anything());
  });

  it('retries via proxy when direct fetch fails and proxyBase is provided', async () => {
    const proxyBase = 'https://proxy.test/proxy?url=';
    const failFirst = vi.fn()
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ paragraphs: ['proxied'] }) });
    // @ts-ignore
    global.fetch = failFirst;

    render(<LoremIpsum paragraphs={1} proxyBase={proxyBase} />);
    await waitFor(() => expect(screen.getByText('proxied')).toBeInTheDocument());
    expect(failFirst).toHaveBeenNthCalledWith(1, expect.stringContaining('https://lorem-api.com/api/lorem?paragraphs=1'), expect.anything());
    expect(failFirst).toHaveBeenNthCalledWith(2, expect.stringContaining(encodeURIComponent('https://lorem-api.com/api/lorem?paragraphs=1')), expect.anything());
  });

  it('prefers global proxy from usePixelatedConfig over a passed proxyBase', async () => {
    const GLOBAL = 'https://global.proxy/test?url=';
    const localProxy = 'https://local.proxy/test?url=';

    // spy on the config hook and return a global proxy
    const mod = await import('@/components/config/config.client');
    vi.spyOn(mod, 'usePixelatedConfig').mockReturnValue({ global: { proxyUrl: GLOBAL } } as any);

    const failFirst = vi.fn()
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ paragraphs: ['globally-proxied'] }) });
    // @ts-ignore
    global.fetch = failFirst;

    render(<LoremIpsum paragraphs={1} proxyBase={localProxy} />);
    await waitFor(() => expect(screen.getByText('globally-proxied')).toBeInTheDocument());

    // first call = direct, second call = global proxy (not the local proxyBase)
    expect(failFirst).toHaveBeenNthCalledWith(1, expect.stringContaining('https://lorem-api.com/api/lorem?paragraphs=1'), expect.anything());
    expect(failFirst).toHaveBeenNthCalledWith(2, expect.stringContaining(encodeURIComponent('https://lorem-api.com/api/lorem?paragraphs=1')), expect.anything());
    expect(failFirst).toHaveBeenNthCalledWith(2, expect.stringContaining(GLOBAL), expect.anything());
  });

  it('splits JSON string into paragraphs', async () => {
    const payload = JSON.stringify('para one\n\npara two');
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => payload });

    render(<LoremIpsum />);
    await waitFor(() => expect(screen.getByText('para one')).toBeInTheDocument());
    expect(screen.getByText('para two')).toBeInTheDocument();
  });

  it('parses { text: "..." } and splits paragraphs', async () => {
    const payload = JSON.stringify({ text: 'p1\n\np2' });
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => payload });

    render(<LoremIpsum />);
    await waitFor(() => expect(screen.getByText('p1')).toBeInTheDocument());
    expect(screen.getByText('p2')).toBeInTheDocument();
  });

  it('shows error state when both direct and proxied fetches fail', async () => {
    // @ts-ignore
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Network error'));
    render(<LoremIpsum paragraphs={1} proxyBase="https://proxy.test/proxy?url=" />);
    await waitFor(() => expect(screen.getByText(/unable to load|network error/i)).toBeInTheDocument());
  });
});
