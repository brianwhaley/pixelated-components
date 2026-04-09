'use client';

import React, { useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { ToggleLoading } from './loading';
import { Skeleton } from './skeleton';
import './skeleton-loading.css';

/**
 * SkeletonLoading — Accessible skeleton page used while content or data is loading.
 *
 * @param {number} [props.heroHeight] - Height in pixels for the hero skeleton block.
 * @param {number} [props.cardCount] - Number of placeholder cards to render in the cards section.
 * @param {string} [props.className] - Optional additional CSS classes applied to the root element.
 */
SkeletonLoading.propTypes = {
/** Hero skeleton height (px) */
	heroHeight: PropTypes.number,
	/** Number of placeholder cards to render */
	cardCount: PropTypes.number,
	/** Extra CSS classes for the root element */
	className: PropTypes.string,
};
export type SkeletonLoadingType = InferProps<typeof SkeletonLoading.propTypes>;
export function SkeletonLoading({ heroHeight = 220, cardCount = 6, className = '' }: SkeletonLoadingType) {
	useEffect(() => {
		// Keep the app-level ToggleLoading behavior for global spinner consumers
		try {
			ToggleLoading({ show: true });
		} catch (e) {
			// defensive: ToggleLoading is best-effort
		}
	}, []);

	const count = Math.max(0, Number(cardCount || 0));

	return (
		<main className={`loading-page ${className}`}>
			<div className="loading-container">
				<div className="visually-hidden" role="status" aria-live="polite">Loading…</div>

				<section id="hero-loading" aria-hidden className="hero-loading">
					<Skeleton variant="rect" height={heroHeight} />
				</section>

				<section id="cards-loading" className="cards-loading" aria-hidden>
					{Array.from({ length: count }).map((_, i) => (
						<article key={i} className="card-article">
							<div className="card-row">
								<Skeleton variant="avatar" />
								<div className="card-body">
									<Skeleton lines={2} />
									<div className="card-body-extra">
										<Skeleton lines={3} width="90%" />
									</div>
								</div>
							</div>
						</article>
					))}
				</section>
			</div>
		</main>
	);
}
