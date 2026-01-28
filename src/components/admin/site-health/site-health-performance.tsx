'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { CoreWebVitalsResponse } from './site-health-types';
import { getScoreIndicator } from './site-health-indicators';
import { formatAuditItem, getAuditScoreIcon, getScoreColor, formatScore } from './site-health-utils';

/**
 * SiteHealthPerformance — Performance metrics panel showing Lighthouse Core Web Vitals and related scores.
 *
 * @param {string} [props.siteName] - Site identifier used to fetch performance data.
 */
SiteHealthPerformance.propTypes = {
/** Site identifier used to fetch performance metrics */
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthPerformanceType = InferProps<typeof SiteHealthPerformance.propTypes>;
export function SiteHealthPerformance({ siteName }: SiteHealthPerformanceType) {
	return (
		<SiteHealthTemplate<CoreWebVitalsResponse>
			siteName={siteName}
			title="PageSpeed - Performance"
			endpoint={{
				endpoint: '/api/site-health/core-web-vitals',
				responseTransformer: (result) => result, // Result is already in the correct format
			}}
		>
			{(data) => {
				if (!data?.data || data.data.length === 0) {
					return (
						<p style={{ color: '#6b7280' }}>No site health data available for this site.</p>
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

				return (
					<>
						<h4 className="health-site-name">
							{siteData.site.replace('-', ' ')}
						</h4>
						<p className="health-site-url">
              URL: {siteData.url}
						</p>

						{/* Performance Score */}
						<div style={{ marginBottom: '1.5rem' }}>
							<div className="health-score-item" style={{ width: '100%' }}>
								<div className="health-score-label">
                  Performance Score
								</div>
								<div className="health-score-value" style={{ color: getScoreColor(siteData.scores.performance) }}>
									{formatScore(siteData.scores.performance)}
								</div>
								<div className="health-score-bar">
									<div
										className="health-score-fill"
										style={{
											width: siteData.scores.performance !== null ? `${siteData.scores.performance * 100}%` : '0%',
											backgroundColor: siteData.scores.performance !== null ? getScoreColor(siteData.scores.performance) : '#6b7280'
										}}
									/>
								</div>
							</div>
						</div>

						{((siteData.categories.performance?.audits?.length > 0) || (siteData.categories.pwa?.audits?.length > 0)) && (
							<div>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Performance Opportunities
								</h5>
								<div className="health-audit-list">
									{[
										...(siteData.categories.performance?.audits || []),
										...(siteData.categories.pwa?.audits || [])
									]
										.filter(audit => audit.scoreDisplayMode !== 'notApplicable' && audit.score !== null && !audit.id.includes('network-requests'))
										.sort((a, b) => (b.score || 0) - (a.score || 0))
										.slice(0, 20)
										.map((audit) => (
											<div key={audit.id} className="health-audit-item">
												<span className="health-audit-icon">
													{getAuditScoreIcon(audit.score)}
												</span>
												<div className="health-audit-content">
													<span className="health-audit-title">
                          ({Math.round((audit.score || 0) * 100)}%) {audit.title}{audit.displayValue ? `: ${audit.displayValue}` : ''}
													</span>
													{(audit.details as any)?.items && Array.isArray((audit.details as any).items) && (audit.details as any).items.length > 0 && (audit.score || 0) < 0.9 && (
														<div className="health-audit-details">
															<div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
																{(audit.details as any).items.map((item: Record<string, unknown>, idx: number) => (
																	<div key={idx} style={{ marginBottom: '0.125rem' }}>
																		{formatAuditItem(item, audit.title)}
																	</div>
																))}
															</div>
														</div>
													)}
												</div>
											</div>
										))}
								</div>
							</div>
						)}

						<p className="health-timestamp">
              Last checked: {new Date(siteData.timestamp).toLocaleString()}
						</p>
					</>
				);
			}}
		</SiteHealthTemplate>
	);
}