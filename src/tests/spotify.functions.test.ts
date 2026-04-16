import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as spotifyModule from '../components/integrations/spotify.functions';
import { getSpotifySeries, getSpotifyEpisodes, type SpotifyPodcastSeriesType, type SpotifyPodcastEpisodeType } from '../components/integrations/spotify.functions';

// Mock smartFetch module
vi.mock('../components/foundation/smartfetch', () => ({
	smartFetch: vi.fn(),
}));

import { smartFetch } from '../components/foundation/smartfetch';

describe('Spotify Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getSpotifySeries', () => {
		it('should fetch podcast series from RSS feed', async () => {
			const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
  <channel>
    <title>Test Podcast</title>
    <description>A test podcast</description>
    <link>https://podcast.example.com</link>
    <language>en-us</language>
  </channel>
</rss>`;

			vi.mocked(smartFetch).mockResolvedValue(mockRSSData);

			const series = await getSpotifySeries({ rssURL: 'https://example.com/rss' });
			expect(series).toBeDefined();
			expect(series?.title).toBe('Test Podcast');
		});

		it('should handle network errors gracefully', async () => {
			vi.mocked(smartFetch).mockRejectedValue(new Error('Network error'));

			const result = await getSpotifySeries({ rssURL: 'https://example.com/rss' });
			expect(result).toBeUndefined();
		});

		it('should extract all required fields from RSS', async () => {
			const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
  <channel>
    <title>My Podcast</title>
    <description>Description here</description>
    <link>https://podcast.example.com</link>
    <copyright>© 2025</copyright>
    <language>en</language>
  </channel>
</rss>`;

			vi.mocked(smartFetch).mockResolvedValue(mockRSSData);

			const series = await getSpotifySeries({ rssURL: 'https://example.com/rss' });
			expect(series?.description).toBe('Description here');
			expect(series?.copyright).toBe('© 2025');
		});

		it('should handle malformed RSS gracefully', async () => {
			vi.mocked(smartFetch).mockResolvedValue('<invalid>');

			const series = await getSpotifySeries({ rssURL: 'https://example.com/rss' });
			expect(series).toBeDefined();
		});

		it('should handle RSS without channel element', async () => {
			const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
</rss>`;

			vi.mocked(smartFetch).mockResolvedValue(mockRSSData);

			const series = await getSpotifySeries({ rssURL: 'https://example.com/rss' });
			expect(series).toEqual({});
		});
	});

	describe('getSpotifyEpisodes', () => {
		it('should fetch podcast episodes from RSS feed', async () => {
			const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
  <channel>
    <item>
      <title>Episode 1</title>
      <description>First episode</description>
      <link>https://example.com/ep1</link>
      <pubDate>Mon, 01 Jan 2025 00:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Episode 2</title>
      <description>Second episode</description>
      <link>https://example.com/ep2</link>
      <pubDate>Tue, 02 Jan 2025 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

			vi.mocked(smartFetch).mockResolvedValue(mockRSSData);

			const episodes = await getSpotifyEpisodes({ rssURL: 'https://example.com/rss' });
			expect(Array.isArray(episodes)).toBe(true);
			expect(episodes?.length).toBe(2);
		});

		it('should sort episodes by pubDate in descending order', async () => {
			const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
  <channel>
    <item>
      <title>Episode 1</title>
      <pubDate>Mon, 01 Jan 2025 00:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Episode 2</title>
      <pubDate>Tue, 02 Jan 2025 00:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

			vi.mocked(smartFetch).mockResolvedValue(mockRSSData);

			const episodes = await getSpotifyEpisodes({ rssURL: 'https://example.com/rss' });
			expect(episodes?.[0].title).toBe('Episode 2');
			expect(episodes?.[1].title).toBe('Episode 1');
		});

		it('should extract episode enclosure information', async () => {
			const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
  <channel>
    <item>
      <title>Episode 1</title>
      <enclosure url="https://example.com/audio.mp3" type="audio/mpeg" length="12345" />
    </item>
  </channel>
</rss>`;

			vi.mocked(smartFetch).mockResolvedValue(mockRSSData);

			const episodes = await getSpotifyEpisodes({ rssURL: 'https://example.com/rss' });
			expect(episodes?.[0].enclosure.url).toBe('https://example.com/audio.mp3');
			expect(episodes?.[0].enclosure.type).toBe('audio/mpeg');
			expect(episodes?.[0].enclosure.length).toBe('12345');
		});

		it('should handle network errors gracefully', async () => {
			vi.mocked(smartFetch).mockRejectedValue(new Error('Network error'));

			const result = await getSpotifyEpisodes({ rssURL: 'https://example.com/rss' });
			expect(result).toBeUndefined();
		});

		it('should handle RSS with no items', async () => {
			const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
  <channel>
  </channel>
</rss>`;

			vi.mocked(smartFetch).mockResolvedValue(mockRSSData);

			const episodes = await getSpotifyEpisodes({ rssURL: 'https://example.com/rss' });
		expect(episodes).toBeUndefined();
		});

		it('should extract all episode fields', async () => {
			const mockRSSData = `<?xml version="1.0" encoding="UTF-8"?>
<rss>
  <channel>
    <item>
      <title>Test Episode</title>
      <description>Episode description</description>
      <link>https://example.com/ep1</link>
      <guid>guid-123</guid>
      <creator>Host Name</creator>
      <pubDate>Mon, 01 Jan 2025 00:00:00 GMT</pubDate>
      <duration>60:00</duration>
      <explicit>true</explicit>
    </item>
  </channel>
</rss>`;

			vi.mocked(smartFetch).mockResolvedValue(mockRSSData);

			const episodes = await getSpotifyEpisodes({ rssURL: 'https://example.com/rss' });
			expect(episodes?.[0].title).toBe('Test Episode');
			expect(episodes?.[0].creator).toBe('Host Name');
			expect(episodes?.[0].duration).toBe('60:00');
		});
	});
});
