'use client';

import React, { useCallback } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { CoreWebVitalsResponse } from './site-health-types';
import { getScoreIndicator } from './site-health-indicators';

SiteHealthSEO.propTypes = {
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthSEOType = InferProps<typeof SiteHealthSEO.propTypes>;
export function SiteHealthSEO({ siteName }: SiteHealthSEOType) {
	const fetchSEOData = useCallback(async (site: string) => {
		const response = await fetch(`/api/site-health/core-web-vitals?siteName=${encodeURIComponent(site)}`);
		const result: CoreWebVitalsResponse = await response.json();

		if (!result.success) {
			throw new Error(result.error || 'Failed to fetch SEO data');
		}

		return result;
	}, []);

	return (
		<SiteHealthTemplate<CoreWebVitalsResponse>
			siteName={siteName}
			title="PageSpeed - SEO"
			fetchData={fetchSEOData}
		>
			{(data) => {
				const getScoreColor = (score: number | null) => {
					return getScoreIndicator(score).color;
				};

				const getAuditScoreIcon = (score: number | null) => {
					return getScoreIndicator(score).icon;
				};

				// Helper function to display audit item details
				const formatAuditItem = (item: Record<string, unknown>, auditTitle?: string): string => {
					// Handle URLs
					if (item.url && typeof item.url === 'string') {
						return item.url;
					}

					// Handle sources (like JavaScript files)
					if (item.source && typeof item.source === 'string') {
						return item.source;
					}

					// Handle text descriptions
					if (item.text && typeof item.text === 'string') {
						return item.text;
					}

					// Handle entities (like "Google Tag Manager")
					if (item.entity && typeof item.entity === 'string') {
						return item.entity;
					}

					// Handle nodes with selectors
					if (item.node && typeof item.node === 'object' && 'selector' in item.node) {
						return `Element: ${(item.node as { selector: string }).selector}`;
					}

					// Handle nodes with snippets
					if (item.node && typeof item.node === 'object' && 'snippet' in item.node) {
						const snippet = (item.node as { snippet: string }).snippet;
						return `Element: ${snippet.length > 50 ? snippet.substring(0, 50) + '...' : snippet}`;
					}

					// Handle origins (like domains)
					if (item.origin && typeof item.origin === 'string') {
						return item.origin;
					}

					// Handle labels
					if (item.label && typeof item.label === 'string') {
						return item.label;
					}

					// Handle numeric values with units
					if (item.value && typeof item.value === 'object' && 'type' in item.value && (item.value as { type: string }).type === 'numeric') {
						const value = item.value as unknown as { value: number; granularity?: number };
						return `${value.value}${item.unit || ''}`;
					}

					// Handle statistics
					if (item.statistic && typeof item.statistic === 'string' && item.value) {
						if (typeof item.value === 'object' && 'type' in item.value && (item.value as { type: string }).type === 'numeric') {
							const value = item.value as unknown as { value: number };
							return `${item.statistic}: ${value.value}`;
						}
						return item.statistic;
					}

					// Handle timing data with audit context
					if (typeof item === 'number') {
						let context = '';
						if (auditTitle) {
							if (auditTitle.toLowerCase().includes('server') || auditTitle.toLowerCase().includes('backend')) {
								context = ' server response';
							} else if (auditTitle.toLowerCase().includes('network') || auditTitle.toLowerCase().includes('request')) {
								context = ' network request';
							} else if (auditTitle.toLowerCase().includes('render') || auditTitle.toLowerCase().includes('blocking')) {
								context = ' render blocking';
							} else if (auditTitle.toLowerCase().includes('javascript') || auditTitle.toLowerCase().includes('js')) {
								context = ' JavaScript';
							} else if (auditTitle.toLowerCase().includes('image') || auditTitle.toLowerCase().includes('media')) {
								context = ' media resource';
							}
						}
						return `${(item as number).toFixed(2)}ms${context}`;
					}

					if (item.value && typeof item.value === 'number') {
						const unit = item.unit || 'ms';
						let context = '';
						if (auditTitle && unit === 'ms') {
							if (auditTitle.toLowerCase().includes('server')) {
								context = ' server time';
							} else if (auditTitle.toLowerCase().includes('network')) {
								context = ' network time';
							}
						}
						return `${item.value.toFixed(2)}${unit}${context}`;
					}

					// If we can't find anything meaningful, show a generic message
					return 'Details available';
				};

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