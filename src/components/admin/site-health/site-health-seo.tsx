'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { CoreWebVitalsResponse } from './site-health-types';
import { getScoreIndicator } from './site-health-indicators';
import { formatAuditItem, getAuditScoreIcon, getScoreColor } from './site-health-utils';

/**
 * SiteHealthSEO — SEO report panel focused on searchability and structured data checks.
 *
 * @param {string} [props.siteName] - Site identifier used to fetch SEO-related metrics.
 */
SiteHealthSEO.propTypes = {
/** Site identifier used to fetch SEO data */
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthSEOType = InferProps<typeof SiteHealthSEO.propTypes>;
export function SiteHealthSEO({ siteName }: SiteHealthSEOType) {
	return (
		<SiteHealthTemplate<CoreWebVitalsResponse>
			siteName={siteName}
			title="PageSpeed - SEO"
			endpoint={{
				endpoint: '/api/site-health/core-web-vitals',
				responseTransformer: (result) => result, // Result is already in the correct format
			}}
		>
			{(data) => {
				if (!data?.data || data.data.length === 0) {
					return (
						<p style={{ color: '#6b7280' }}>No SEO data available for this site.</p>
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

						{/* SEO Score */}
						{siteData.scores.seo !== null && (
							<div className="health-score-container">
								<div className="health-score-item">
									<div className="health-score-label">SEO Score</div>
									<div className="health-score-value" style={{ color: getScoreColor(siteData.scores.seo) }}>
										{Math.round((siteData.scores.seo || 0) * 100)}%
									</div>
									<div className="health-score-bar">
										<div
											className="health-score-fill"
											style={{
												width: `${(siteData.scores.seo || 0) * 100}%`,
												backgroundColor: getScoreColor(siteData.scores.seo)
											}}
										/>
									</div>
								</div>
							</div>
						)}

						{/* SEO Audits */}
						{siteData.categories.seo && siteData.categories.seo.audits.length > 0 && (
							<div>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                  SEO Issues & Recommendations
								</h5>
								<div className="health-audit-list">
									{siteData.categories.seo.audits
										.filter((audit: any) => audit.scoreDisplayMode !== 'notApplicable')
										.sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
										.slice(0, 20)
										.map((audit: any) => (
											<div key={audit.id} className="health-audit-item">
												<span className="health-audit-icon">
													{getAuditScoreIcon(audit.score)}
												</span>
												<div className="health-audit-content">
													<span className="health-audit-title">
                          ({Math.round((audit.score || 0) * 100)}%) {audit.title}
													</span>
													{audit.displayValue && (
														<p className="health-audit-description">
															{audit.displayValue}
														</p>
													)}
													{(audit.details as any)?.items && Array.isArray((audit.details as any).items) && (audit.details as any).items.length > 0 && (audit.score || 0) < 1.0 && (
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