"use client";

import React, { Children, useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Callout } from './callout';
import { observeIntersection } from './intersection-observer';
import './splitscroll.css';

/**
 * SplitScroll - A scrolling split-page layout with sticky images
 * 
 * Creates a splitscroll-style layout where the left side shows sticky images
 * that layer over each other as you scroll, while the right side contains
 * scrolling content sections.
 * 
 * @example
 * ```tsx
 * <SplitScroll>
 *   <SplitScrollSection img="/image1.jpg" title="Section 1">
 *     <YourContent />
 *   </SplitScrollSection>
 *   <SplitScrollSection img="/image2.jpg" title="Section 2">
 *     <MoreContent />
 *   </SplitScrollSection>
 * </SplitScroll>
 * ```
 */

/**
 * SplitScroll — a split-page layout where the left column shows sticky, layered images and the right column contains scrolling content sections.
 *
 * @param {node} [props.children] - One or more `SplitScrollSection` components that contain content for each section.
 */
SplitScroll.propTypes = {
/** Collection of `SplitScrollSection` children used to build the layout. */
	children: PropTypes.node.isRequired,
};
export type SplitScrollType = InferProps<typeof SplitScroll.propTypes>;
export function SplitScroll({ children }: SplitScrollType) {
	const [activeSectionIndex, setActiveSectionIndex] = useState(0);
	const childArray = Children.toArray(children);
	const sectionCount = childArray.length;

	useEffect(() => {
		// Set up intersection observers for each section
		const cleanup = observeIntersection(
			'.splitscroll-section',
			(entry) => {
				if (entry.isIntersecting) {
					const index = parseInt(entry.target.getAttribute('data-section-index') || '0', 10);
					setActiveSectionIndex(index);
				}
			},
			{
				rootMargin: '-20% 0px -60% 0px', // Trigger when section is 20% from top
				threshold: 0
			}
		);

		return cleanup;
	}, [sectionCount]);

	// Clone children and add props for active state and index
	const enhancedChildren = Children.map(children, (child, index) => {
		if (React.isValidElement(child)) {
			const additionalProps = {
				isActive: index === activeSectionIndex,
				sectionIndex: index,
				totalSections: sectionCount
			};
			return React.cloneElement(child, additionalProps as any);
		}
		return child;
	});

	return (
		<div className="splitscroll-container">
			{enhancedChildren}
		</div>
	);
}

/**
 * SplitScrollSection — Individual section within a SplitScroll.
 *
 * A facade for the Callout component with variant="split" preset.
 * Automatically configured for the splitscroll layout.
 *
 * @param {string} [props.img] - Image URL shown on the left column.
 * @param {string} [props.imgAlt] - Alt text for the image.
 * @param {('square'|'bevel'|'squircle'|'round')} [props.imgShape] - Image shape style.
 * @param {string} [props.title] - Section title text shown on the right column.
 * @param {node} [props.children] - Content for the section's right column.
 */
SplitScrollSection.propTypes = {
	img: PropTypes.string.isRequired,
	imgAlt: PropTypes.string,
	imgShape: PropTypes.oneOf(['square', 'bevel', 'squircle', 'round'] as const),
	title: PropTypes.string,
	subtitle: PropTypes.string,
	url: PropTypes.string,
	buttonText: PropTypes.string,
	children: PropTypes.node,
	aboveFold: PropTypes.bool,
	// Internal props added by SplitScroll parent
	isActive: PropTypes.bool,
	sectionIndex: PropTypes.number,
	totalSections: PropTypes.number,
};
export type SplitScrollSectionType = InferProps<typeof SplitScrollSection.propTypes>;
export function SplitScrollSection({
	img,
	imgAlt,
	imgShape = 'square',
	title,
	subtitle,
	url,
	buttonText,
	children,
	aboveFold,
	isActive,
	sectionIndex,
	totalSections,
}: SplitScrollSectionType) {
	return (
		<div 
			className={`splitscroll-section ${isActive ? 'active' : ''}`}
			data-section-index={sectionIndex}
			style={{
				'--section-index': sectionIndex,
				'--total-sections': totalSections
			} as React.CSSProperties}
		>
			<Callout
				variant="split"
				img={img}
				imgAlt={imgAlt}
				imgShape={imgShape}
				title={title}
				subtitle={subtitle}
				url={url}
				buttonText={buttonText}
				aboveFold={aboveFold ?? (sectionIndex === 0)}
			>
				{children}
			</Callout>
		</div>
	);
};
