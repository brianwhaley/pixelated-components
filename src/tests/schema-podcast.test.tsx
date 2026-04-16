import { describe, it, expect } from 'vitest';
import {
	mapPodcastEpisodeToSchema,
	mapPodcastSeriesToSchema,
	type PodcastEpisodeSchema,
	type PodcastSeriesSchema,
} from '@/components/foundation/schema.functions';
import type { SpotifyPodcastEpisodeType, SpotifyPodcastSeriesType } from '@/components/integrations/spotify.functions';

describe('Podcast Schema Functions', () => {
	describe('mapPodcastEpisodeToSchema', () => {
		it('should map a podcast episode to PodcastEpisode schema', () => {
			const episode: SpotifyPodcastEpisodeType = {
				title: 'How AI Can Help Small Businesses',
				description: 'A discussion about AI in business',
				link: 'https://example.com/episode/1',
				guid: 'guid-001',
				creator: 'John Doe',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: {
					url: 'https://example.com/audio/episode1.mp3',
					type: 'audio/mpeg',
					length: '4469592',
				},
				summary: 'A deep dive into AI tools for business',
				explicit: false,
				duration: '00:45:30',
				image: 'https://example.com/image.jpg',
				episode: '1',
				episodeType: 'full',
			};

			const schema = mapPodcastEpisodeToSchema(episode);

			expect(schema['@context']).toBe('https://schema.org');
			expect(schema['@type']).toBe('PodcastEpisode');
			expect(schema.url).toBe('https://example.com/episode/1');
			expect(schema.name).toBe('How AI Can Help Small Businesses');
			expect(schema.author?.name).toBe('John Doe');
		});

		it('should handle episodes without creator', () => {
			const episode: SpotifyPodcastEpisodeType = {
				title: 'Episode 1',
				description: 'Test',
				link: 'https://example.com/1',
				guid: 'guid-1',
				creator: '',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: { url: 'https://example.com/audio.mp3', type: 'audio/mpeg', length: '1000' },
				summary: 'Test summary',
				explicit: false,
				duration: '30:00',
				image: 'https://example.com/image.jpg',
				episode: '1',
				episodeType: 'full',
			};

			const schema = mapPodcastEpisodeToSchema(episode);

			expect(schema.author).toBeUndefined();
		});

		it('should strip HTML entities from title and description', () => {
			const episode: SpotifyPodcastEpisodeType = {
				title: 'How &amp; Why AI Works',
				description: 'Discussion &lt;about&gt; AI',
				link: 'https://example.com/1',
				guid: 'guid-1',
				creator: 'Creator',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: { url: 'https://example.com/audio.mp3', type: 'audio/mpeg', length: '1000' },
				summary: 'Test &nbsp;summary',
				explicit: false,
				duration: '30:00',
				image: 'https://example.com/image.jpg',
				episode: '1',
				episodeType: 'full',
			};

			const schema = mapPodcastEpisodeToSchema(episode);

			expect(schema.name).toBe('How & Why AI Works');
			expect(schema.description).toBeDefined();
		});

		it('should use summary as description when available', () => {
			const episode: SpotifyPodcastEpisodeType = {
				title: 'Episode 1',
				description: 'Raw description',
				link: 'https://example.com/1',
				guid: 'guid-1',
				creator: 'Creator',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: { url: 'https://example.com/audio.mp3', type: 'audio/mpeg', length: '1000' },
				summary: 'Clean summary',
				explicit: false,
				duration: '30:00',
				image: 'https://example.com/image.jpg',
				episode: '1',
				episodeType: 'full',
			};

			const schema = mapPodcastEpisodeToSchema(episode);

			expect(schema.description).toContain('Clean summary');
		});
	});

	describe('mapPodcastSeriesToSchema', () => {
		it('should map podcast series metadata to PodcastSeries schema', () => {
			const series: SpotifyPodcastSeriesType = {
				title: 'Tech Podcast',
				description: 'A podcast about technology',
				link: 'https://example.com/podcast',
				image: 'https://example.com/logo.jpg',
				author: 'Jane Smith',
				generator: 'Anchor Podcasts',
				lastBuildDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				copyright: '© 2026 Jane Smith',
				language: 'en',
				iTunesAuthor: 'Jane Smith',
				summary: 'A podcast about technology',
				type: 'episodic',
				owner: { name: 'Jane Smith', email: 'jane@example.com' },
				explicit: 'false',
				category: 'Technology',
			};

			const schema = mapPodcastSeriesToSchema(series);

			expect(schema['@context']).toBe('https://schema.org');
			expect(schema['@type']).toBe('PodcastSeries');
			expect(schema.name).toBe('Tech Podcast');
			expect(schema.description).toBe('A podcast about technology');
			expect(schema.url).toBe('https://example.com/podcast');
			expect(schema.image).toBe('https://example.com/logo.jpg');
			expect(schema.author?.name).toBe('Jane Smith');
		});

		it('should handle series without author', () => {
			const series: SpotifyPodcastSeriesType = {
				title: 'Simple Podcast',
				description: '',
				link: '',
				generator: '',
				lastBuildDate: '',
				author: '',
				copyright: '',
				language: '',
				iTunesAuthor: '',
				summary: '',
				type: '',
				owner: { name: '', email: '' },
				explicit: '',
				category: '',
				image: '',
			};

			const schema = mapPodcastSeriesToSchema(series);

			expect(schema.name).toBe('Simple Podcast');
			expect(schema.author).toBeUndefined();
		});

		it('should strip HTML entities from series title', () => {
			const series: SpotifyPodcastSeriesType = {
				title: 'Tech &amp; Innovation &nbsp;Podcast',
				description: '',
				link: '',
				generator: '',
				lastBuildDate: '',
				author: '',
				copyright: '',
				language: '',
				iTunesAuthor: '',
				summary: '',
				type: '',
				owner: { name: '', email: '' },
				explicit: '',
				category: '',
				image: '',
			};

			const schema = mapPodcastSeriesToSchema(series);

			expect(schema.name).toBe('Tech & Innovation Podcast');
		});
	});

	describe('Schema Structure Validation', () => {
		it('should produce valid PodcastEpisode schema structure', () => {
			const episode: SpotifyPodcastEpisodeType = {
				title: 'Episode 1',
				description: 'Test',
				link: 'https://example.com/1',
				guid: 'guid-1',
				creator: 'Creator',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: { url: 'https://example.com/audio.mp3', type: 'audio/mpeg', length: '1000' },
				summary: 'Test summary',
				explicit: false,
				duration: '30:00',
				image: 'https://example.com/image.jpg',
				episode: '1',
				episodeType: 'full',
			};

			const schema = mapPodcastEpisodeToSchema(episode) as PodcastEpisodeSchema;

			expect(schema['@context']).toBe('https://schema.org');
			expect(schema['@type']).toBe('PodcastEpisode');
			expect(schema.url).toBeTruthy();
			expect(schema.name).toBeTruthy();
		});

		it('should produce valid PodcastSeries schema structure', () => {
			const series: SpotifyPodcastSeriesType = {
				title: 'Podcast',
				description: '',
				link: '',
				generator: '',
				lastBuildDate: '',
				author: '',
				copyright: '',
				language: '',
				iTunesAuthor: '',
				summary: '',
				type: '',
				owner: { name: '', email: '' },
				explicit: '',
				category: '',
				image: '',
			};

			const schema = mapPodcastSeriesToSchema(series) as PodcastSeriesSchema;

			expect(schema['@context']).toBe('https://schema.org');
			expect(schema['@type']).toBe('PodcastSeries');
			expect(schema.name).toBe('Podcast');
		});

		it('should include AudioObject for episodes with enclosure', () => {
			const episode: SpotifyPodcastEpisodeType = {
				title: 'Episode 1',
				description: 'Test',
				link: 'https://example.com/1',
				guid: 'guid-1',
				creator: 'Creator',
				pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
				enclosure: { url: 'https://example.com/audio.mp3', type: 'audio/mpeg', length: '1000' },
				summary: 'Test summary',
				explicit: false,
				duration: '30:00',
				image: 'https://example.com/image.jpg',
				episode: '1',
				episodeType: 'full',
			};

			const schema = mapPodcastEpisodeToSchema(episode);

			expect(schema.audio).toBeDefined();
			expect(schema.audio?.['@type']).toBe('AudioObject');
			expect(schema.audio?.contentUrl).toBe('https://example.com/audio.mp3');
		});
	});
});
