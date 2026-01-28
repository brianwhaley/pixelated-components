
'use client';

import React from 'react';
import PropTypes, { InferProps } from "prop-types";
import { usePixelatedConfig } from '../config/config.client';
import { SmartImage } from './smartimage';
import "../../css/pixelated.grid.scss";
import "./timeline.css";

// https://www.w3schools.com/howto/howto_css_timeline.asp

/**
 * Timeline — vertical timeline display composed of dated or staged items with optional images and directional layout.
 *
 * @param {arrayOf} [props.timelineData] - Array of items each containing title, content, image, and direction.
 * @param {string} [props.title] - Item title text.
 * @param {string} [props.content] - Item content or description.
 * @param {string} [props.image] - Optional image URL for the timeline item.
 * @param {string} [props.direction] - Visual positioning key (e.g., 'left' or 'right').
 */
Timeline.propTypes = {
/** Array of timeline item objects with title, content, image and direction. */
	timelineData: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string.isRequired,
			content: PropTypes.string,
			image: PropTypes.string,
			direction: PropTypes.string.isRequired
		})
	).isRequired
};
export type TimelineType = InferProps<typeof Timeline.propTypes>;
export function Timeline(props: TimelineType) {

	return (
		<div className="timeline">
			{props.timelineData.map((item, index) =>
				item ? (
					<TimelineItem
						key={index}
						title={item.title ?? ''}
						content={item.content}
						image={item.image}
						direction={item.direction}
					/>
				) : null
			)}
		</div>
	);
}

/**
 * TimelineItem — Single item for the vertical timeline, including optional image and placement direction.
 *
 * @param {string} [props.title] - Title text for the timeline item (required).
 * @param {string} [props.content] - Description or content of the timeline item.
 * @param {string} [props.image] - Optional image URL to display for the item.
 * @param {string} [props.direction] - Visual alignment for the item (e.g., 'left' or 'right').
 */
TimelineItem.propTypes = {
/** Item title */
	title: PropTypes.string.isRequired,
	/** Item content or description */
	content: PropTypes.string,
	/** Optional image URL for the item */
	image: PropTypes.string,
	/** Placement direction ('left'|'right') */
	direction: PropTypes.string.isRequired

};
export type TimelineItemType = InferProps<typeof TimelineItem.propTypes> & { [key: string]: unknown };
export default function TimelineItem(props: TimelineItemType) {
	const config = usePixelatedConfig();
	return (
		<div className={"timeline-container timeline-" + props.direction }>
			<div className="timeline-content">
				<div className="row-3col">
					<div className="grid-s1-e2">
						<SmartImage src={props.image || ""} title={props.title} alt={props.title} 
							cloudinaryEnv={config?.cloudinary?.product_env ?? undefined} />
					</div>
					<div className="grid-s2-e4">
						<h2>{props.title}</h2>
						<p>{props.content}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
