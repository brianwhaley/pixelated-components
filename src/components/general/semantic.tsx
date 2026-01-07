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
PageTitleHeader.propTypes = {
	title: PropTypes.string.isRequired,
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
PageSection.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	layoutType: PropTypes.oneOf([...layoutTypes]),
	// Common props
	gap: PropTypes.string,
	maxWidth: PropTypes.string,
	padding: PropTypes.string,
	background: PropTypes.string,
	backgroundImage: PropTypes.string,
	// Grid-specific props
	columns: PropTypes.number,
	autoFlow: PropTypes.oneOf([...autoFlowValues]),
	justifyItems: PropTypes.oneOf([...justifyItemsValues]),
	responsive: PropTypes.shape({
		mobile: PropTypes.number,
		tablet: PropTypes.number,
		desktop: PropTypes.number,
	}),
	// Flex-specific props
	direction: PropTypes.oneOf([...flexDirections]),
	wrap: PropTypes.oneOf([...flexWraps]),
	justifyContent: PropTypes.oneOf([...justifyContentValues]),
	// Shared alignment
	alignItems: PropTypes.oneOf([...alignItemsValues]),
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
PageSectionHeader.propTypes = {
	title: PropTypes.string.isRequired,
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
PageSectionBackgroundImage.propTypes = {
	backgroundImage: PropTypes.string.isRequired,
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
PageGridItem.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	columnSpan: PropTypes.number,
	rowSpan: PropTypes.number,
	columnStart: PropTypes.number,
	columnEnd: PropTypes.number,
	rowStart: PropTypes.number,
	rowEnd: PropTypes.number,
	alignSelf: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
	justifySelf: PropTypes.oneOf(['start', 'center', 'end', 'stretch']),
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
PageFlexItem.propTypes = {
	flex: PropTypes.string,
	order: PropTypes.number,
	alignSelf: PropTypes.oneOf(['auto', 'start', 'center', 'end', 'stretch', 'baseline']),
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
PageHeader.propTypes = {
	className: PropTypes.string,
	eyebrow: PropTypes.string,
	headline: PropTypes.string,
	description: PropTypes.string,
	ctaLabel: PropTypes.string,
	ctaHref: PropTypes.string,
	ctaTarget: PropTypes.oneOf(["_self", "_blank"]),
	children: PropTypes.node,
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
PageHero.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	background: PropTypes.string,
	backgroundImage: PropTypes.string,
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
PageMain.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	maxWidth: PropTypes.string,
	padding: PropTypes.string,
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
PageNav.propTypes = {
	className: PropTypes.string,
	orientation: PropTypes.oneOf(["horizontal", "vertical"]),
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
PageFooter.propTypes = {
	className: PropTypes.string,
	text: PropTypes.string,
	links: PropTypes.arrayOf(pageLinkShape),
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
