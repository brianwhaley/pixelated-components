import type { BlogPostType } from '../integrations/wordpress.functions';
import { decode } from 'html-entities';

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

	if (articleBody) {
		schema.articleBody = articleBody;
	}

	if (post.modified) {
		schema.dateModified = post.modified;
	}

	if (post.author) {
		schema.author = {
			'@type': 'Person',
			name: post.author.name,
			url: `https://${new URL(post.URL).hostname}/author/${post.author.login}`,
		};
	}

	return schema;
}