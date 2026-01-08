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
 *   <SplitScroll.Section img="/image1.jpg" title="Section 1">
 *     <YourContent />
 *   </SplitScroll.Section>
 *   <SplitScroll.Section img="/image2.jpg" title="Section 2">
 *     <MoreContent />
 *   </SplitScroll.Section>
 * </SplitScroll>
 * ```
 */

SplitScroll.propTypes = {
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
 * SplitScroll.Section - Individual section within a SplitScroll
 * 
 * A facade for the Callout component with variant="split" preset.
 * Automatically configured for the splitscroll layout.
 */

const splitscrollSectionPropTypes = {
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

type SplitScrollSectionProps = InferProps<typeof splitscrollSectionPropTypes> & {
	imgShape?: 'square' | 'bevel' | 'squircle' | 'round';
};

const SplitScrollSectionComponent = function SplitScrollSection({
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
}: SplitScrollSectionProps) {
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

SplitScrollSectionComponent.propTypes = splitscrollSectionPropTypes;
SplitScroll.Section = SplitScrollSectionComponent;
