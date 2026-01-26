'use client';

import React, { useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { ToggleLoading } from './loading';
import { Skeleton } from './skeleton';
import './skeleton-loading.css';

export type SkeletonLoadingProps = {
  heroHeight?: number;
  cardCount?: number;
  className?: string;
};

SkeletonLoading.propTypes = {
	heroHeight: PropTypes.number,
	cardCount: PropTypes.number,
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

				<section id="hero-loading" aria-hidden className="hero">
					<Skeleton variant="rect" height={heroHeight} />
				</section>

				<section id="cards-loading" className="cards-grid" aria-hidden>
					{Array.from({ length: count }).map((_, i) => (
						<article key={i} className="card-skeleton">
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

export default SkeletonLoading;
