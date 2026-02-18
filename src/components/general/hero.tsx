
import React, { useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SmartImage } from '@pixelated-tech/components';
import "./hero.css";

/**
 * Hero — Full-width hero section rendered using a background image.
 *
 * @param {string} [props.img] - Background image URL (required).
 * @param {string} [props.imgAlt] - Alternative text for the background image (optional).
 * @param {string} [props.imgId] - ID for the hero section (optional).
 * @param {oneOf} [props.variant] - Layout variant: 'static' (background image only) or 'anchored' (anchored content).
 * @param {oneOfType} [props.height] - Height for the hero (e.g., '60vh' or a numeric pixel value).
 * @param {node} [props.children] - Optional content rendered inside the hero container.
 * 
 * STATIC works as expected on desktop and mobile
 * ANCHORED works as expected on desktop. mobile does not anchor and image is full size
 * ANCHORED-DIV works mostly as expected on desktop and mobile (only see the last hero image)
 * ANCHORED-IMG works as expected on desktop and mobile, but requires JS
 */
Hero.propTypes = {
	/** Background image URL (required) */
	img: PropTypes.string.isRequired,
	/** Alternative text for the background image (optional) */
	imgAlt: PropTypes.string,
	/** ID for the hero section */
	imgId: PropTypes.string,
	/** Layout variant: 'static' or 'anchored' */
	variant: PropTypes.oneOf(['static','anchored','anchored-div','anchored-img','sticky']),
	/** Height for hero section (string like '60vh' or number) */
	height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	/** Child nodes to render over the background */
	children: PropTypes.node,
};
export type HeroType = InferProps<typeof Hero.propTypes>;
export function Hero({ img, imgAlt, imgId, variant = 'static', height = '60vh', children }: HeroType) {
	const id = imgId ?? imgAlt ?? img.split('/').pop()?.split('.')[0];

	useEffect(() => {
		const parentContainer = document.getElementById("hero-" + id?.toString());
		const anchorImage = document.getElementById(id?.toString() || '');
		const observerCallback = (entries: IntersectionObserverEntry[]) => {
			entries.forEach(entry => {
				// entry.isIntersecting is true when at least one pixel is visible
				if (!entry.isIntersecting) {
					// If the parent is not intersecting (scrolled off-page), hide the image
					anchorImage?.classList.add('hidden');
				} else {
					// If the parent is intersecting (visible on page), show the image
					anchorImage?.classList.remove('hidden');
				}
			});
		};
		const observer = new IntersectionObserver(observerCallback, {
			root: null, // defaults to the browser viewport
			rootMargin: '0px',
			threshold: 0.0
		});
		if ( variant === 'anchored-img' && parentContainer ) {
			observer.observe(parentContainer);
		}
	}, []);

	if(variant === 'anchored-div') {
		return (
			<>
				<div id={id} className={"hero" + (variant ? " " + variant : '')} style={{ height: height ?? '60vh' }}>
					<div id={id + "-bg"} className="hero-div-bg-img" style={{backgroundImage: `url(${img})`}} />
					{ children }
				</div>
			</>
		);
	} else if(variant === 'anchored-img') {
		return (
			<>
				<div className={"hero" + (variant ? " " + variant : '')} id={"hero-" + id?.toString()}>
					<SmartImage src={img} alt={imgAlt || ''} id={id?.toString() || ''} quality={100} width="1000px" style={{height: height ?? '60vh'}} />
					{ children }
				</div>
			</>
		);
	} else {
		return (
			<>
				<div id={id} className={"hero" + (variant ? " " + variant : '')} 
					style={{ backgroundImage: `url(${img})`, height: height ?? '60vh' }}>
					{ children }
				</div>
			</>
		);
	}
}
