'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';

/**
 * SchemaBlogPosting — Inject a JSON-LD <script> tag containing a BlogPosting schema object.
 *
 * @param {object} [props.post] - Structured JSON-LD object representing a blog post (BlogPosting schema).
 */
SchemaBlogPosting.propTypes = {
/** Structured BlogPosting JSON-LD object */
	post: PropTypes.object.isRequired,
};
export type SchemaBlogPostingType = InferProps<typeof SchemaBlogPosting.propTypes>;
export function SchemaBlogPosting(props: SchemaBlogPostingType) {
	const { post } = props;
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(post),
			}}
		/>
	);
}

export default SchemaBlogPosting;
