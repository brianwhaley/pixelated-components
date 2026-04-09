"use client";

import React from "react";
// import { useEffect } from "react";
import PropTypes, { InferProps } from "prop-types";
import { usePixelatedConfig } from "../config/config.client";


/* 
// gtag("config", "UA-2370059-2"); // pixelatedviews.com
// gtag("config", 'G-1J1W90VBE1'); // pixelated.tech
// // gtag("config", 'AW-17721931789'); // pixelated.tech Google Ads
// gtag("config", 'G-B1NZG3YT9Y'); // pixelvivid.com
// gtag("config", 'G-K5QDEDTRB4'); // brianwhaley.com
*/


declare global {
	interface Window {
		dataLayer?: any[];
		gtag?: (...args: any[]) => void;
	}
}


function isGA() {
	const hasGtag = typeof window.gtag === 'function';
	const hasDataLayer = typeof window.dataLayer !== 'undefined' && Array.isArray(window.dataLayer);
	const hasGAScript = !!(document.querySelector('script[src*="googletagmanager.com/gtag/js"]'));
	const hasGAScriptID = !!(document.querySelector('script#ga'));
	const hasGAInitScriptID = !!(document.querySelector('script#ga-init'));
	return ( hasGtag || hasDataLayer || hasGAScript || hasGAScriptID || hasGAInitScriptID ) ;
}


/**
 * GoogleAnalytics — Inject Google Analytics gtag script and initialize with the given measurement id.
 *
 * @param {string} [props.id] - Google Analytics measurement ID (e.g., 'G-XXXX') or omitted to use provider config.
 */
GoogleAnalytics.propTypes = {
/** Google Analytics measurement ID */
	id: PropTypes.string,
};
export type GoogleAnalyticsType = InferProps<typeof GoogleAnalytics.propTypes>;
export function GoogleAnalytics( props: GoogleAnalyticsType ) {
	const config = usePixelatedConfig();
	const id = props.id || config?.googleAnalytics?.id;
	const adId = config?.googleAnalytics?.adId;
	
	if (!id) {
		throw new Error('Google Analytics ID not provided. Set id prop or ensure PixelatedServerConfigProvider is configured with googleAnalytics.id.');
	}
	
	if(typeof window === 'undefined'){ return; }
	if(typeof document === 'undefined'){ return; }
	if(isGA()){ return; }
	const gaSRC = "https://www.googletagmanager.com/gtag/js?id=" + id;
	// useEffect(() => {
	// INIT GA TAG TO PAGE
	const gaInit = document.createElement("script");
	gaInit.setAttribute("id", "ga-init");
	gaInit.type = "text/javascript";
	// could also be InnerHTML, but not innerText
	gaInit.text = `
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag(){ window.dataLayer.push(arguments); }
window.gtag('js', new Date());
window.gtag('config', '${id}');
${adId ? `window.gtag('config', '${adId}');` : ''}
`;
	document.head.appendChild(gaInit);
	// INSTALL GA SCRIPT
	const ga = document.createElement("script");
	ga.setAttribute("id", "ga");
	ga.type = "text/javascript";
	ga.async = true;
	ga.src = gaSRC;
	document.head.appendChild(ga);
	// }, []); 
	return (
		<div className="ga" suppressHydrationWarning />
	);
}
/**
 * GoogleAnalyticsEvent — Trigger a one-off Google Analytics event using gtag.
 *
 * @param {string} [props.event_name] - Event name to send to GA (required).
 * @param {object} [props.event_parameters] - Parameters associated with the event (required).
 */
GoogleAnalyticsEvent.propTypes = {
/** Event name for gtag */
	event_name: PropTypes.string.isRequired,
	/** Event parameter object */
	event_parameters: PropTypes.object.isRequired,
};
export type GoogleAnalyticsEventType = InferProps<typeof GoogleAnalyticsEvent.propTypes>;
export function GoogleAnalyticsEvent( props: GoogleAnalyticsEventType ) {
	if(typeof window === 'undefined'){ return; }
	if(typeof document === 'undefined'){ return; }
	// if(isGA()){ 
	const ga_evt = document.createElement("script");
	ga_evt.setAttribute("id", "ga-event");
	ga_evt.type = "text/javascript";
	ga_evt.async = true;
	ga_evt.innerHTML = `gtag('event', '${props.event_name}', ${JSON.stringify(props.event_parameters)});`;
	document.head.appendChild(ga_evt);
	// }
	return ( null );
}
