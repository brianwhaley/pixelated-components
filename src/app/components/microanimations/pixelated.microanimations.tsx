
// import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from "prop-types";
import './pixelated.microanimations.css';

/* ========== MICRO ANIMATIONS ========== */
MicroAnimations.propTypes = {
	imgtwist: PropTypes.bool,
	buttonring: PropTypes.bool,
	scrollfadeElements: PropTypes.string,
};
export type MicroAnimationsType = InferProps<typeof MicroAnimations.propTypes> & { [key: string]: unknown };
export function MicroAnimations(props: MicroAnimationsType) {
	// const debug = true ;
	const body = document.body;
	for (const propName in props) {
		if (Object.prototype.hasOwnProperty.call(props, propName)) {
			if (props[propName] === true) {
				body.classList.add(propName);
			}
		}
	}
	if (props.scrollfadeElements) ScrollFade(props.scrollfadeElements as string);
}

function ScrollFade(elements: string) {
	const options = {
		root: null, // Observes intersection with the viewport
		rootMargin: "0px 0px -100px 0px", // Shrinks the top of the root by 200px
		threshold: 0 // Triggers when any part of the element intersects the adjusted root
	};
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
			// if (entry.intersectionRatio > 0.5) {
			// Add the animation class when the element enters the viewport
				entry.target.classList.add('scrollfade');
				entry.target.classList.remove('hidden');
				// Optionally, stop observing once animated if you only want it to animate once
				observer.unobserve(entry.target);
			} else {
				// Optionally, remove the animation class if you want it to re-animate on re-entry
				// entry.target.classList.remove('hidden');
				// entry.target.classList.remove('scrollfade');
			}
		});
	}, options);
	// Select the elements you want to observe and initially hide them
	const elementsToAnimate = document.querySelectorAll(elements);
	console.log(elements);
	console.log(elementsToAnimate);
	elementsToAnimate.forEach((element) => {
		element.classList.add('hidden'); // Apply initial hidden state
		observer.observe(element); // Start observing each element
	});
}
