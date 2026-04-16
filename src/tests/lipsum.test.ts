import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { getLipsum } from '@/components/integrations/lipsum';

vi.mock('@/components/foundation/smartfetch');

describe('getLipsum Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('HTML Parsing', () => {
    it('parses HTML response into paragraph strings', async () => {
      const html = `<!doctype html><html><body><div id="lipsum"><p>First paragraph</p><p>Second paragraph</p></div></body></html>`;
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockResolvedValue(html);

      const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 2, StartWithLoremIpsum: true });

      expect(res).toEqual(['First paragraph', 'Second paragraph']);
      expect(vi.mocked(smartFetch)).toHaveBeenCalled();
    });

    it('parses single paragraph correctly', async () => {
      const html = `<!doctype html><html><body><div id="lipsum"><p>Single paragraph</p></div></body></html>`;
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockResolvedValue(html);

      const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 1, StartWithLoremIpsum: false });

      expect(res.length).toBe(1);
      expect(res[0]).toBe('Single paragraph');
    });

    it('parses multiple paragraphs', async () => {
      const paragraphs = Array.from({ length: 5 }, (_, i) => `<p>Paragraph ${i + 1}</p>`).join('');
      const html = `<!doctype html><html><body><div id="lipsum">${paragraphs}</div></body></html>`;
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockResolvedValue(html);

      const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 5, StartWithLoremIpsum: true });

      expect(res.length).toBe(5);
    });
  });

  describe('API Requests', () => {
    it('sends request to proxy URL', async () => {
      const html = `<!doctype html><html><body><div id="lipsum"><p>Test</p></div></body></html>`;
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockResolvedValue(html);

      await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 2, StartWithLoremIpsum: true });

      expect(vi.mocked(smartFetch)).toHaveBeenCalledWith(expect.stringContaining('https://proxy.pixelated.tech/prod/proxy'), expect.any(Object));
    });

    it('includes LipsumTypeId in request', async () => {
      const html = `<!doctype html><html><body><div id="lipsum"><p>Test</p></div></body></html>`;
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockResolvedValue(html);

      await getLipsum({ LipsumTypeId: 'Sentence', Amount: 5, StartWithLoremIpsum: false });

      expect(vi.mocked(smartFetch)).toHaveBeenCalledWith(expect.stringContaining('LipsumTypeId=Sentence'), expect.any(Object));
    });

    it('includes amount parameter', async () => {
      const html = `<!doctype html><html><body><div id="lipsum"><p>Test</p></div></body></html>`;
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockResolvedValue(html);

      await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 5, StartWithLoremIpsum: true });

      expect(vi.mocked(smartFetch)).toHaveBeenCalledWith(expect.stringContaining('amount=5'), expect.any(Object));
    });
  });


  describe('Error Handling', () => {
    it('returns empty array when fetch fails', async () => {
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockRejectedValue(new Error('Network error'));

      const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 1, StartWithLoremIpsum: false });

      expect(res).toEqual([]);
    });

    it('handles network errors gracefully', async () => {
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockRejectedValue(new TypeError('Failed to fetch'));

      const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 2, StartWithLoremIpsum: true });

      expect(Array.isArray(res)).toBe(true);
      expect(res.length).toBe(0);
    });

    it('handles empty HTML response', async () => {
      const html = `<!doctype html><html><body><div id="lipsum"></div></body></html>`;
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockResolvedValue(html);

      const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 1, StartWithLoremIpsum: false });

      expect(Array.isArray(res)).toBe(true);
    });

    it('handles missing lipsum div', async () => {
      const html = `<!doctype html><html><body><p>No lipsum div</p></body></html>`;
      const { smartFetch } = await import('@/components/foundation/smartfetch');
      vi.mocked(smartFetch).mockResolvedValue(html);

      const res = await getLipsum({ LipsumTypeId: 'Paragraph', Amount: 1, StartWithLoremIpsum: false });

      expect(Array.isArray(res)).toBe(true);
    });
  });
});
