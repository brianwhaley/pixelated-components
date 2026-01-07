
'use client';

import React from 'react';
import PropTypes, { InferProps } from "prop-types";
import { usePixelatedConfig } from '../config/config.client';
import { SmartImage } from './smartimage';
import "../../css/pixelated.grid.scss";
import "./timeline.css";

// https://www.w3schools.com/howto/howto_css_timeline.asp

Timeline.propTypes = {
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

TimelineItem.propTypes = {
	title: PropTypes.string.isRequired,
	content: PropTypes.string,
	image: PropTypes.string,
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
				        { /* <img src={props.image ?? undefined} title={props.title} alt={props.title} /> */ }
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
