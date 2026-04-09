import React from 'react';
import PropTypes, { InferProps } from "prop-types";
import { observeIntersection, isElementPartiallyInViewport } from './intersection-observer';
import './microinteractions.css';

/* ========== MICRO ANIMATIONS ========== */

/**
 * MicroInteractions handles global site animations and interactions.
 * It is typically called once in a top-level component or effect.
 * 
 * @param props - Configuration props for enabling/disabling interactions
 * @returns A cleanup function if scrollfadeElements is used
 */
/**
 * MicroInteractions — enables or disables lightweight UI micro-interactions by toggling body classes and initializing scroll-fade behavior.
 *
 * @param {boolean} [props.buttonring] - Enable pulsing ring animations on buttons.
 * @param {boolean} [props.cartpulse] - Enable cart pulse animation for add-to-cart actions.
 * @param {boolean} [props.formglow] - Enable focus-glow styles for form controls.
 * @param {boolean} [props.grayscalehover] - Enable grayscale-to-color hover effects on images.
 * @param {boolean} [props.imgscale] - Enable subtle image scaling on hover.
 * @param {boolean} [props.imgtwist] - Enable small rotation animation on hover for images.
 * @param {boolean} [props.imghue] - Enable hue-shift effects on hover for images.
 * @param {boolean} [props.simplemenubutton] - Enable simplified menu button microinteractions.
 * @param {string} [props.scrollfadeElements] - CSS selector for elements to apply scroll-fade animations to.
 */
MicroInteractions.propTypes = {
/** Enable ring animation on buttons. */
	buttonring: PropTypes.bool,
	/** Enable pulse animation on cart icon or similar. */
	cartpulse: PropTypes.bool,
	/** Enable glow effects on focused form elements. */
	formglow: PropTypes.bool,
	/** Enable grayscale hover-to-color transitions on elements. */
	grayscalehover: PropTypes.bool,
	/** Enable scale-up animation on image hover. */
	imgscale: PropTypes.bool,
	/** Enable slight twist/rotation on image hover. */
	imgtwist: PropTypes.bool,
	/** Enable hue-shift color changes on hover. */
	imghue: PropTypes.bool,
	/** Toggle simplified menu button interactions. */
	simplemenubutton: PropTypes.bool,
	/** Selector for elements that should receive the scroll-fade animation. */
	scrollfadeElements: PropTypes.string,
};
export type MicroInteractionsType = InferProps<typeof MicroInteractions.propTypes>;
export function MicroInteractions(props: MicroInteractionsType) {
	const body = document.body;
	
	for (const propName in props) {
		if (Object.prototype.hasOwnProperty.call(props, propName) && propName !== 'scrollfadeElements') {
			if ((props as any)[propName] === true) {
				body.classList.add(propName);
			} else if ((props as any)[propName] === false) {
				body.classList.remove(propName);
			}
		}
	}

	if (props.scrollfadeElements) {
		return ScrollFade(props.scrollfadeElements as string);
	}
}

/**
 * Applies a fade-in animation to elements as they enter the viewport
 * @param elements - CSS selector for elements to animate
 * @returns Cleanup function for the intersection observer
 */
function ScrollFade(elements: string) {
	const elementsToAnimate = document.querySelectorAll(elements);
	
	// Initial state setup
	elementsToAnimate.forEach((element) => {
		if (isElementPartiallyInViewport(element)) {
			// If already in viewport, make sure it's visible without animation
			element.classList.remove('hidden');
			element.classList.remove('scrollfade');
		} else {
			// Apply initial hidden state to elements NOT on the screen
			element.classList.add('hidden');
		}
	});

	// Setup observer for elements not yet visible
	const cleanup = observeIntersection(
		elements,
		(entry, observer) => {
			if (entry.isIntersecting) {
				const element = entry.target;
				
				// Only animate if it was hidden
				if (element.classList.contains('hidden')) {
					element.classList.add('scrollfade');
					element.classList.remove('hidden');
					// Stop observing after animation triggers
					observer.unobserve(element);
				}
			}
		},
		{
			rootMargin: "0px 0px -100px 0px",
			threshold: 0
		}
	);

	return cleanup;
}
