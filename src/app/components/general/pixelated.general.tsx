import React from 'react';
import PropTypes from 'prop-types';
import "./pixelated.general.css";

interface GenericHeader {
	title: string,
	url?: string
}

/* ========== CALLOUT HEADER ========== */
export function PageHeader(props: GenericHeader) {
	const calloutTarget = props.url && props.url.substring(0, 4).toLowerCase() === 'http' ? '_blank' : '_self';
	return (
		<>
			{props.url
				? <a href={props.url} target={calloutTarget} rel="noopener noreferrer"><h2 className="pageTitle">{props.title}</h2></a>
				: <h1 className="pageTitle">{props.title}</h1>
			}
		</>
	);
}
PageHeader.propTypes = {
	title: PropTypes.string.isRequired,
	url: PropTypes.string
};