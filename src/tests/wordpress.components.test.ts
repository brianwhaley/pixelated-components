/// <reference types="vitest" />
import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';
import { getCachedWordPressItems } from '../components/integrations/wordpress.components';
import { getWordPressItems } from '../components/integrations/wordpress.functions';

// stub the underlying network call so we can observe caching behaviour
vi.mock('../components/integrations/wordpress.functions', () => ({
  getWordPressItems: vi.fn(),
}));

const mockedFetch = getWordPressItems as unknown as ReturnType<typeof vi.fn>;

describe('getCachedWordPressItems', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and returns posts on first call and uses cache on second', async () => {
    const fakePosts = [{ id: 1 }];
    mockedFetch.mockResolvedValueOnce(fakePosts);

    const opts = { site: 'foo' };

    // first invocation should call underlying fetch
    const posts1 = await getCachedWordPressItems(opts);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(posts1).toBe(fakePosts);

    // call again with same site, still cached
    const posts2 = await getCachedWordPressItems(opts);
    expect(mockedFetch).toHaveBeenCalledTimes(1);
    expect(posts2).toBe(fakePosts);
  });

  it('uses separate cached values for different sites', async () => {
    const postsA = [{ id: 'a' }];
    const postsB = [{ id: 'b' }];
    mockedFetch.mockResolvedValueOnce(postsA).mockResolvedValueOnce(postsB);

    const result1 = await getCachedWordPressItems({ site: 'a' });
    const result2 = await getCachedWordPressItems({ site: 'b' });

    expect(result1).toBe(postsA);
    expect(result2).toBe(postsB);
    // two different sites should have triggered two fetches
    expect(mockedFetch).toHaveBeenCalledTimes(2);
  });

  it('gracefully handles missing site by returning undefined', async () => {
    const result = await getCachedWordPressItems({ site: '' });
    expect(result).toBeUndefined();
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
