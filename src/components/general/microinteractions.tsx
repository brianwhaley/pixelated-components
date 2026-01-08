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
MicroInteractions.propTypes = {
	buttonring: PropTypes.bool,
	cartpulse: PropTypes.bool,
	formglow: PropTypes.bool,
	grayscalehover: PropTypes.bool,
	imgscale: PropTypes.bool,
	imgtwist: PropTypes.bool,
	imghue: PropTypes.bool,
	simplemenubutton: PropTypes.bool,
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
