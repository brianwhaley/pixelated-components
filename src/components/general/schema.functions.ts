import type { BlogPostType } from '../integrations/wordpress.functions';
import type { SpotifyPodcastEpisodeType, SpotifyPodcastSeriesType } from '../integrations/spotify.functions';
import { decode } from 'html-entities';




/* ========================================
	BLOG POSTING SCHEMA FUNCTIONS
======================================== */

export interface BlogPostingSchema {
	'@context': string;
	'@type': string;
	url: string;
	headline: string;
	description?: string;
	image?: string;
	datePublished: string;
	dateModified?: string;
	author?: {
		'@type': string;
		name: string;
		url?: string;
	};
	articleBody?: string;
	articleSection?: string;
	keywords?: string[];
	wordCount?: number;
}



/**
 * Converts WordPress REST API blog post to schema.org BlogPosting format
 * @param post WordPress blog post
 * @param includeFullContent Whether to include articleBody (true) or just description (false)
 */
export function mapWordPressToBlogPosting(
	post: BlogPostType,
	includeFullContent: boolean = false
): BlogPostingSchema {
	const cleanContent = (content: string): string => {
		if (!content) return '';
		// Strip HTML tags and decode all HTML entities
		const stripped = content.replace(/<[^>]*>/g, '');
		return decode(stripped).replace(/\[…\]/g, '').trim();
	};
	const description = cleanContent(post.excerpt);
	const articleBody = includeFullContent ? cleanContent(post.content || '') : undefined;
	const schema: BlogPostingSchema = {
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		url: post.URL,
		headline: decode(post.title.replace(/<[^>]*>/g, '')),
		description: description || decode(post.title.replace(/<[^>]*>/g, '')),
		datePublished: post.date,
		image: post.featured_image || post.post_thumbnail?.URL,
		articleSection:
			Array.isArray(post.categories) && post.categories.length > 0
				? post.categories[0]
				: 'Blog',
		keywords: Array.isArray(post.categories) ? post.categories : [],
	};
	if (articleBody) { schema.articleBody = articleBody; }
	if (post.modified) { schema.dateModified = post.modified; }
	if (post.author) {
		schema.author = {
			'@type': 'Person',
			name: post.author.name,
			url: `https://${new URL(post.URL).hostname}/author/${post.author.login}`,
		};
	}
	return schema;
}




/* ========================================
	PODCAST SCHEMA FUNCTIONS
======================================== */

export interface PodcastEpisodeSchema {
	'@context': string;
	'@type': string;
	url: string;
	name: string;
	description?: string;
	image?: string;
	datePublished: string;
	author?: {
		'@type': string;
		name: string;
	};
	audio?: {
		'@type': string;
		contentUrl: string;
		encodingFormat: string;
	};
	duration?: string;
	episodeNumber?: number | string;
	isPartOf?: {
		'@type': string;
		name: string;
		url?: string;
	};
	explicit?: boolean;
}

export interface PodcastSeriesSchema {
	'@context': string;
	'@type': string;
	name: string;
	url?: string;
	description?: string;
	image?: string;
	author?: {
		'@type': string;
		name: string;
	};
	numberOfEpisodes?: number;
}

/**
 * Converts a podcast episode object to schema.org PodcastEpisode format
 * @param episode Podcast episode data
 */
export function mapPodcastEpisodeToSchema(episode: SpotifyPodcastEpisodeType): PodcastEpisodeSchema {
	const cleanContent = (content: string): string => {
		if (!content) return '';
		// Strip HTML tags and decode all HTML entities
		const stripped = content.replace(/<[^>]*>/g, '');
		const decoded = decode(stripped).replace(/\[…\]/g, '').trim();
		// Normalize whitespace: collapse multiple spaces/nbsp into single space
		return decoded.replace(/\s+/g, ' ');
	};
	const description = cleanContent(episode.summary || episode.description);
	const schema: PodcastEpisodeSchema = {
		'@context': 'https://schema.org',
		'@type': 'PodcastEpisode',
		url: episode.link,
		name: cleanContent(episode.title),
		description: description || cleanContent(episode.title),
		datePublished: episode.pubDate,
		image: episode.image,
		explicit: episode.explicit,
	};
	if (episode.creator) {
		schema.author = {
			'@type': 'Person',
			name: episode.creator,
		};
	}
	if (episode.enclosure?.url) {
		schema.audio = {
			'@type': 'AudioObject',
			contentUrl: episode.enclosure.url,
			encodingFormat: episode.enclosure.type || 'audio/mpeg',
		};
	}
	if (episode.duration) { schema.duration = episode.duration; }
	if (episode.episode) { schema.episodeNumber = episode.episode; }
	return schema;
}

/**
 * Converts podcast series metadata to schema.org PodcastSeries format
 * @param series Podcast series data from RSS
 */
export function mapPodcastSeriesToSchema(series: SpotifyPodcastSeriesType): PodcastSeriesSchema {
	const normalizeWhitespace = (text: string): string => {
		return text.replace(/\s+/g, ' ').trim();
	};
	const schema: PodcastSeriesSchema = {
		'@context': 'https://schema.org',
		'@type': 'PodcastSeries',
		name: normalizeWhitespace(decode(series.title)),
		description: series.description ? normalizeWhitespace(decode(series.description)) : undefined,
		url: series.link,
		image: series.image,
	};
	if (series.author) {
		schema.author = {
			'@type': 'Person',
			name: series.author,
		};
	}
	return schema;
}
