
import React from 'react';
import PropTypes, { InferProps } from "prop-types";
import { PageGridItem } from '@pixelated-tech/components';
import { type SpotifyPodcastEpisodeType } from './spotify.functions';
import { BlogPostSummary } from '@pixelated-tech/components';





function getFirstSentences(str: string | undefined, minLength: number = 300): string {
	if (!str) return '';
	const firstPeriodIndex = str.indexOf('.', minLength);
	if (firstPeriodIndex !== -1) {
		return str.slice(0, firstPeriodIndex + 1);
	}
	return str;
}




/**
 * Component to display a list of podcast episodes.
 * @param props - The properties for the component, including an array of podcast episodes.
 * @returns A React component that renders a list of podcast episodes.
 */
PodcastEpisodeList.propTypes = {
	episodes: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
			link: PropTypes.string.isRequired,
			guid: PropTypes.string.isRequired,
			creator: PropTypes.string.isRequired,
			pubDate: PropTypes.string.isRequired,
			enclosure: PropTypes.shape({
				url: PropTypes.string.isRequired,
				type: PropTypes.string.isRequired,
				length: PropTypes.string.isRequired,
			}).isRequired,
			summary: PropTypes.string.isRequired,
			explicit: PropTypes.bool.isRequired,
			duration: PropTypes.string.isRequired,
			image: PropTypes.string.isRequired,
			episode: PropTypes.string.isRequired,
			episodeType: PropTypes.string.isRequired,
		}).isRequired
	).isRequired
};
export type PodcastEpisodeListType = InferProps<typeof PodcastEpisodeList.propTypes>;
export function PodcastEpisodeList (props: PodcastEpisodeListType) {
	const { episodes } = props;
	return (
		<>
			{episodes.map((episode: SpotifyPodcastEpisodeType) => (
				<PageGridItem key={episode.guid}>
					<BlogPostSummary
						ID={episode.guid}
						title={episode.title}
						date={episode.pubDate}
						excerpt={getFirstSentences(episode.summary)}
						URL={episode.link}
						featured_image={episode.image}
						showCategories={false}
					/>
				</PageGridItem>
			))}
		</>
	);
}
