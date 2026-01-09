import React from "react";
import PropTypes, { InferProps } from "prop-types";
import { usePixelatedConfig } from "../config/config.client";

// https://developers.google.com/maps/documentation/embed/embedding-map


GoogleMaps.propTypes = {
	title: PropTypes.string,
	width: PropTypes.string,
	height: PropTypes.string,
	frameBorder: PropTypes.string,
	style: PropTypes.object,
	map_mode: PropTypes.string.isRequired,
	api_key: PropTypes.string,
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
