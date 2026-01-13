import React, { useEffect } from "react";
import PropTypes, { InferProps } from 'prop-types';

Calendly.propTypes = {
	url: PropTypes.string.isRequired,
	width: PropTypes.string.isRequired,
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