'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { CoreWebVitalsResponse } from './site-health-types';
import { getScoreIndicator } from './site-health-indicators';
import { formatAuditItem, getAuditScoreIcon, getScoreColor, formatScore } from './site-health-utils';

SiteHealthAccessibility.propTypes = {
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthAccessibilityType = InferProps<typeof SiteHealthAccessibility.propTypes>;
export function SiteHealthAccessibility({ siteName }: SiteHealthAccessibilityType) {
	return (
		<SiteHealthTemplate<CoreWebVitalsResponse>
			siteName={siteName}
			title="PageSpeed - Accessibility"
			endpoint={{
				endpoint: '/api/site-health/core-web-vitals',
				responseTransformer: (result) => result, // Result is already in the correct format
			}}
		>
			{(data) => {
				if (!data?.data || data.data.length === 0) {
					return (
						<p style={{ color: '#6b7280' }}>No accessibility data available for this site.</p>
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

						{/* Accessibility Score */}
						{siteData.scores.accessibility !== null && (
							<div className="health-score-container">
								<div className="health-score-item">
									<div className="health-score-label">Accessibility Score</div>
									<div className="health-score-value" style={{ color: getScoreColor(siteData.scores.accessibility) }}>
										{Math.round((siteData.scores.accessibility || 0) * 100)}%
									</div>
									<div className="health-score-bar">
										<div
											className="health-score-fill"
											style={{
												width: `${(siteData.scores.accessibility || 0) * 100}%`,
												backgroundColor: getScoreColor(siteData.scores.accessibility)
											}}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Accessibility Audits */}
						{siteData.categories.accessibility && siteData.categories.accessibility.audits.length > 0 && (
							<div>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Accessibility Issues & Recommendations
								</h5>
								<div className="health-audit-list">
									{siteData.categories.accessibility.audits
										.filter((audit: any) => audit.scoreDisplayMode !== 'notApplicable')
										.sort((a: any, b: any) => {
											// Prioritize specific important accessibility audits
											const priorityAudits = [
												'color-contrast',
												'image-alt',
												'label',
												'button-name',
												'link-name',
												'heading-order',
												'focusable-controls',
												'interactive-element-affordance',
												'logical-tab-order',
												'focus-traps',
												'bypass',
												'landmark-one-main',
												'meta-viewport',
												'html-has-lang',
												'html-lang-valid',
												'video-caption',
												'audio-caption'
											];
                      
											const aPriority = priorityAudits.indexOf(a.id);
											const bPriority = priorityAudits.indexOf(b.id);
                      
											// If both are priority audits, sort by priority order
											if (aPriority !== -1 && bPriority !== -1) {
												return aPriority - bPriority;
											}
											// If only one is priority, put it first
											if (aPriority !== -1) return -1;
											if (bPriority !== -1) return 1;
											// Otherwise sort by score
											return (b.score || 0) - (a.score || 0);
										})
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