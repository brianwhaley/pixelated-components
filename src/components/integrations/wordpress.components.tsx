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


BlogPostList.propTypes = {
	site: PropTypes.string,
	baseURL: PropTypes.string,
	count: PropTypes.number,
	posts: PropTypes.array,
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

BlogPostSummary.propTypes = {
	ID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	title: PropTypes.string,
	date: PropTypes.string,
	excerpt: PropTypes.string,
	URL: PropTypes.string,
	categories: PropTypes.object,
	featured_image: PropTypes.string,
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



BlogPostCategories.propTypes = {
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
		<div className="blogPostCategories">
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
