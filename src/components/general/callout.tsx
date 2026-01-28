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

/**
 * Callout — versatile content block used for banners, promotional sections, and feature callouts.
 *
 * @param {oneOf} [props.variant] - Visual variant (e.g., 'default', 'boxed', 'full', 'grid', 'overlay', 'split').
 * @param {oneOf} [props.boxShape] - Corner shape for boxed variants (e.g., 'square', 'bevel', 'squircle', 'round').
 * @param {oneOf} [props.layout] - Layout direction: 'horizontal' (image + content) or 'vertical'.
 * @param {oneOf} [props.direction] - When horizontal, whether the image appears on the 'left' or 'right'.
 * @param {shape} [props.gridColumns] - Optional grid column counts used for boxed grid variants ({ left, right }).
 * @param {number} [props.left] - Left column width for grid layouts.
 * @param {number} [props.right] - Right column width for grid layouts.
 * @param {string} [props.url] - Optional CTA URL for the callout button.
 * @param {string} [props.img] - Image URL to display in the callout.
 * @param {string} [props.imgAlt] - Alternate text for the image (accessibility and caption fallback).
 * @param {oneOf} [props.imgShape] - Visual shape applied to the image container.
 * @param {function} [props.imgClick] - Optional image click handler (event, url).
 * @param {string} [props.title] - Primary title text for the callout.
 * @param {string} [props.subtitle] - Secondary title/subtitle text.
 * @param {oneOfType} [props.content] - Content as string or React node to place inside the callout body.
 * @param {node} [props.children] - React children to render in the content area (takes precedence over content).
 * @param {string} [props.buttonText] - Button/CTA text to display when `url` is provided.
 * @param {boolean} [props.aboveFold] - Hint to prioritize image loading (above-the-fold) for performance.
 * @param {string} [props.cloudinaryEnv] - Cloudinary environment key (internal use for SmartImage).
 * @param {string} [props.cloudinaryDomain] - Cloudinary domain to use for image hosts.
 * @param {string} [props.cloudinaryTransforms] - Optional Cloudinary transform presets.
 */
Callout.propTypes = {
	/** Visual variant selector (e.g., 'default', 'boxed', 'grid', 'full'). */
	variant: PropTypes.oneOf([...variants]),
	/** Corner/box shape for boxed variants. */
	boxShape: PropTypes.oneOf([...shapes]),
	/** Layout direction: 'horizontal' or 'vertical'. */
	layout: PropTypes.oneOf([...layouts]),
	/** When horizontal layout is used, position image on 'left' or 'right'. */
	direction: PropTypes.oneOf([...directions]),
	/** Grid column sizing used for 'boxed grid' variants. */
	gridColumns: PropTypes.shape({
		/** Left column width in the grid configuration. */
		left: PropTypes.number,
		/** Right column width in the grid configuration. */
		right: PropTypes.number
	}),
	/** Optional CTA URL used by CalloutButton. */
	url: PropTypes.string,
	/** Image URL to display in the callout. */
	img: PropTypes.string,
	/** Alt text for the image (used for accessibility and caption fallback). */
	imgAlt: PropTypes.string,
	/** Visual shape applied to the image container (e.g., 'square', 'round'). */
	imgShape: PropTypes.oneOf([...shapes]),
	/** Optional click handler for the image (event, url). */
	imgClick: PropTypes.func,
	/** Primary title text for the callout. */
	title: PropTypes.string,
	/** Optional subtitle/secondary heading. */
	subtitle: PropTypes.string,
	/** Content string or React node to render inside the body area. */
	content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
	/** React children to render in the content area (takes precedence over content prop). */
	children: PropTypes.node,
	/** Button or CTA text used when `url` is provided. */
	buttonText: PropTypes.string,
	// SmartImage props
	/** Hint to prioritize image loading (treat as above-the-fold). */
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
/**
 * CalloutHeader — renders the primary title and optional link wrapper for a Callout.
 *
 * @param {string} [props.title] - Title text displayed as the heading.
 * @param {string} [props.url] - Optional URL that wraps the title as a link.
 * @param {string} [props.target] - Link target (e.g., '_self', '_blank').
 */
CalloutHeader.propTypes = {
/** Heading title text (required). */
	title: PropTypes.string.isRequired,
	/** Optional link URL for the heading. */
	url: PropTypes.string,
	/** Optional link target attribute. */
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
/**
 * CalloutButton — renders a button that navigates to a provided CTA URL.
 *
 * @param {string} [props.title] - Button label text (required when URL is provided).
 * @param {string} [props.url] - Required URL that the button navigates to.
 * @param {string} [props.target] - Optional link target for cross-origin behavior.
 */
CalloutButton.propTypes = {
/** Button label text. */
	title: PropTypes.string.isRequired,
	/** CTA URL that the button will navigate to when clicked. */
	url: PropTypes.string.isRequired,
	/** Optional target attribute for link behavior. */
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
