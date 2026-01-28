import React, { useEffect } from "react";
import PropTypes, { InferProps } from 'prop-types';

/**
 * Calendly — Embed a Calendly scheduling widget using the provided URL.
 *
 * @param {string} [props.url] - The Calendly widget URL (required).
 * @param {string} [props.width] - Minimum width for the widget container (e.g., '320px').
 * @param {string} [props.height] - Height for the widget container (e.g., '700px').
 */
Calendly.propTypes = {
/** Calendly widget URL */
	url: PropTypes.string.isRequired,
	/** Minimum width for the widget container */
	width: PropTypes.string.isRequired,
	/** Height for the widget container */
	height: PropTypes.string.isRequired,
};
export type CalendlyType = InferProps<typeof Calendly.propTypes>;
export function Calendly({ url, width, height }: CalendlyType) {

	useEffect(() => {
		const head = document.querySelector("head");
		const script = document.createElement("script");
		script.setAttribute("src", "https://assets.calendly.com/assets/external/widget.js");
		script.setAttribute("type", "text/javascript");
		script.setAttribute("async", "true");
		if (head) head.appendChild(script);
	}, []);

	return (
		<div className="calendly-inline-widget" 
			data-url={url} 
			style={{minWidth: width || "320px", height: height || "700px"}} 
			data-resize="true"
			suppressHydrationWarning={true}>
		</div>
	);
}