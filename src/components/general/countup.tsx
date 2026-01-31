"use client";

import React, { useEffect, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { useIntersectionObserver } from '@pixelated-tech/components';
import "./countup.css";

/**
 * CountUp Component - Animates a count from a starting number to an ending number over a specified duration.
 * @param id - The ID for the count element.
 * @param pre - Text to display before the count.
 * @param post - Text to display after the count.
 * @param start - The starting number of the count.
 * @param end - The ending number of the count.
 * @param duration - The duration of the count in milliseconds.
 * @param decimals - Number of decimal places to display.
 * @param content - Additional content to display below the count.
 */
CountUp.propTypes = {
	id: PropTypes.string.isRequired,
	pre: PropTypes.string,
	post: PropTypes.string,
	start: PropTypes.number.isRequired,
	end: PropTypes.number.isRequired,
	duration: PropTypes.number.isRequired,
	decimals: PropTypes.number,
	content: PropTypes.string,
};
export type CountUpType = InferProps<typeof CountUp.propTypes>;
export function CountUp({ id, pre = '', post = '', start, end, duration, decimals = 0, content }: CountUpType) {
	
	const decimalize = (val: number) => decimalPlaces > 0 ? val.toFixed(decimalPlaces) : Math.floor(val).toString();
	const decimalPlaces = decimals ?? 0;
	const [ counter, setCounter ] = useState<string>(decimalize(start));
	const intervalMs = 16; // ~60fps

	const [isVisible, setIsVisible] = useState(false);
	const containerRef = useIntersectionObserver(
		(entry: IntersectionObserverEntry) => {
			if (entry.isIntersecting) setIsVisible(true);
		},
		{ 
			rootMargin: "0px 0px -100px 0px", // same as scrollfade
			threshold: 0, // same as scrollfade
			disconnectAfterIntersection: true } // fires once
	) as React.RefObject<HTMLDivElement>;

	useEffect(() => {
		if (!isVisible) return;
		const steps = Math.max(1, Math.round(duration / intervalMs));
		const step = (end - start) / steps;
		let current = start;
		const timer = setInterval(() => {
			current += step;
			const done = (step >= 0) ? current >= end : current <= end;
			if (done) {
				setCounter(decimalize(end));
				clearInterval(timer);
			} else {
				setCounter(decimalize(current));
			}
		}, intervalMs);
	}, [isVisible]);

	return (
		<>
			<div ref={containerRef} className="countup">
				<span className='countup-pre'>{pre}</span>
				<span id={id} className='countup-counter'>{counter}</span>
				<span className='countup-post'>{post}</span>
				<p>{content}</p>
			</div>
		</>
	); 
}
