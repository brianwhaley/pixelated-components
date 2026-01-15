"use client";

import React, { /* useState, useEffect */ } from "react";
import PropTypes, { InferProps } from 'prop-types';
import { usePixelatedConfig } from "../config/config.client";
import { SmartImage } from './smartimage';

import "./callout.scss";

/* ==================== NOTES ====================
DEFAULT = flexbox layout, no border around callout
BOXED = border around callout
BOXED GRID = applies both
FULL = full width callout with minimal margin and padding
GRID = grid layout
SPLIT = full width split page layout, cannot use LAYOUT (HORIZONTAL / VERTICAL) 
LAYOUT = horizontal or vertical callout, VERTICAL cannot use DIRECTION (LEFT / RIGHT)
DIRECTION = used to place image on left or right side, does not apply to VERTICAL layout

GRID is basic 1/2 GRID shape, needs enhanement
BOXSHAPE has not been complete
==================== NOTES ==================== */

// Define option arrays - used by both PropTypes and form generation
export const variants = ['default', 'boxed', 'boxed grid', 'full', 'grid', 'overlay', 'split'] as const;
export const shapes = ['square', 'bevel', 'squircle', 'round'] as const;
export const layouts = ['horizontal', 'vertical'] as const;
export const directions = ['left', 'right'] as const;

// TypeScript types from the const arrays
export type ShapeType = typeof shapes[number];
export type VariantType = typeof variants[number];
export type LayoutType = typeof layouts[number];
export type DirectionType = typeof directions[number];

Callout.propTypes = {
	variant: PropTypes.oneOf([...variants]),
	boxShape: PropTypes.oneOf([...shapes]),
	layout: PropTypes.oneOf([...layouts]),
	direction: PropTypes.oneOf([...directions]),
	gridColumns: PropTypes.shape({
		left: PropTypes.number,
		right: PropTypes.number
	}),
	url: PropTypes.string,
	img: PropTypes.string,
	imgAlt: PropTypes.string,
	imgShape: PropTypes.oneOf([...shapes]),
	imgClick: PropTypes.func,
	title: PropTypes.string,
	subtitle: PropTypes.string,
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	children: PropTypes.node,
	buttonText: PropTypes.string,
	// SmartImage props
	aboveFold: PropTypes.bool,
	/* cloudinaryEnv: PropTypes.string,
	cloudinaryDomain: PropTypes.string,
	cloudinaryTransforms: PropTypes.string, */
};
export type CalloutType = InferProps<typeof Callout.propTypes>;
export function Callout({
	variant = 'default', 
	boxShape = "squircle", 
	layout = "horizontal", 
	direction = 'left', 
	gridColumns = {left: 1, right: 2},
	url, img, imgAlt, 
	imgShape = 'square', 
	imgClick, 
	title, subtitle, content, children, buttonText,
	aboveFold,
	/* cloudinaryEnv,
	cloudinaryDomain,
	cloudinaryTransforms */ }: CalloutType) {

	const target = url && url.substring(0, 4).toLowerCase() === 'http' ? '_blank' : '_self';

	const friendlyTitle = title ? title.toLowerCase().replace(/\s+/g, '-') : undefined;
	
	const body = <div className="callout-body" >
		{ (title) ? <CalloutHeader title={title} url={url} target={target} /> : null }
		{ (subtitle) ? <div className="callout-subtitle"><h3>{subtitle}</h3></div> : null }
		{ children ? <div className="callout-content">{children}</div> : content ? <div className="callout-content"><>{content}</></div> : null }
		{ url && buttonText 
			? <CalloutButton title={buttonText} url={url} target={target} />
			: url && title 
				? <CalloutButton title={title || ""} url={url} target={target} /> 
				: null 
		}
	</div> ;

	const config = usePixelatedConfig();
	const image =  ( img ) ?
		<div className={"callout-image" + (imgShape ? " " + imgShape : "")} >
			{ (url && !imgClick)
				? <a href={url} target={target} rel={target=="_blank" ? "noopener noreferrer" : ""}>
					<SmartImage 
						src={img} 
						title={title ?? imgAlt ?? undefined} 
						alt={imgAlt ?? title ?? ""} 
						aboveFold={aboveFold}
						cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
						cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
						cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined}
						suppressHydrationWarning 
					/>
				</a>
				: (url && imgClick)
					? <SmartImage 
						src={img} 
						title={title ?? imgAlt ?? undefined} 
						alt={imgAlt ?? title ?? ""} 
						onClick={(event: React.MouseEvent<HTMLImageElement, MouseEvent>) => imgClick(event, url)}
						aboveFold={aboveFold}
						cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
						cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
						cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined}
						suppressHydrationWarning 
					/>
					: <SmartImage 
						src={img} 
						title={title ?? imgAlt ?? undefined} 
						alt={imgAlt ?? title ?? ""}
						aboveFold={aboveFold}
						cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
						cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
						cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined}
						suppressHydrationWarning 
					/>
			} 
		</div> : null ;

	return (
		<div 
			id={friendlyTitle ? "callout-" + friendlyTitle : undefined}
			className={"callout" + 
			(variant ? " " + variant : "") + 
			((variant==='boxed' || variant==='boxed grid') && boxShape ? " " + boxShape : "") + 
			(layout && variant!=='split' ? " " + layout : "") + 
			(direction && layout!=='vertical' ? " " + direction : "") +
			(variant && (variant==='boxed grid' || variant==='grid') && gridColumns ? ` callout-grid-${gridColumns.left}-${gridColumns.right}` : '')
			} >
			{ (direction === "right") ? <>{body}{image}</> : <>{image}{body}</> }
		</div>
	);
}



/* ========== CALLOUT HEADER ========== */
CalloutHeader.propTypes = {
	title: PropTypes.string.isRequired,
	url: PropTypes.string,
	target: PropTypes.string
};
export type CalloutHeaderType = InferProps<typeof CalloutHeader.propTypes>;
export function CalloutHeader( {title, url, target}: CalloutHeaderType) {
	return (
		<div className="callout-header">
			{ (url)
				? <a href={url} target={target ? target : ""} rel={target=="_blank" ? "noopener noreferrer" : ""}><h2 className="callout-title">{title}</h2></a>
				: <h2 className="callout-title">{title}</h2>
			}
		</div>
	);
}



/* ========== CALLOUT BUTTON ========== */
CalloutButton.propTypes = {
	title: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
	target: PropTypes.string
};
export type CalloutButtonType = InferProps<typeof CalloutButton.propTypes>;
export function CalloutButton( { title, url, target } : CalloutButtonType) {
	const handleClick = () => {
		if (target === '_blank') {
			window.open(url, '_blank', 'noopener,noreferrer');
		} else {
			window.location.href = url;
		}
	};
	return (
		<div className="callout-button">
			{ (url) 
				? <button type="button" className="callout-button" onClick={handleClick}>{title}</button>
				: null
			}
		</div>
	);
}
