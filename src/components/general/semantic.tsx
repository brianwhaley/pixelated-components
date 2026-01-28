"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import PropTypes, { InferProps } from "prop-types";
import { usePixelatedConfig } from "../config/config.client";
import { SmartImage } from "./smartimage";
import "../../css/pixelated.grid.scss";
import "./semantic.scss";

/* ========== LAYOUT COMPONENTS ==========
Reusable, scalable layout components for grid and flex layouts.
These components can be used in the pagebuilder to create
responsive, customizable page sections. */

// Define option arrays - used by both PropTypes and form generation
export const layoutTypes = ['grid', 'flex', 'none'] as const;
export const autoFlowValues = ['row', 'column', 'dense', 'row dense', 'column dense'] as const;
export const justifyItemsValues = ['start', 'center', 'end', 'stretch'] as const;
export const flexDirections = ['row', 'column', 'row-reverse', 'column-reverse'] as const;
export const flexWraps = ['nowrap', 'wrap', 'wrap-reverse'] as const;
export const justifyContentValues = ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'] as const;
export const alignItemsValues = ['start', 'center', 'end', 'stretch', 'baseline'] as const;



// ========== PAGE TITLE HEADER ==========
/**
 * PageTitleHeader — Small H1 header used primarily for page titles.
 *
 * @param {string} [props.title] - Title text to display (required).
 * @param {string} [props.url] - Optional URL; when present, the title will be rendered as a link.
 */
PageTitleHeader.propTypes = {
/** Page title text (required) */
	title: PropTypes.string.isRequired,
	/** Optional URL to wrap the title with */
	url: PropTypes.string
};
export type PageTitleHeaderType = InferProps<typeof PageTitleHeader.propTypes>;
export function PageTitleHeader( { title , url }: PageTitleHeaderType) {
	const calloutTarget = url && url.substring(0, 4).toLowerCase() === 'http' ? '_blank' : '_self';
	return (
		<>
			{url
				? <a href={url} target={calloutTarget} rel="noopener noreferrer"><h1 className="page-title-header">{title}</h1></a>
				: <h1 className="page-title-header">{title}</h1>
			}
		</>
	);
};



// ========== PAGE SECTION ==========
/**
 * PageSection — Flexible section wrapper used for page layout (grid or flex).
 *
 * @param {string} [props.id] - Optional element id for the section.
 * @param {string} [props.className] - Optional additional CSS class names.
 * @param {oneOf} [props.layoutType] - Layout mode: 'grid' | 'flex' | 'none'.
 * @param {string} [props.gap] - Gap between child elements (CSS gap value).
 * @param {string} [props.maxWidth] - Maximum content width (e.g., '1024px').
 * @param {string} [props.padding] - Section padding (CSS shorthand).
 * @param {string} [props.background] - Background color or CSS value.
 * @param {string} [props.backgroundImage] - Background image URL.
 * @param {number} [props.columns] - Number of grid columns when `layoutType` is 'grid'.
 * @param {oneOf} [props.autoFlow] - Grid auto-flow property (e.g., 'row', 'column', 'dense').
 * @param {oneOf} [props.justifyItems] - Grid justify-items value.
 * @param {shape} [props.responsive] - Responsive column counts ({ mobile, tablet, desktop }).
 * @param {number} [props.mobile] - Mobile column count (inside `responsive`).
 * @param {number} [props.tablet] - Tablet column count (inside `responsive`).
 * @param {number} [props.desktop] - Desktop column count (inside `responsive`).
 * @param {oneOf} [props.direction] - Flex direction when `layoutType` is 'flex'.
 * @param {oneOf} [props.wrap] - Flex wrap property when using flex layout.
 * @param {oneOf} [props.justifyContent] - Flex justify-content value.
 * @param {oneOf} [props.alignItems] - Alignment for cross-axis in grid/flex.
 * @param {node} [props.children] - Child nodes to render inside the section.
 */
PageSection.propTypes = {
/** Optional element id */
	id: PropTypes.string,
	/** Optional CSS classes */
	className: PropTypes.string,
	/** Layout mode ('grid' | 'flex' | 'none') */
	layoutType: PropTypes.oneOf([...layoutTypes]),
	// Common props
	/** Gap between children (CSS gap) */
	gap: PropTypes.string,
	/** Max width of the content area */
	maxWidth: PropTypes.string,
	/** Padding applied to content area */
	padding: PropTypes.string,
	/** Background color/string */
	background: PropTypes.string,
	/** Background image URL */
	backgroundImage: PropTypes.string,
	// Grid-specific props
	/** Number of columns when using grid layout */
	columns: PropTypes.number,
	/** Grid auto-flow value */
	autoFlow: PropTypes.oneOf([...autoFlowValues]),
	/** Grid justify-items */
	justifyItems: PropTypes.oneOf([...justifyItemsValues]),
	/** Responsive column config */
	responsive: PropTypes.shape({
		/** Mobile column count */
		mobile: PropTypes.number,
		/** Tablet column count */
		tablet: PropTypes.number,
		/** Desktop column count */
		desktop: PropTypes.number,
	}),
	// Flex-specific props
	/** Flex direction value */
	direction: PropTypes.oneOf([...flexDirections]),
	/** Flex wrap behavior */
	wrap: PropTypes.oneOf([...flexWraps]),
	/** Flex justify-content value */
	justifyContent: PropTypes.oneOf([...justifyContentValues]),
	// Shared alignment
	/** Cross-axis alignment for children */
	alignItems: PropTypes.oneOf([...alignItemsValues]),
	/** Child nodes */
	children: PropTypes.node,
};
export type PageSectionType = InferProps<typeof PageSection.propTypes>;
export function PageSection({
	id,
	className,
	layoutType = 'grid',
	gap = '10px',
	maxWidth = '1024px',
	padding = '0 20px', /* 5px */
	background,
	backgroundImage,
	// Grid props
	columns = 12,
	autoFlow = 'row',
	justifyItems = 'stretch',
	// responsive = { mobile: 1, tablet: 2, desktop: 3 },
	// Flex props
	direction = 'row',
	wrap = 'wrap',
	justifyContent = 'start',
	// Shared
	alignItems = 'stretch',
	children,
}: PageSectionType) {
	const sectionStyle: React.CSSProperties = {
		...(background && { background }),
	};
	const contentStyle: React.CSSProperties = {
		...(maxWidth && { maxWidth }),
		margin: '0 auto',
		...(padding && { padding }),
	};
	// Add layout-specific styles
	if (layoutType === 'grid') {
		return (
			<section id={id || undefined} 
				className={"page-section" + (className ? ` ${className}` : '') } 
				style={sectionStyle}>
				{backgroundImage && <PageSectionBackgroundImage backgroundImage={backgroundImage} id={id} />}
				<div 
					className={"page-section-content" + " row-" + columns + "col"}
					style={{
						...contentStyle,
						...(gap && { gap }),
						...(autoFlow && { gridAutoFlow: autoFlow }),
						...(alignItems && { alignItems }),
						...(justifyItems && { justifyItems }),
					}}
				>
					{children}
				</div>
			</section>
		);
	}
	if (layoutType === 'flex') {
		return (
			<section id={id || undefined} className="page-section page-section-flex" style={sectionStyle}>
				{backgroundImage && <PageSectionBackgroundImage backgroundImage={backgroundImage} id={id} />}
				<div 
					className="page-section-content"
					style={{
						...contentStyle,
						display: 'flex',
						...(direction && { flexDirection: direction as React.CSSProperties['flexDirection'] }),
						...(wrap && { flexWrap: wrap as React.CSSProperties['flexWrap'] }),
						...(gap && { gap }),
						...(alignItems && { alignItems: alignItems as React.CSSProperties['alignItems'] }),
						...(justifyContent && { justifyContent: justifyContent as React.CSSProperties['justifyContent'] }),
					}}
				>
					{children}
				</div>
			</section>
		);
	}
	// layoutType === 'none'
	return (
		<section id={id || undefined} className="page-section page-section-none" style={sectionStyle}>
			{backgroundImage && <PageSectionBackgroundImage backgroundImage={backgroundImage} id={id} />}
			<div className="page-section-content" style={contentStyle}>
				{children}
			</div>
		</section>
	);
}



// ========== PAGE SECTION HEADER ==========
/**
 * PageSectionHeader — Small header used to label a `PageSection`.
 *
 * @param {string} [props.title] - Section title text (required).
 * @param {string} [props.url] - Optional URL to link the section title.
 */
PageSectionHeader.propTypes = {
/** Section title text */
	title: PropTypes.string.isRequired,
	/** Optional URL to link the title */
	url: PropTypes.string
};
export type PageSectionHeaderType = InferProps<typeof PageSectionHeader.propTypes>;
export function PageSectionHeader( { title , url }: PageSectionHeaderType) {
	const calloutTarget = url && url.substring(0, 4).toLowerCase() === 'http' ? '_blank' : '_self';
	return (
		<>
			{url
				? <a href={url} target={calloutTarget} rel="noopener noreferrer"><h2 className="page-section-header">{title}</h2></a>
				: <h2 className="page-section-header">{title}</h2>
			}
		</>
	);
};



// ========== PAGE SECTION BACKGROUND IMAGE ==========
/**
 * PageSectionBackgroundImage — Decorative background image used by `PageSection`.
 *
 * @param {string} [props.backgroundImage] - Background image URL (required).
 * @param {string} [props.id] - Optional id used for element ids and titles.
 */
PageSectionBackgroundImage.propTypes = {
/** Background image URL */
	backgroundImage: PropTypes.string.isRequired,
	/** Optional id for the image element */
	id: PropTypes.string,
};
export type PageSectionBackgroundImageType = InferProps<typeof PageSectionBackgroundImage.propTypes>;
export function PageSectionBackgroundImage(props: PageSectionBackgroundImageType) {
	const config = usePixelatedConfig();
	return (
		<>
			<SmartImage
				src={props.backgroundImage}
				className="section-background-image"
				id={props.id ? `${props.id}-background-image` : undefined}
				// name={props.id ? `${props.id} background image` : undefined}
				title={props.id ? `${props.id} background image` : undefined}
				alt={props.id ? `${props.id} background image` : ""}
				cloudinaryEnv={config?.cloudinary?.product_env ?? undefined}
				cloudinaryDomain={config?.cloudinary?.baseUrl ?? undefined}
				cloudinaryTransforms={config?.cloudinary?.transforms ?? undefined}
			/>
		</>
	);
}



// ========== GRID ITEM ==========
/**
 * PageGridItem — Single grid cell wrapper that supports span and positioning helpers.
 *
 * @param {string} [props.id] - Optional id for the grid item element.
 * @param {string} [props.className] - Additional CSS classes for the item.
 * @param {number} [props.columnSpan] - How many columns the item spans.
 * @param {number} [props.rowSpan] - How many rows the item spans.
 * @param {number} [props.columnStart] - Starting column index for the item.
 * @param {number} [props.columnEnd] - Ending column index for the item.
 * @param {number} [props.rowStart] - Starting row index for the item.
 * @param {number} [props.rowEnd] - Ending row index for the item.
 * @param {oneOf} [props.alignSelf] - Cross-axis alignment for the item.
 * @param {oneOf} [props.justifySelf] - Main-axis alignment for the item.
 * @param {node} [props.children] - Child nodes to render inside the grid cell.
 */
PageGridItem.propTypes = {
/** Optional element id */
	id: PropTypes.string,
	/** Optional CSS classes */
	className: PropTypes.string,
	/** Column span value */
	columnSpan: PropTypes.number,
	/** Row span value */
	rowSpan: PropTypes.number,
	/** Column start index */
	columnStart: PropTypes.number,
	/** Column end index */
	columnEnd: PropTypes.number,
	/** Row start index */
	rowStart: PropTypes.number,
	/** Row end index */
	rowEnd: PropTypes.number,
	/** Cross-axis alignment */
	alignSelf: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
	/** Main-axis alignment */
	justifySelf: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
	/** Child nodes */
	children: PropTypes.node,
};
export type PageGridItemType = InferProps<typeof PageGridItem.propTypes>;
export function PageGridItem({
	id, 
	className,
	columnSpan,
	rowSpan,
	columnStart,
	columnEnd,
	rowStart,
	rowEnd,
	alignSelf,
	justifySelf,
	children,
}: PageGridItemType) {
	const itemStyle: React.CSSProperties = {
		...(columnSpan && !columnStart && { gridColumn: ` span ${columnSpan}` }),
		// columnStart && columnSpan = style grid-s##-w##
		// columnStart && columnEnd = style grid-s##-e##
		// ...(columnStart && columnEnd && { gridColumn: ` ${columnStart} / ${columnEnd}` }),
		...(rowSpan && { gridRow: ` span ${rowSpan}` }),
		...(rowStart && rowEnd && { gridRow: ` ${rowStart} / ${rowEnd}` }),
		...(alignSelf && { alignSelf }),
		...(justifySelf && { justifySelf }),
	};
	return (
		/* THIS IS AN OLD STYLE */
		/* <div className={"grid-item" + */
		<div className={"gridItem" + 
		(className ? ` ${className}` : '') +
		(columnStart && columnSpan && !columnEnd ? ` grid-s${columnStart}-w${columnSpan}` : '') + 
		(columnStart && columnEnd && !columnSpan ? ` grid-s${columnStart}-e${columnEnd}` : '')} 
		id={(id) ? id : undefined} style={itemStyle}>
			{children}
		</div>
	);
}



// ========== FLEX ITEM ==========
/**
 * PageFlexItem — Simple flex item helper that exposes CSS flex and order helpers.
 *
 * @param {string} [props.flex] - CSS flex shorthand value (e.g., '1 1 auto').
 * @param {number} [props.order] - Order value used by flexbox ordering.
 * @param {oneOf} [props.alignSelf] - Override for cross-axis alignment on the item.
 * @param {node} [props.children] - Child nodes to render inside the flex item.
 */
PageFlexItem.propTypes = {
/** CSS flex shorthand value */
	flex: PropTypes.string,
	/** Flex order value */
	order: PropTypes.number,
	/** Cross-axis alignment override */
	alignSelf: PropTypes.oneOf(['auto', 'start', 'center', 'end', 'stretch', 'baseline']),
	/** Child nodes */
	children: PropTypes.node,
};
export type PageFlexItemType = InferProps<typeof PageFlexItem.propTypes>;
export function PageFlexItem({
	flex = '1',
	order,
	alignSelf,
	children,
}: PageFlexItemType) {
	const itemStyle: React.CSSProperties = {
		...(flex && { flex }),
		...(order !== undefined && order !== null && { order }),
		...(alignSelf && { alignSelf: alignSelf as React.CSSProperties['alignSelf'] }),
	};
	return (
		<div className="flex-item" style={itemStyle}>
			{children}
		</div>
	);
}



// ========== PAGE LINK ==========
const pageLinkShape = PropTypes.shape({
	label: PropTypes.string.isRequired,
	href: PropTypes.string.isRequired,
	target: PropTypes.oneOf(["_self", "_blank"]),
});

type PageLinkType = {
	label: string;
	href: string;
	target?: "_self" | "_blank";
};



// ========== PAGE HEADER ==========
/**
 * PageHeader — Top page header block that can include eyebrow, headline, description and CTA.
 *
 * @param {string} [props.className] - Optional CSS classes to apply to the header.
 * @param {string} [props.eyebrow] - Small eyebrow text shown above the headline.
 * @param {string} [props.headline] - Main headline text.
 * @param {string} [props.description] - Short description or subheading text.
 * @param {string} [props.ctaLabel] - CTA button label text.
 * @param {string} [props.ctaHref] - CTA URL to navigate to when clicked.
 * @param {oneOf} [props.ctaTarget] - Optional target for CTA link ('_self' or '_blank').
 * @param {node} [props.children] - Additional nodes to render inside the header.
 * @param {boolean} [props.fixed] - When true, header becomes fixed and a spacer is inserted.
 */
PageHeader.propTypes = {
/** Optional CSS classes */
	className: PropTypes.string,
	/** Eyebrow above the headline */
	eyebrow: PropTypes.string,
	/** Headline text */
	headline: PropTypes.string,
	/** Subheading or description */
	description: PropTypes.string,
	/** CTA label */
	ctaLabel: PropTypes.string,
	/** CTA href */
	ctaHref: PropTypes.string,
	/** CTA target */
	ctaTarget: PropTypes.oneOf(["_self", "_blank"]),
	/** Additional child nodes */
	children: PropTypes.node,
	/** When true, header is fixed (sticky) */
	fixed: PropTypes.bool,
};
export type PageHeaderType = InferProps<typeof PageHeader.propTypes>;
export function PageHeader({
	className,
	eyebrow,
	headline,
	description,
	ctaLabel,
	ctaHref,
	ctaTarget,
	children,
	fixed = false,
}: PageHeaderType) {
	const resolvedTarget = ctaTarget ?? (ctaHref && ctaHref.startsWith("http") ? "_blank" : "_self");
	const rel = resolvedTarget === "_blank" ? "noopener noreferrer" : undefined;
	const headerRef = useRef<HTMLElement>(null);
	const [spacerHeight, setSpacerHeight] = useState<number | undefined>(undefined);

	useLayoutEffect(() => {
		if (!fixed) {
			setSpacerHeight(undefined);
			return;
		}
		const updateHeight = () => {
			if (!headerRef.current) {
				return;
			}
			setSpacerHeight(headerRef.current.getBoundingClientRect().height);
		};
		updateHeight();
		window.addEventListener("resize", updateHeight);
		return () => window.removeEventListener("resize", updateHeight);
	}, [fixed, eyebrow, headline, description, ctaLabel, ctaHref]);

	const spacerStyle = spacerHeight !== undefined ? { height: `${spacerHeight}px` } : undefined;
	const headerClasses = `page-header${className ? ` ${className}` : ""}${fixed ? " fixed-header" : ""}`;
	return (
		<>
			{fixed && (
				<div className="page-header-spacer" aria-hidden="true" style={spacerStyle} />
			)}
			<header ref={headerRef} className={headerClasses}>
				{eyebrow && <p className="page-header-eyebrow">{eyebrow}</p>}
				{headline && <h1>{headline}</h1>}
				{description && <p className="page-header-description">{description}</p>}
				{ctaLabel && ctaHref && (
					<a
						className="page-header-cta"
						href={ctaHref}
						target={resolvedTarget}
						rel={rel}
					>
						{ctaLabel}
					</a>
				)}
				{children}
			</header>
		</>
	);
}


// ========== PAGE HERO ==========
/**
 * PageHero — Generic hero wrapper used within page layouts.
 *
 * @param {string} [props.id] - Optional id for the hero section.
 * @param {string} [props.className] - Additional CSS classes for the hero.
 * @param {string} [props.background] - Background color or CSS value.
 * @param {string} [props.backgroundImage] - Background image URL to render behind content.
 * @param {node} [props.children] - Content to display inside the hero.
 */
PageHero.propTypes = {
/** Optional id for hero */
	id: PropTypes.string,
	/** Optional CSS classes */
	className: PropTypes.string,
	/** Background color or CSS string */
	background: PropTypes.string,
	/** Background image URL */
	backgroundImage: PropTypes.string,
	/** Child nodes */
	children: PropTypes.node,
};
export type PageHeroType = InferProps<typeof PageHero.propTypes>;
export function PageHero({
	id,
	className,
	background,
	backgroundImage,
	children,
}: PageHeroType) {
	const wrapperStyle: React.CSSProperties = {
		...(background && { background }),
	};
	return (
		<section id={id || undefined} className={`page-hero${className ? ` ${className}` : ""}`} style={wrapperStyle}>
			{backgroundImage && <PageSectionBackgroundImage backgroundImage={backgroundImage} id={id} />}
			<div className="page-hero-content">
				{children}
			</div>
		</section>
	);
}


// ========== PAGE MAIN ==========
/**
 * PageMain — Main content wrapper with optional width and padding controls.
 *
 * @param {string} [props.id] - Optional id attribute for the main element.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @param {string} [props.maxWidth] - Maximum content width (e.g., '1200px').
 * @param {string} [props.padding] - Padding around the main content (CSS shorthand).
 * @param {node} [props.children] - Main content nodes.
 */
PageMain.propTypes = {
/** Optional id */
	id: PropTypes.string,
	/** Optional CSS classes */
	className: PropTypes.string,
	/** Max content width */
	maxWidth: PropTypes.string,
	/** Padding for main content */
	padding: PropTypes.string,
	/** Child nodes */
	children: PropTypes.node,
};
export type PageMainType = InferProps<typeof PageMain.propTypes>;
export function PageMain({
	id,
	className,
	maxWidth = "1200px",
	padding = "0 20px 60px",
	children,
}: PageMainType) {
	const layoutStyle: React.CSSProperties = {
		...(maxWidth && { maxWidth }),
		...(padding && { padding }),
	};
	return (
		<main id={id || undefined} className={`page-main${className ? ` ${className}` : ""}`} style={layoutStyle}>
			{children}
		</main>
	);
}



// ========== PAGE NAV ==========
/**
 * PageNav — Simple navigation helper that renders link items horizontally or vertically.
 *
 * @param {string} [props.className] - Optional CSS classes for the nav wrapper.
 * @param {oneOf} [props.orientation] - Layout orientation: 'horizontal' or 'vertical'.
 * @param {arrayOf} [props.links] - Array of link objects ({label, href, target}).
 */
PageNav.propTypes = {
/** Optional CSS classes */
	className: PropTypes.string,
	/** Orientation: 'horizontal' | 'vertical' */
	orientation: PropTypes.oneOf(["horizontal", "vertical"]),
	/** Array of link objects */
	links: PropTypes.arrayOf(pageLinkShape),
};
export type PageNavType = InferProps<typeof PageNav.propTypes>;
export function PageNav({
	className,
	orientation = "horizontal",
	links,
}: PageNavType) {
	const resolvedLinks: PageLinkType[] = Array.isArray(links)
		? (links.filter(Boolean) as PageLinkType[])
		: [];
	if (!resolvedLinks.length) {
		return null;
	}
	return (
		<nav className={`page-nav page-nav-${orientation}` + (className ? ` ${className}` : "")}>
			{resolvedLinks.map((link) => {
				const target = link.target ?? (link.href.startsWith("http") ? "_blank" : "_self");
				const rel = target === "_blank" ? "noopener noreferrer" : undefined;
				return (
					<a key={`${link.href}-${link.label}`} href={link.href} target={target} rel={rel}>
						{link.label}
					</a>
				);
			})}
		</nav>
	);
}



// ========== PAGE FOOTER ==========
/**
 * PageFooter — Page footer that optionally renders text, links and children.
 *
 * @param {string} [props.className] - Optional additional CSS classes.
 * @param {string} [props.text] - Footer text or short copyright string.
 * @param {arrayOf} [props.links] - Array of link objects to show in footer.
 * @param {node} [props.children] - Additional nodes rendered inside the footer.
 */
PageFooter.propTypes = {
/** Optional CSS classes */
	className: PropTypes.string,
	/** Footer text */
	text: PropTypes.string,
	/** Footer links */
	links: PropTypes.arrayOf(pageLinkShape),
	/** Child nodes */
	children: PropTypes.node,
};
export type PageFooterType = InferProps<typeof PageFooter.propTypes>;
export function PageFooter({
	className,
	text,
	links,
	children,
}: PageFooterType) {
	const resolvedLinks: PageLinkType[] = Array.isArray(links)
		? (links.filter(Boolean) as PageLinkType[])
		: [];
	const hasLinks = resolvedLinks.length > 0;
	if (!text && !hasLinks && !children) {
		return null;
	}
	return (
		<footer className={`page-footer${className ? ` ${className}` : ""}`}>
			{text && <p className="page-footer-text">{text}</p>}
			{hasLinks && (
				<div className="page-footer-links">
					{resolvedLinks.map((link) => {
						const target = link.target ?? (link.href.startsWith("http") ? "_blank" : "_self");
						const rel = target === "_blank" ? "noopener noreferrer" : undefined;
						return (
							<a key={`${link.href}-${link.label}`} href={link.href} target={target} rel={rel}>
								{link.label}
							</a>
						);
					})}
				</div>
			)}
			{children}
		</footer>
	);
}
