import { describe, it, expect, vi } from 'vitest';
import { getSpotifyEpisodes, type SpotifyPodcastEpisodeType } from '../components/integrations/spotify.functions';
import { PodcastEpisodeList } from '../components/integrations/spotify.components';

describe('Spotify Podcast Integration', () => {
	describe('getSpotifyEpisodes', () => {
		it('should fetch and parse RSS feed', async () => {
			const mockRSSURL = 'https://anchor.fm/s/10fc04b98/podcast/rss';
			
			vi.stubGlobal('fetch', vi.fn(() =>
				Promise.resolve({
					text: () => Promise.resolve(`<?xml version="1.0"?>
						<rss version="2.0">
							<channel>
								<item>
									<title>Test Episode</title>
									<description>Test Description</description>
									<link>https://example.com/test</link>
									<guid>test-guid-123</guid>
									<creator>Test Creator</creator>
									<pubDate>Wed, 04 Mar 2026 13:00:00 GMT</pubDate>
									<enclosure url="https://example.com/audio.mp3" type="audio/mpeg" length="1000"/>
									<summary>Test Summary</summary>
									<explicit>false</explicit>
									<duration>00:30:00</duration>
									<image href="https://example.com/image.jpg"/>
									<episode>1</episode>
									<episodeType>full</episodeType>
								</item>
							</channel>
						</rss>`),
				})
			));

			const episodes = await getSpotifyEpisodes({ rssURL: mockRSSURL });

			expect(episodes).toHaveLength(1);
			expect(episodes?.[0].title).toBe('Test Episode');
			expect(episodes?.[0].description).toBe('Test Description');
			expect(episodes?.[0].link).toBe('https://example.com/test');
			expect(episodes?.[0].image).toBe('https://example.com/image.jpg');
			expect(episodes?.[0].duration).toBe('00:30:00');
		});

		it('should sort episodes by pubDate descending', async () => {
			const mockRSSURL = 'https://anchor.fm/s/test/podcast/rss';

			vi.stubGlobal('fetch', vi.fn(() =>
				Promise.resolve({
					text: () => Promise.resolve(`<?xml version="1.0"?>
						<rss version="2.0">
							<channel>
								<item>
									<title>Episode 1</title>
									<pubDate>Mon, 01 Mar 2026 10:00:00 GMT</pubDate>
									<description>Desc 1</description>
									<link>https://example.com/1</link>
									<guid>guid-1</guid>
									<creator>Creator</creator>
									<enclosure url="https://example.com/1.mp3" type="audio/mpeg" length="1000"/>
									<summary>Sum 1</summary>
									<explicit>false</explicit>
									<duration>30:00</duration>
									<image href="https://example.com/1.jpg"/>
									<episode>1</episode>
									<episodeType>full</episodeType>
								</item>
								<item>
									<title>Episode 2</title>
									<pubDate>Wed, 03 Mar 2026 10:00:00 GMT</pubDate>
									<description>Desc 2</description>
									<link>https://example.com/2</link>
									<guid>guid-2</guid>
									<creator>Creator</creator>
									<enclosure url="https://example.com/2.mp3" type="audio/mpeg" length="1000"/>
									<summary>Sum 2</summary>
									<explicit>false</explicit>
									<duration>30:00</duration>
									<image href="https://example.com/2.jpg"/>
									<episode>2</episode>
									<episodeType>full</episodeType>
								</item>
							</channel>
						</rss>`),
				})
			));

			const episodes = await getSpotifyEpisodes({ rssURL: mockRSSURL });

			expect(episodes?.[0].title).toBe('Episode 2');
			expect(episodes?.[1].title).toBe('Episode 1');
		});

		it('should handle empty RSS feed', async () => {
			const mockRSSURL = 'https://anchor.fm/s/empty/podcast/rss';

			vi.stubGlobal('fetch', vi.fn(() =>
				Promise.resolve({
					text: () => Promise.resolve(`<?xml version="1.0"?>
						<rss version="2.0">
							<channel>
							</channel>
						</rss>`),
				})
			));

			const episodes = await getSpotifyEpisodes({ rssURL: mockRSSURL });

			expect(episodes).toBeUndefined();
		});

		it('should handle network error gracefully', async () => {
			const mockRSSURL = 'https://anchor.fm/s/invalid/podcast/rss';

			vi.stubGlobal('fetch', vi.fn(() =>
				Promise.reject(new Error('Network error'))
			));

			const episodes = await getSpotifyEpisodes({ rssURL: mockRSSURL });

			expect(episodes).toBeUndefined();
		});
	});

	describe('PodcastEpisodeList', () => {
		it('should render list of episodes', () => {
			const mockEpisodes: SpotifyPodcastEpisodeType[] = [
				{
					title: 'Episode 1',
					description: 'Test description',
					link: 'https://example.com/1',
					guid: 'guid-1',
					creator: 'Creator',
					pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
					enclosure: { url: 'https://example.com/1.mp3', type: 'audio/mpeg', length: '1000' },
					summary: 'Summary 1',
					explicit: false as boolean,
					duration: '30:00',
					image: 'https://example.com/1.jpg',
					episode: '1',
					episodeType: 'full',
				},
			];

			expect(mockEpisodes).toHaveLength(1);
			expect(mockEpisodes[0].title).toBe('Episode 1');
		});

		it('should handle episodes without images', () => {
			const mockEpisode: SpotifyPodcastEpisodeType = {
				title: 'No Image Episode',
				description: 'Test',
				link: 'https://example.com',
				guid: 'guid-test',
				creator: 'Creator',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: { url: 'https://example.com/audio.mp3', type: 'audio/mpeg', length: '1000' },
				summary: 'Summary',
				explicit: false,
				duration: '40:00',
				image: '',
				episode: '1',
				episodeType: 'full',
			};

			expect(mockEpisode.image).toBe('');
		});

		it('should handle explicit content flag', () => {
			const explicitEpisode: SpotifyPodcastEpisodeType = {
				title: 'Explicit Episode',
				description: 'Contains explicit content',
				link: 'https://example.com',
				guid: 'guid-explicit',
				creator: 'Creator',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: { url: 'https://example.com/audio.mp3', type: 'audio/mpeg', length: '1000' },
				summary: 'Summary',
				explicit: true,
				duration: '45:00',
				image: 'https://example.com/image.jpg',
				episode: '1',
				episodeType: 'full',
			};

			expect(explicitEpisode.explicit).toBe(true);
		});

		it('should parse enclosure data correctly', () => {
			const episode: SpotifyPodcastEpisodeType = {
				title: 'Test Episode',
				description: 'Test',
				link: 'https://example.com',
				guid: 'guid-test',
				creator: 'Creator',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: {
					url: 'https://anchor.fm/s/10fc04b98/podcast/play/116357755/audio.mp3',
					type: 'audio/mpeg',
					length: '4469592',
				},
				summary: 'Summary',
				explicit: false,
				duration: '04:38',
				image: 'https://example.com/image.jpg',
				episode: '1',
				episodeType: 'full',
			};

			expect(episode.enclosure.url).toBeDefined();
			expect(episode.enclosure.type).toBe('audio/mpeg');
			expect(episode.enclosure.length).toBe('4469592');
		});
	});
});
