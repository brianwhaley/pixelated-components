"use client";

import React, { useEffect } from 'react';
import { PageTitleHeader } from '@pixelated-tech/components';
import { PageSection } from '@pixelated-tech/components';
import { MicroInteractions } from "@pixelated-tech/components";
import { BlogPostList , type BlogPostType, getWordPressItems } from '@pixelated-tech/components';

const wpSite = "blog.oaktree-landscaping.com";

export default function Blog() {

	const [blogPosts, setBlogPosts] = React.useState<BlogPostType[]>([]);
	useEffect(() => {
		getWordPressItems({ site: wpSite }).then((posts) => {
			setBlogPosts(posts ?? []);
		});
	}, []); 

	useEffect(() => {
		MicroInteractions({ 
			scrollfadeElements: '.tile , .blog-post-summary',
		});
	}, []); 

	return (
		<>
			<PageTitleHeader title="Pixelated Technologies Blog Posts" />
			<PageSection columns={1} maxWidth="1024px" id="blog-section">
				<BlogPostList site={wpSite} posts={blogPosts} showCategories={false} />
			</PageSection>
		</>
	);
}
