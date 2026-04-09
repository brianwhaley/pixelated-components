'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import './accordion.css';

export interface AccordionItem {
  title: string;
  content: string | React.ReactNode;
  open?: boolean | null;
}

/**
 * Accordion — a simple details/summary-based accordion component.
 *
 * @param {arrayOf} [props.items] - Array of items each with `title`, `content`, and optional `open` state.
 * @param {string} [props.title] - Title or header for an accordion item.
 * @param {oneOfType} [props.content] - Content for an accordion item, either string or React node.
 * @param {boolean} [props.open] - Initial open state of an item (when true the item is expanded).
 * @param {function} [props.onToggle] - Optional callback called when an item is toggled (index, isOpen).
 */
Accordion.propTypes = {
	/** Array of accordion items to render. */
	items: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string.isRequired,
			content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
			open: PropTypes.bool,
		})
	).isRequired,
	/** Called when an item is toggled with (index, isOpen). */
	onToggle: PropTypes.func,
};
export type AccordionType = InferProps<typeof Accordion.propTypes>;
export function Accordion({ items, onToggle }: AccordionType) {
	return (
		<div className="accordion">
			{items?.map((item, index) => (
				item ? (
					<details 
						key={index} 
						className="accordion-item" 
						open={item.open ?? undefined}
						onToggle={onToggle ? (e) => onToggle(index, (e.target as HTMLDetailsElement).open) : undefined}
					>
						<summary className="accordion-title">
							<h3 id={`accordion-header-${index}`}>
								{item.title}
							</h3>
						</summary>
						<div 
							className="accordion-content"
							role="region"
							aria-labelledby={`accordion-header-${index}`}
						>
							{typeof item.content === 'string' ? (
								<p>{item.content}</p>
							) : (
								item.content
							)}
						</div>
					</details>
				) : null
			))}
		</div>
	);
}

