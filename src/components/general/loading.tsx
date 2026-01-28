'use client';

import React from "react";
import PropTypes, { InferProps } from "prop-types";
import "./loading.scss";


/* 
https://signalvnoise.com/posts/2577-loading-spinner-animation-using-css-and-webkit
https://www.andreaverlicchi.eu/blog/css-3-only-spinning-loading-animation/
*/

/* ========== MARKDOWN ========== */

/**
 * Loading — provides a spinner/loading indicator used across the UI.
 *
 * This component renders a CSS spinner; use `ToggleLoading` to control visibility programmatically.
 */
/** Loading.propTypes — No props (component renders a CSS spinner).
 * @param {any} [props] - No props are accepted by Loading.
 */
Loading.propTypes = { /** no props */ };
export type LoadingType = InferProps<typeof Loading.propTypes>;  
export function Loading(props: LoadingType) {	 
	return (
		<>
			<div id="loadingSpinner" className="loading">
				<div className="spinner">
					<div className="bar1"></div>
					<div className="bar2"></div>
					<div className="bar3"></div>
					<div className="bar4"></div>
					<div className="bar5"></div>
					<div className="bar6"></div>
					<div className="bar7"></div>
					<div className="bar8"></div>
					<div className="bar9"></div>
					<div className="bar10"></div>
					<div className="bar11"></div>
					<div className="bar12"></div>
				</div>
			</div>
		</>
	);
}

ToggleLoading.propTypes = {
/** When true shows the global loading spinner; false hides it; omitted toggles the current state. */
	show: PropTypes.bool,
};
export type ToggleLoadingType = InferProps<typeof ToggleLoading.propTypes>;
export function ToggleLoading(props: ToggleLoadingType) {
	if (typeof window === 'undefined' || typeof document === 'undefined') return;
	
	const loadingElem = document.getElementById("loadingSpinner") as HTMLDivElement;
	if (!loadingElem) return;
	
	if (props.show === true) {
		loadingElem.style.display = "inline-block";
	} else if (props.show === false) {
		loadingElem.style.display = "none";
	} else {
		// Toggle behavior
		if (loadingElem.style.display === "none" || !loadingElem.style.display) {
			loadingElem.style.display = "inline-block";
		} else {
			loadingElem.style.display = "none";
		}
	}
}
