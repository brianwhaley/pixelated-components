import React from 'react';
import { PodcastEpisodeList, type PodcastEpisodeListType } from '@/components/integrations/spotify.components';
import { type SpotifyPodcastEpisodeType } from '@/components/integrations/spotify.functions';

export default {
	title: 'Integrations/Spotify Podcast',
	component: PodcastEpisodeList,
	argTypes: {
		episodes: {
			description: 'Array of podcast episodes',
			control: { type: 'object' },
		},
	},
};

const mockEpisodes: SpotifyPodcastEpisodeType[] = [
	{
		title: 'How AI Can Help Small Businesses Thrive',
		description: '<p>When we talk about artificial intelligence, it\'s easy to get caught up in the sci-fi versions of the future, but for a small business owner in 2026, AI is much more practical than that—it\'s essentially the ultimate administrative assistant that never sleeps.</p>',
		link: 'https://podcasters.spotify.com/pod/show/pixelated-technologies/episodes/How-AI-Can-Help-Small-Businesses-Thrive-e3ftf5r',
		guid: '3e7b2ed5-2946-4343-bdd3-49cf6fb3fd95',
		creator: 'Pixelated Technologies',
		pubDate: 'Wed, 04 Mar 2026 13:00:00 GMT',
		enclosure: {
			url: 'https://anchor.fm/s/10fc04b98/podcast/play/116357755/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-2-4%2F3f6c4969-88b4-923b-6a60-5bd71c65f053.mp3',
			type: 'audio/mpeg',
			length: '4469592',
		},
		summary: 'When we talk about artificial intelligence, it\'s easy to get caught up in the sci-fi versions of the future, but for a small business owner in 2026, AI is much more practical than that—it\'s essentially the ultimate administrative assistant that never sleeps.',
		explicit: false,
		duration: '00:04:38',
		image: 'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/45492278/45492278-1772579122316-1fa430ddb1b01.jpg',
		episode: '2',
		episodeType: 'full',
	},
	{
		title: 'Why Content Is So Important for Small Businesses',
		description: '<p>When we talk about small business growth in today\'s digital world, there is a word that gets thrown around constantly: content. But if you are a business owner out in the field, it\'s easy to look at that as just another chore on a never-ending to-do list.</p>',
		link: 'https://podcasters.spotify.com/pod/show/pixelated-technologies/episodes/Why-Content-Is-So-Important-for-Small-Businesses-e3fta1p',
		guid: 'f96a2995-cf20-430f-8e3a-8b1f4933f1a6',
		creator: 'Pixelated Technologies',
		pubDate: 'Tue, 03 Mar 2026 23:09:38 GMT',
		enclosure: {
			url: 'https://anchor.fm/s/10fc04b98/podcast/play/116352505/https%3A%2F%2Fd3ctxlq1ktw2nl.cloudfront.net%2Fstaging%2F2026-2-3%2Ffbb89138-84c4-f32a-adc1-f0965a22b558.mp3',
			type: 'audio/mpeg',
			length: '3765748',
		},
		summary: 'When we talk about small business growth in today\'s digital world, there is a word that gets thrown around constantly: content.',
		explicit: false,
		duration: '00:03:54',
		image: 'https://d3t3ozftmdmh3i.cloudfront.net/staging/podcast_uploaded_nologo/45492278/45492278-1772579122316-1fa430ddb1b01.jpg',
		episode: '1',
		episodeType: 'full',
	},
];

const Template = (args: PodcastEpisodeListType) => <PodcastEpisodeList {...args} />;

export const Default: any = Template.bind({});
Default.args = {
	episodes: mockEpisodes,
};
Default.storyName = 'Podcast Episode List';

export const SingleEpisode: any = Template.bind({});
SingleEpisode.args = {
	episodes: [mockEpisodes[0]],
};
SingleEpisode.storyName = 'Single Episode';

export const MultipleEpisodes: any = Template.bind({});
MultipleEpisodes.args = {
	episodes: mockEpisodes,
};
MultipleEpisodes.storyName = 'Multiple Episodes';

export const EmptyList: any = Template.bind({});
EmptyList.args = {
	episodes: [],
};
EmptyList.storyName = 'Empty Podcast List';
