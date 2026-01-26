'use client';

import React, { useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteInfo } from '../config/config.types';
import './global-error.css';

GlobalErrorUI.propTypes = {
	error: PropTypes.any,
	reset: PropTypes.func,
	siteInfo: PropTypes.object,
	className: PropTypes.string,
};
export type GlobalErrorUIType = InferProps<typeof GlobalErrorUI.propTypes>;
export function GlobalErrorUI({ error = null, reset, siteInfo, className = '' } : GlobalErrorUIType) {
	const [showDetails, setShowDetails] = useState(false);
	const si = siteInfo as SiteInfo | undefined;
	const contactHref: string | undefined =
		typeof (si as any)?.email === 'string'
			? `mailto:${(si as any).email}`
			: undefined;
	return (
		<main role="alert" aria-live="polite" className={`global-error ${className}`}>
			<div className="ge-inner">
				<h1 className="ge-title">Something went wrong</h1>
				<p className="ge-lead">We encountered an unexpected error. Please try again or contact the site maintainer.</p>

				<div className="ge-actions">
					<button onClick={() => reset?.()} className="ge-btn ge-btn--primary">Try again</button>

					{contactHref ? (
						<a href={contactHref} rel="noopener noreferrer" className="ge-link">Contact support</a>
					) : (
						<span className="ge-unavailable">Contact info unavailable</span>
					)}

					<button
						onClick={() => setShowDetails(s => !s)}
						aria-pressed={showDetails}
						className="ge-btn ge-toggle"
					>
						{showDetails ? 'Hide details' : 'Show details'}
					</button>
				</div>

				{showDetails && (
					<pre data-testid="error-details" className="ge-details">
						{String(error?.message ?? 'Unknown error')}
						{'\n'}
						{error?.stack ?? ''}
					</pre>
				)}

				<p className="ge-note">If this keeps happening, please file an issue or reach out to the maintainer.</p>
			</div>
		</main>
	);
}
