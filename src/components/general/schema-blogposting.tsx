import React from 'react';
import PropTypes, { InferProps } from 'prop-types';

SchemaBlogPosting.propTypes = {
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
