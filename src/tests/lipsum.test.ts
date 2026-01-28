import { describe, it, expect, vi, afterEach } from 'vitest';
import { getLipsum } from '@/components/integrations/lipsum';

describe('getLipsum', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses HTML response into paragraph strings', async () => {
    const html = `<!doctype html><html><body><div id="lipsum"><p>First paragraph</p><p>Second paragraph</p></div></body></html>`;
    const mock = vi.fn().mockResolvedValue({ ok: true, text: async () => html });
    // @ts-ignore
    global.fetch = mock;

    const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 2, StartWithLoremIpsum: true });

    expect(res).toEqual(['First paragraph', 'Second paragraph']);
    expect(mock).toHaveBeenCalledWith(expect.stringContaining('https://proxy.pixelated.tech/prod/proxy?url='));
    expect(mock).toHaveBeenCalledWith(expect.stringContaining('https://www.lipsum.com/feed/html?LipsumTypeId=Paragraph&amount=2'));
  });

  it('returns empty array when fetch fails', async () => {
    // @ts-ignore
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 1, StartWithLoremIpsum: false });
    expect(res).toEqual([]);
  });
});
