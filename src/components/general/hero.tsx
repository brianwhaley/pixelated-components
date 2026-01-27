
import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import "./hero.css";

Hero.propTypes = {
	img: PropTypes.string.isRequired,
	// imgAlt: PropTypes.string.isRequired,
	variant: PropTypes.oneOf(['static','anchored']),
	height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
