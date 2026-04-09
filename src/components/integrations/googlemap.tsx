import React from "react";
import PropTypes, { InferProps } from "prop-types";
import { usePixelatedConfig } from "../config/config.client";

// https://developers.google.com/maps/documentation/embed/embedding-map


/**
 * GoogleMaps — Embed a Google Maps iframe using the Maps Embed API.
 *
 * @param {string} [props.title] - Accessible iframe title.
 * @param {string} [props.width] - Width of the iframe (e.g., '600' or '100%').
 * @param {string} [props.height] - Height of the iframe (e.g., '400').
 * @param {string} [props.frameBorder] - iframe frameBorder attribute.
 * @param {object} [props.style] - Inline CSS styles applied to the iframe.
 * @param {string} [props.map_mode] - Embed mode (e.g., 'place', 'search', 'directions').
 * @param {string} [props.api_key] - Google Maps API key (falls back to config if omitted).
 * @param {string} [props.parameters] - Additional query parameters for the embed URL (e.g., q=, center=, zoom=).
 */
GoogleMaps.propTypes = {
/** Accessible iframe title */
	title: PropTypes.string,
	/** iframe width (pixels or %) */
	width: PropTypes.string,
	/** iframe height (pixels) */
	height: PropTypes.string,
	/** iframe frameBorder attribute */
	frameBorder: PropTypes.string,
	/** Inline style object for the iframe */
	style: PropTypes.object,
	/** Maps embed mode (required) */
	map_mode: PropTypes.string.isRequired,
	/** Google Maps API key */
	api_key: PropTypes.string,
	/** Additional query parameters for the embed URL */
	parameters: PropTypes.string,
};
export type GoogleMapsType = InferProps<typeof GoogleMaps.propTypes>;
export function GoogleMaps(props: GoogleMapsType) {
	const config = usePixelatedConfig();
	const apiKey = props.api_key || config?.googleMaps?.apiKey;

	return (
		<div className="gmap" suppressHydrationWarning>
			<iframe
				title={props.title || "Google Map"}
				width={props.width || "600"}
				height={props.height || "400"}
				frameBorder={props.frameBorder || "0"}
				style={props.style || { border: 0 } as React.CSSProperties}
				referrerPolicy="no-referrer-when-downgrade"
				src={`https://www.google.com/maps/embed/v1/${props.map_mode}?key=${apiKey}&${props.parameters}`}
				allowFullScreen
			/>
		</div>
	);
}
