'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { AxeCoreResponse, AxeViolation, AxeNode } from './site-health-types';
import { getImpactIndicator, getIncompleteIndicator, getPassingIndicator } from './site-health-indicators';

// Debug logging: set to `true` temporarily when investigating issues locally. Keep `false` in production.
const debug = false; 

SiteHealthAxeCore.propTypes = {
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthAxeCoreType = InferProps<typeof SiteHealthAxeCore.propTypes>;
export function SiteHealthAxeCore({ siteName }: SiteHealthAxeCoreType) {
	const getImpactColor = (impact: string) => {
		return getImpactIndicator(impact).color;
	};

	// Ensure axe-core is available on the admin page so self-analysis and debugging are possible
	React.useEffect(() => {
		if (typeof window === 'undefined') return;
		if ((window as any).axe) return; // already loaded

		const cdnSrc = 'https://cdn.jsdelivr.net/npm/axe-core/axe.min.js';
		const apiFallback = '/api/axe-core';

		function injectScript(src: string) {
			const script = document.createElement('script');
			script.src = src;
			script.async = false; // preserve execution order
			script.onload = () => { if (debug) console.info('axe-core loaded from', src); };
			script.onerror = async () => {
				console.warn('Failed to load axe-core from', src);
				if (src !== apiFallback) {
					// Try fallback to local API that serves the bundle
					injectScript(apiFallback);
				}
			};
			document.head.appendChild(script);
		}

		// Try CDN first, then API fallback
		try {
			injectScript(cdnSrc);
		} catch (e) {
			console.warn('Could not inject axe-core script:', e);
			injectScript(apiFallback);
		}

		return () => {
			// no cleanup: scripts persist on the page
		};
	}, []);


	const getImpactIcon = (impact: string) => {
		return getImpactIndicator(impact).icon;
	};

	const formatNodeInfo = (node: AxeNode): string => {
		if (node.target && Array.isArray(node.target) && node.target.length > 0) {
			// Return the CSS selector
			return node.target.join(', ');
		}
		if (node.html) {
			// Return a truncated version of the HTML
			const html = node.html;
			return html.length > 100 ? html.substring(0, 100) + '...' : html;
		}
		return 'Unknown element';
	};

	return (
		<SiteHealthTemplate<AxeCoreResponse>
			siteName={siteName}
			title="Axe-Core Accessibility"
			endpoint={{
				endpoint: '/api/site-health/axe-core',
				responseTransformer: (result) => result, // Result is already in the correct format
			}}
		>
			{(data) => {
				if (!data?.data || data.data.length === 0) {
					return (
						<p style={{ color: '#6b7280' }}>No axe-core data available for this site.</p>
					);
				}

				const siteData = data.data[0];

				if (siteData.status === 'error') {
					return (
						<p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              Error: {siteData.error}
						</p>
					);
				}

				const { result, summary } = siteData;

				return (
					<>
						<h4 className="health-site-name">
							{siteData.site.replace('-', ' ')}
						</h4>
						<p className="health-site-url">
              URL: {siteData.url}
						</p>

						{/* Summary Statistics */}
						<div className="health-score-container">
							<div className="health-score-item">
								<div className="health-score-label">Accessibility Summary</div>
								<div className="health-score-grid">
									<div className="health-stat-item">
										<span className="health-stat-label">Violations : </span>
										<span className="health-stat-value" style={{ color: summary.violations > 0 ? '#ef4444' : '#10b981' }}>
											{summary.violations}
										</span>
									</div>
									<div className="health-stat-item">
										<span className="health-stat-label">Passes : </span>
										<span className="health-stat-value" style={{ color: '#10b981' }}>
											{summary.passes}
										</span>
									</div>
									<div className="health-stat-item">
										<span className="health-stat-label">Incomplete : </span>
										<span className="health-stat-value" style={{ color: '#f59e0b' }}>
											{summary.incomplete}
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Impact Breakdown */}
						{summary.violations > 0 && (
							<div className="health-score-container">
								<div className="health-score-item">
									<div className="health-score-label">Violation Impact Levels</div>
									<div className="health-score-grid">
										<div className="health-stat-item">
											<span className="health-stat-label">Critical : </span>
											<span className="health-stat-value" style={{ color: getImpactColor('critical') }}>
												{summary.critical}
											</span>
										</div>
										<div className="health-stat-item">
											<span className="health-stat-label">Serious : </span>
											<span className="health-stat-value" style={{ color: getImpactColor('serious') }}>
												{summary.serious}
											</span>
										</div>
										<div className="health-stat-item">
											<span className="health-stat-label">Moderate : </span>
											<span className="health-stat-value" style={{ color: getImpactColor('moderate') }}>
												{summary.moderate}
											</span>
										</div>
										<div className="health-stat-item">
											<span className="health-stat-label">Minor : </span>
											<span className="health-stat-value" style={{ color: getImpactColor('minor') }}>
												{summary.minor}
											</span>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Violations List */}
						{result.violations.length > 0 && (
							<div>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Accessibility Violations
								</h5>
								<div className="health-audit-list">
									{result.violations
										.sort((a: any, b: any) => {
											const impactOrder = { critical: 4, serious: 3, moderate: 2, minor: 1 };
											return impactOrder[b.impact as keyof typeof impactOrder] - impactOrder[a.impact as keyof typeof impactOrder];
										})
										.slice(0, 20)
										.map((violation: AxeViolation) => (
											<div key={violation.id} className="health-audit-item">
												<span className="health-audit-icon">
													{getImpactIcon(violation.impact)}
												</span>
												<div className="health-audit-content">
													<span className="health-audit-title">
														{violation.help} ({violation.impact})
													</span>
													<p className="health-audit-description">
														{violation.description}
													</p>
													{violation.nodes && violation.nodes.length > 0 && (
														<div className="health-audit-details">
															<div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              Affected elements ({violation.nodes.length}):
																{violation.nodes.map((node, idx) => (
																	<div key={idx} style={{ marginBottom: '0.125rem' }}>
																		{formatNodeInfo(node)}
																	</div>
																))}
															</div>
														</div>
													)}
													<div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
														<a
															href={violation.helpUrl}
															target="_blank"
															rel="noopener noreferrer"
															style={{ color: '#3b82f6', textDecoration: 'underline' }}
														>
                            Learn more about this rule
														</a>
													</div>
												</div>
											</div>
										))}
								</div>
							</div>
						)}

						{/* Passes Section */}
						{result.passes.length > 0 && result.violations.length === 0 && (
							<div>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#10b981' }}>
									{getPassingIndicator().icon} All Accessibility Checks Passed
								</h5>
								<p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
									{result.passes.length} accessibility rules were successfully validated.
								</p>
							</div>
						)}

						{/* Incomplete Tests */}
						{result.incomplete.length > 0 && (
							<div style={{ marginTop: '15px' }}>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#f59e0b' }}>
                  Incomplete Tests ({result.incomplete.length})
								</h5>
								<div className="health-audit-list">
									{result.incomplete
										.sort((a: any, b: any) => a.id.localeCompare(b.id))
										.slice(0, 10)
										.map((incomplete: AxeViolation) => (
											<div key={incomplete.id} className="health-audit-item">
												<span className="health-audit-icon">
													{getIncompleteIndicator().icon}
												</span>
												<div className="health-audit-content">
													<span className="health-audit-title">
														{incomplete.help}
													</span>
													<p className="health-audit-description">
														{incomplete.description}
													</p>
													{incomplete.nodes && incomplete.nodes.length > 0 && (
														<div className="health-audit-details">
															<div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                              Elements tested ({incomplete.nodes.length}):
																{incomplete.nodes.slice(0, 3).map((node, idx) => (
																	<div key={idx} style={{ marginBottom: '0.125rem' }}>
																		{formatNodeInfo(node)}
																	</div>
																))}
																{incomplete.nodes.length > 3 && (
																	<div style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>
                                  ... and {incomplete.nodes.length - 3} more elements
																	</div>
																)}
															</div>
														</div>
													)}
													<div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
														<a
															href={incomplete.helpUrl}
															target="_blank"
															rel="noopener noreferrer"
															style={{ color: '#3b82f6', textDecoration: 'underline' }}
														>
                            Learn more about this rule
														</a>
													</div>
												</div>
											</div>
										))}
								</div>
							</div>
						)}

						<div className="health-timestamp">
							<div>Tested with axe-core {result.testEngine?.version || 'unknown'}</div>
							<div>Last checked: {new Date(siteData.timestamp).toLocaleString()}</div>
						</div>
					</>
				);
			}}
		</SiteHealthTemplate>
	);
}