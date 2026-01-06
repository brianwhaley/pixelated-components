'use client';

import React, { useCallback } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { CoreWebVitalsResponse } from './site-health-types';
import { getScoreIndicator } from './site-health-indicators';
import { formatScore, getScoreColor } from './site-health-utils';

SiteHealthOverview.propTypes = {
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthOverviewType = InferProps<typeof SiteHealthOverview.propTypes>;
export function SiteHealthOverview({ siteName }: SiteHealthOverviewType) {
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
			title="PageSpeed - Site Overview"
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

				// Helper functions

				const getStatusColor = (status: 'good' | 'needs-improvement' | 'poor' | null) => {
					switch (status) {
					case 'good': return '#10b981'; // green
					case 'needs-improvement': return '#f59e0b'; // yellow
					case 'poor': return '#ef4444'; // red
					default: return '#6b7280'; // gray
					}
				};

				const getMetricStatus = (value: number, thresholds: { good: number; poor: number }) => {
					if (value <= thresholds.good) return 'good';
					if (value <= thresholds.poor) return 'needs-improvement';
					return 'poor';
				};

				const formatMetric = (value: number, unit: string) => {
					if (value === null || value === undefined) return 'N/A';
					if (unit === 'ms') {
						return `${Math.round(value)}ms`;
					}
					if (unit === '') {
						return value.toFixed(3);
					}
					return `${value}${unit}`;
				};

				return (
					<>
						<h4 className="health-site-name">
							{siteData.site.replace('-', ' ')}
						</h4>
						<p className="health-site-url">
              URL: {siteData.url}
						</p>

						{/* Scores Section */}
						<div className="health-score-container">
							{Object.entries(siteData.scores)
								.filter(([, score]) => score !== null)
								.map(([category, score]) => {
									const numScore = score as number | null;
									return (
										<div key={category} className="health-score-item">
											<div className="health-score-label">
												{category.replace('-', ' ')}
											</div>
											<div className="health-score-value" style={{ color: getScoreColor(numScore) }}>
												{formatScore(numScore)}
											</div>
											<div className="health-score-bar">
												<div
													className="health-score-fill"
													style={{
														width: numScore !== null ? `${numScore * 100}%` : '0%',
														backgroundColor: numScore !== null ? getScoreColor(numScore) : '#6b7280'
													}}
												/>
											</div>
										</div>
									);
								})}
						</div>

						{/* Core Web Vitals Section */}
						<div style={{ marginBottom: '1.5rem' }}>
							<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                        Core Web Vitals
							</h5>
							<div className="health-cwv-grid">
								<div className="health-cwv-item">
									<span className="health-cwv-label">Cumulative Layout Shift:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.cls, { good: 0.1, poor: 0.25 })) }}>
										{formatMetric(siteData.metrics.cls, '')}
									</span>
								</div>
								<div className="health-cwv-item">
									<span className="health-cwv-label">First Input Delay:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.fid, { good: 100, poor: 300 })) }}>
										{formatMetric(siteData.metrics.fid, 'ms')}
									</span>
								</div>
								<div className="health-cwv-item">
									<span className="health-cwv-label">Largest Contentful Paint:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.lcp, { good: 2500, poor: 4000 })) }}>
										{formatMetric(siteData.metrics.lcp, 'ms')}
									</span>
								</div>
								<div className="health-cwv-item">
									<span className="health-cwv-label">First Contentful Paint:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.fcp, { good: 1800, poor: 3000 })) }}>
										{formatMetric(siteData.metrics.fcp, 'ms')}
									</span>
								</div>
								<div className="health-cwv-item">
									<span className="health-cwv-label">Time to First Byte:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.ttfb, { good: 800, poor: 1800 })) }}>
										{formatMetric(siteData.metrics.ttfb, 'ms')}
									</span>
								</div>
								<div className="health-cwv-item">
									<span className="health-cwv-label">Speed Index:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.speedIndex, { good: 3400, poor: 5800 })) }}>
										{formatMetric(siteData.metrics.speedIndex, 'ms')}
									</span>
								</div>
								<div className="health-cwv-item">
									<span className="health-cwv-label">Time to Interactive:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.interactive, { good: 3800, poor: 7300 })) }}>
										{formatMetric(siteData.metrics.interactive, 'ms')}
									</span>
								</div>
								<div className="health-cwv-item">
									<span className="health-cwv-label">Total Blocking Time:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.totalBlockingTime, { good: 200, poor: 600 })) }}>
										{formatMetric(siteData.metrics.totalBlockingTime, 'ms')}
									</span>
								</div>
								<div className="health-cwv-item">
									<span className="health-cwv-label">First Meaningful Paint:</span>
									<span className="health-cwv-value" style={{ color: getStatusColor(getMetricStatus(siteData.metrics.firstMeaningfulPaint, { good: 2000, poor: 4000 })) }}>
										{formatMetric(siteData.metrics.firstMeaningfulPaint, 'ms')}
									</span>
								</div>
							</div>
						</div>

						<p className="health-timestamp">
                      Last checked: {new Date(siteData.timestamp).toLocaleString()}
						</p>
					</>
				);
			}}
		</SiteHealthTemplate>
	);
}