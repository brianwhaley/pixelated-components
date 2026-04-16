'use client';

import React, { useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteInfo } from '../config/config.types';
import './global-error.css';

/**
 * GlobalErrorUI — displays a global error state with message, retry action and optional maintainer contact link.
 *
 * @param {any} [props.error] - Error object; may include message and stack for diagnostics.
 * @param {function} [props.reset] - Optional retry/reset callback to attempt the failed action again.
 * @param {object} [props.siteInfo] - Site-level information (used to render contact email/link when available).
 * @param {string} [props.className] - Additional CSS class(es) to apply to the root element.
 */
GlobalErrorUI.propTypes = {
	/** Error object; message and stack will be shown when details are expanded. */
	error: PropTypes.any,
	/** Optional retry/reset function called when the user clicks 'Try again'. */
	reset: PropTypes.func,
	/** Optional site information (used to build a contact mailto link when an email is available). */
	siteInfo: PropTypes.object,
	/** Additional class names to apply to the component root. */
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
					<button onClick={() => reset?.()} className="ge-btn ge-btn-primary">Try again</button>

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
