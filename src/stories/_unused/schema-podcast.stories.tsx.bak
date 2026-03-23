import React from 'react';
import { SchemaPodcastEpisode, SchemaPodcastSeries } from '@/components/general/schema';
import {
	mapPodcastEpisodeToSchema,
	mapPodcastSeriesToSchema,
} from '@/components/general/schema.functions';
import type { SpotifyPodcastEpisodeType, SpotifyPodcastSeriesType } from '@/components/integrations/spotify.functions';

export default {
	title: 'General/Schema/Podcast',
	component: SchemaPodcastEpisode,
	argTypes: {
		episode: {
			description: 'PodcastEpisode schema object',
			control: { type: 'object' },
		},
	},
};

const mockEpisode: SpotifyPodcastEpisodeType = {
	title: 'How AI Can Help Small Businesses Thrive',
	description: '<p>When we talk about artificial intelligence, it\'s easy to get caught up in the sci-fi versions of the future, but for a small business owner in 2026, AI is much more practical than that.</p>',
	link: 'https://podcasters.spotify.com/pod/show/pixelated-technologies/episodes/How-AI-Can-Help-e3ftf5r',
	guid: '3e7b2ed5-2946-4343-bdd3-49cf6fb3fd95',
	creator: 'Pixelated Technologies',
	pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
	enclosure: {
		url: 'https://anchor.fm/s/10fc04b98/podcast/play/116357755/audio.mp3',
		type: 'audio/mpeg',
		length: '4469592',
	},
	summary: 'When we talk about artificial intelligence, it\'s easy to get caught up in the sci-fi versions of the future, but for a small business owner in 2026, AI is much more practical.',
	explicit: false,
	duration: '00:04:38',
	image: 'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/45492278/45492278-1772579122316-1fa430ddb1b01.jpg',
	episode: '2',
	episodeType: 'full',
};

const podcastSeries: SpotifyPodcastSeriesType = {
	title: 'The Pixelated Podcast',
	description: 'A podcast about digital transformation and technology for small businesses',
	link: 'https://www.pixelated.tech/podcast',
	image: 'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/45492278/45492278-1772579122316-1fa430ddb1b01.jpg',
	author: 'Pixelated Technologies',
	generator: 'Spotify',
	lastBuildDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
	copyright: '© 2026 Pixelated Technologies',
	language: 'en',
	iTunesAuthor: 'Pixelated Technologies',
	summary: 'A podcast about digital transformation and technology for small businesses',
	type: 'episodic',
	owner: { name: 'Pixelated Technologies', email: 'podcast@pixelated.tech' },
	explicit: 'false',
	category: 'Technology',
};

const episodeSchema = mapPodcastEpisodeToSchema(mockEpisode);
const seriesSchema = mapPodcastSeriesToSchema(podcastSeries);

export const EpisodeSchema = () => <SchemaPodcastEpisode episode={episodeSchema} />;
EpisodeSchema.storyName = 'PodcastEpisode Schema';
EpisodeSchema.parameters = {
	docs: {
		description: {
			story: 'Schema markup for an individual podcast episode. Includes AudioObject for the media file.',
		},
	},
};

export const SeriesSchema = () => <SchemaPodcastSeries series={seriesSchema} />;
SeriesSchema.storyName = 'PodcastSeries Schema';
SeriesSchema.parameters = {
	docs: {
		description: {
			story: 'Schema markup for the podcast series (show). Use on your main podcast landing page.',
		},
	},
};

export const EpisodeWithoutSeries = () => {
	const schema = mapPodcastEpisodeToSchema(mockEpisode);
	return <SchemaPodcastEpisode episode={schema} />;
};
EpisodeWithoutSeries.storyName = 'Episode without Series Reference';

export const MinimalSeries = () => {
	const minimalSeries: SpotifyPodcastSeriesType = {
		title: 'My Podcast',
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
	const schema = mapPodcastSeriesToSchema(minimalSeries);
	return <SchemaPodcastSeries series={schema} />;
};
MinimalSeries.storyName = 'Minimal Series';
