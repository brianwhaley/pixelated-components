'use client';

import React, { useEffect, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { usePixelatedConfig } from "../config/config.client";
import { SmartImage } from '../general/smartimage';
import {PageGridItem } from '../general/semantic';
import type { BlogPostType } from './wordpress.functions';
import { getWordPressItems } from './wordpress.functions';
import { Loading, ToggleLoading } from '../general/loading';

import "./wordpress.css";

// https://microformats.org/wiki/h-entry

function decodeString(str: string){
	const textarea = document.createElement('textarea');
	textarea.innerHTML = str;
	return textarea.value;
}


/**
 * BlogPostList — Render a list of WordPress posts. If `posts` are provided they are used directly; otherwise the component will fetch posts from the configured WordPress endpoint.
 *
 * @param {string} [props.site] - WordPress site identifier (overrides provider config).
 * @param {string} [props.baseURL] - Base URL for WordPress API if not using site config.
 * @param {number} [props.count] - Maximum number of posts to fetch/display.
 * @param {array} [props.posts] - Optional pre-fetched posts to render (bypasses remote fetch).
 * @param {boolean} [props.showCategories] - Whether to show category icons for each post.
 */
BlogPostList.propTypes = {
/** WordPress site identifier */
	site: PropTypes.string,
	/** Optional WordPress base URL */
	baseURL: PropTypes.string,
	/** Max number of posts to fetch/display */
	count: PropTypes.number,
	/** Optional array of pre-fetched posts */
	posts: PropTypes.array,
	/** Show category icons next to posts */
	showCategories: PropTypes.bool,
};
export type BlogPostListType = InferProps<typeof BlogPostList.propTypes>;
export function BlogPostList(props: BlogPostListType) {
	
	const { site: propSite, baseURL: propBaseURL, count, posts: cachedPosts, showCategories = true } = props;
	const config = usePixelatedConfig();
	const site = propSite ?? config?.wordpress?.site;
	const baseURL = propBaseURL ?? config?.wordpress?.baseURL;
	const [posts, setPosts] = useState<BlogPostType[]>(cachedPosts ?? []);

	useEffect(() => {
		// If posts are provided, use them directly without fetching
		if (cachedPosts && cachedPosts.length > 0) {
			const sorted = cachedPosts.sort((a: BlogPostType, b: BlogPostType) => ((a.date ?? '') < (b.date ?? '')) ? 1 : -1);
			setPosts(sorted);
			return;
		}

		// If no site is configured, don't fetch
		if (!site) {
			console.warn('WordPress site not configured. Provide site prop or wordpress.site in config.');
			return;
		}

		// Otherwise, fetch from WordPress
		ToggleLoading({show: true});
		(async () => {
			const params: { site: string; count?: number; baseURL?: string } = { site };
			if (count !== null && count !== undefined) params.count = count;
			if (baseURL !== null && baseURL !== undefined) params.baseURL = baseURL;
			const data = (await getWordPressItems(params)) ?? [];
			const sorted = data.sort((a: BlogPostType, b: BlogPostType) => ((a.date ?? '') < (b.date ?? '')) ? 1 : -1);
			setPosts(sorted);
			ToggleLoading({show: false});
		})();
	}, [site, baseURL, count, cachedPosts]);

	return (
		<>
			<Loading />
			{posts.map((post: BlogPostType) => (
				<PageGridItem key={post.ID}>
					<BlogPostSummary
						ID={post.ID}
						title={post.title}
						date={post.date}
						excerpt={post.excerpt}
						URL={post.URL}
						categories={post.categories}
						featured_image={post.featured_image}
						showCategories={showCategories}
					/>
				</PageGridItem>
			))}
		</>
	);
}

/**
 * BlogPostSummary — Render a compact summary card for a single WordPress post.
 *
 * @param {oneOfType} [props.ID] - Post ID (string or number).
 * @param {string} [props.title] - Post title.
 * @param {string} [props.date] - Post publish date (ISO string).
 * @param {string} [props.excerpt] - HTML excerpt to display as the summary.
 * @param {string} [props.URL] - Canonical URL for the post.
 * @param {object} [props.categories] - Categories object (keys -> category name) used to derive icons.
 * @param {string} [props.featured_image] - URL of the post's featured image.
 * @param {boolean} [props.showCategories] - Whether to render category icons beneath the summary.
 */
BlogPostSummary.propTypes = {
/** Post ID (string or number) */
	ID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	/** Post title */
	title: PropTypes.string,
	/** Post publish date (ISO string) */
	date: PropTypes.string,
	/** HTML excerpt */
	excerpt: PropTypes.string,
	/** Canonical URL for the post */
	URL: PropTypes.string,
	/** Categories object used for icons */
	categories: PropTypes.object,
	/** Featured image URL */
	featured_image: PropTypes.string,
	/** Show categories flag */
	showCategories: PropTypes.bool,
};
export type BlogPostSummaryType = InferProps<typeof BlogPostSummary.propTypes>;
export function BlogPostSummary(props: BlogPostSummaryType) {
	const myCategoryImages = props.categories ? Object.entries(props.categories).map(
		([category, index]) => [category?.trim().toLowerCase().replace(/[ /]+/g, '-'), index]
	).sort() : [];
	const config = usePixelatedConfig();
	const myExcerpt = props.excerpt ? decodeString(props.excerpt).replace(/\[…\]/g, '<a href="' + (props.URL || '') + '" target="_blank" rel="noopener noreferrer">[…]</a>') : '';
	return (
		<div className="blog-post-summary" key={props.ID}>
			<article className="h-entry">
				<h2 className="p-name">
					<a className="u-url blog-post-url" href={props.URL || ''} target="_blank" rel="noopener noreferrer">
						{props.title ? decodeString(props.title) : ''}
					</a>
				</h2>
				<div className="dt-published">Published: {props.date ? new Date(props.date).toLocaleDateString() : ''}</div>
				{ props.featured_image ? (
					<div className="article-body row-12col">
						<div className="article-featured-image grid-s1-e4">
							<SmartImage className="u-photo" src={props.featured_image} alt={props.title ? decodeString(props.title) : ''} title={props.title ? decodeString(props.title) : ''}
								style={{}}
								cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
								cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
								cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined} />
						</div>
						<div className="article-excerpt grid-s4-e13">
							<div className="p-summary" dangerouslySetInnerHTML={{ __html: myExcerpt }} />
						</div>
					</div>
				) : 
					<div className="article-excerpt grid-s1-e13">
						<div className="p-summary" dangerouslySetInnerHTML={{ __html: myExcerpt }} />
					</div>
				}
				{props.showCategories !== false && (
					<div>Categories: 
						{ myCategoryImages.map(([categoryImg, index]) => (
							<span className="p-category" key={categoryImg + "-" + index}>
								<SmartImage src={`/images/icons/${categoryImg}.png`} title={String(categoryImg)} alt={String(categoryImg)} 
									cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
									cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
									cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined} />
							</span>
						))}
					</div>
				)}
			</article>
		</div>
	);
}



/**
 * BlogPostCategories — Render a compact list of category names or icons for a post.
 *
 * @param {arrayOf} [props.categories] - Array of category strings to render.
 */
BlogPostCategories.propTypes = {
/** Array of category names */
	categories: PropTypes.arrayOf(PropTypes.string),
};
export type BlogPostCategoriesType = InferProps<typeof BlogPostCategories.propTypes>;
export function BlogPostCategories(props: BlogPostCategoriesType) {
	if(!props.categories || props.categories.length === 0) {
		return null;
	}
	const myCategoryImages = props.categories.map(
		(category) => (category && category !== "Uncategorized") 
			? category.trim().toLowerCase().replace(/[ /]+/g, '-') 
			: undefined
	).filter(Boolean).sort();
	const config = usePixelatedConfig();
	return (
		<div className="blog-post-categories">
			<div>Categories: </div>
			{ myCategoryImages.map((categoryImg, index) => 
				categoryImg ? (
					<span className="p-category" key={categoryImg + "-" + index}>
						<SmartImage className="u-photo" src={`/images/icons/${categoryImg}.png`} title={String(categoryImg)} alt={String(categoryImg)}
							cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
							cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
							cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined} />
					</span>
				) : null
			)}
		</div>
	);
}
