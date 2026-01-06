'use client';

import React, { useCallback } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { CoreWebVitalsResponse } from './site-health-types';
import { getScoreIndicator } from './site-health-indicators';

SiteHealthPerformance.propTypes = {
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthPerformanceType = InferProps<typeof SiteHealthPerformance.propTypes>;
export function SiteHealthPerformance({ siteName }: SiteHealthPerformanceType) {
	const fetchCWVData = useCallback(async (site: string) => {
		const response = await fetch(`/api/site-health/core-web-vitals?siteName=${encodeURIComponent(site)}`);
		const result: CoreWebVitalsResponse = await response.json();

		if (!result.success) {
			throw new Error(result.error || 'Failed to fetch Core Web Vitals data');
		}

		return result;
	}, []);

	return (
		<SiteHealthTemplate<CoreWebVitalsResponse>
			siteName={siteName}
			title="PageSpeed - Performance"
			fetchData={fetchCWVData}
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

				const getAuditScoreIcon = (score: number | null) => {
					return getScoreIndicator(score).icon;
				};

				const getScoreColor = (score: number | null) => {
					return getScoreIndicator(score).color;
				};

				const formatScore = (score: number | null) => {
					if (score === null) return 'N/A';
					return `${Math.round(score * 100)}%`;
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

					// Handle timing data with more context
					if (item.duration && typeof item.duration === 'number') {
						const duration = item.duration;
						let context = '';
						if (item.url && typeof item.url === 'string') {
							context = ` for ${item.url}`;
						} else if (item.source && typeof item.source === 'string') {
							context = ` for ${item.source}`;
						} else if (item.name && typeof item.name === 'string') {
							context = ` for ${item.name}`;
						} else if (item.path && typeof item.path === 'string') {
							context = ` for ${item.path}`;
						} else if (item.request && typeof item.request === 'string') {
							context = ` for ${item.request}`;
						}
						return `${duration.toFixed(2)}ms${context}`;
					}

					// Handle response times
					if (item.responseTime && typeof item.responseTime === 'number') {
						const url = (item.url && typeof item.url === 'string') ? ` (${item.url})` : '';
						return `${item.responseTime.toFixed(2)}ms response time${url}`;
					}

					// Handle start/end times
					if ((item.startTime || item.endTime) && typeof (item.startTime || item.endTime) === 'number') {
						const start = item.startTime && typeof item.startTime === 'number' ? item.startTime.toFixed(2) : '?';
						const end = item.endTime && typeof item.endTime === 'number' ? item.endTime.toFixed(2) : '?';
						const url = (item.url && typeof item.url === 'string') ? ` for ${item.url}` : '';
						return `${start}ms - ${end}ms${url}`;
					}

					// Handle transfer size with timing
					if (item.transferSize && typeof item.transferSize === 'number' && item.duration && typeof item.duration === 'number') {
						const size = (item.transferSize / 1024).toFixed(1);
						const time = item.duration.toFixed(2);
						const url = (item.url && typeof item.url === 'string') ? ` (${item.url})` : '';
						return `${size} KB in ${time}ms${url}`;
					}

					// Handle main thread time
					if (item.mainThreadTime && typeof item.mainThreadTime === 'number') {
						return `${item.mainThreadTime.toFixed(1)}ms`;
					}

					// For other objects, try to find a meaningful display
					if (item.group && typeof item.group === 'string') {
						return item.group;
					}

					if (item.type && typeof item.type === 'string') {
						return item.type;
					}

					// If we can't find anything meaningful, provide a generic description
					// This handles raw timing data that might be from various performance metrics
					if (typeof item === 'number') {
						return `${(item as number).toFixed(2)}ms`;
					}

					if (item.value && typeof item.value === 'number') {
						const unit = item.unit || 'ms';
						return `${item.value.toFixed(2)}${unit}`;
					}

					return 'Performance metric data available';
				};

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