
import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import "./hero.css";

/**
 * Hero — Full-width hero section rendered using a background image.
 *
 * @param {string} [props.img] - Background image URL (required).
 * @param {string} [props.imgAlt] - Alternative text for the background image (optional).
 * @param {oneOf} [props.variant] - Layout variant: 'static' (background image only) or 'anchored' (anchored content).
 * @param {oneOfType} [props.height] - Height for the hero (e.g., '60vh' or a numeric pixel value).
 * @param {node} [props.children] - Optional content rendered inside the hero container.
 */
Hero.propTypes = {
	/** Background image URL (required) */
	img: PropTypes.string.isRequired,
	// imgAlt: PropTypes.string.isRequired,
	/** Layout variant: 'static' or 'anchored' */
	variant: PropTypes.oneOf(['static','anchored']),
	/** Height for hero section (string like '60vh' or number) */
	height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	/** Child nodes to render over the background */
	children: PropTypes.node,
};
export type HeroType = InferProps<typeof Hero.propTypes>;
export function Hero({ img, /* imgAlt, */ variant = 'static', height = '60vh', children }: HeroType) {
	return (
		<>
			<div className={"hero" + (variant ? " " + variant : '')} 
				style={{ backgroundImage: `url(${img})`, height: height ?? '60vh' }}>
				{ children }
			</div>
		</>
	);
}
