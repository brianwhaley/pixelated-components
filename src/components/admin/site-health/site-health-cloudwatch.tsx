'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SiteHealthTemplate } from './site-health-template';

interface CloudwatchHealthCheckData {
  date: string;
  successCount: number;
  failureCount: number;
  totalChecks: number;
  successRate: number;
}

/**
 * SiteHealthCloudwatch — Displays CloudWatch health-check metrics and availability over time.
 *
 * @param {string} [props.siteName] - Site identifier used to fetch CloudWatch metrics.
 * @param {string} [props.startDate] - Optional ISO date string to restrict the start of the range.
 * @param {string} [props.endDate] - Optional ISO date string to restrict the end of the range.
 */
SiteHealthCloudwatch.propTypes = {
/** Site identifier used to fetch CloudWatch metrics */
	siteName: PropTypes.string.isRequired,
	/** ISO start date for the metrics range (optional) */
	startDate: PropTypes.string,
	/** ISO end date for the metrics range (optional) */
	endDate: PropTypes.string,
};
export type SiteHealthCloudwatchType = InferProps<typeof SiteHealthCloudwatch.propTypes>;
export function SiteHealthCloudwatch({ siteName, startDate, endDate }: SiteHealthCloudwatchType) {
	return (
		<SiteHealthTemplate<CloudwatchHealthCheckData[]>
			siteName={siteName}
			title="CloudWatch Uptime"
			columnSpan={2}
			endpoint={{
				endpoint: '/api/site-health/cloudwatch',
				params: {
					...(startDate && { startDate }),
					...(endDate && { endDate }),
				},
				responseTransformer: (result) => result.data, // Extract the data array from the response
			}}
		>
			{(data) => {
				// Ensure data is an array
				if (!data || !Array.isArray(data) || data.length === 0) {
					return (
						<div className="health-visualization-placeholder">
							<div className="health-text-secondary">No uptime data available. Route53 health checks may not be configured to send metrics to CloudWatch.</div>
						</div>
					);
				}

				// Check if all data points have zero checks (no actual data)
				const hasActualData = data.some((point: any) => point && typeof point === 'object' && point.totalChecks > 0);

				if (!hasActualData) {
					return (
						<div className="health-visualization-placeholder">
							<div className="health-text-secondary">
								Health check exists but has no metric data in CloudWatch for the selected period.<br/>
								Route53 health checks must be configured to send metrics to CloudWatch for historical data.
							</div>
						</div>
					);
				}

				// Filter out any invalid data points
				const validData = data.filter((point: any) => 
					point && 
					typeof point === 'object' && 
					typeof point.date === 'string' && 
					typeof point.successCount === 'number' && 
					typeof point.failureCount === 'number' &&
					typeof point.totalChecks === 'number' &&
					typeof point.successRate === 'number'
				);

				if (validData.length === 0) {
					return (
						<div className="health-visualization-placeholder">
							<div className="health-text-secondary">Invalid data format received from CloudWatch API.</div>
						</div>
					);
				}

				return (
					<div>
						<div style={{ width: '100%', height: '400px', border: '1px solid #ddd' }}>
							<ResponsiveContainer width="100%" height="100%">
								<ComposedChart
									data={validData}
									key={`cloudwatch-chart-${validData.length}`}
									margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
								>
									<text x="50%" y={20} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#374151">
                    CloudWatch Health Check Availability Over Time
									</text>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tick={{ fontSize: 12 }}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis
										tick={{ fontSize: 12 }}
										label={{ value: 'Check Count', angle: -90, position: 'insideLeft' }}
									/>
									<Tooltip
										formatter={(value: number | undefined, name: string | undefined) => [
											value?.toLocaleString() || '0',
											name || 'Unknown'
										]}
										labelFormatter={(label: React.ReactNode) => `Date: ${String(label)}`}
									/>
									<Legend
										wrapperStyle={{
											fontSize: '12px',
											paddingTop: '10px'
										}}
									/>
									<Bar
										dataKey="successCount"
										stackId="checks"
										fill="#10b981"
										name="Successful Checks"
										radius={[2, 2, 0, 0]}
									/>
									<Bar
										dataKey="failureCount"
										stackId="checks"
										fill="#ef4444"
										name="Failed Checks"
										radius={[2, 2, 0, 0]}
									/>
								</ComposedChart>
							</ResponsiveContainer>
						</div>
					</div>
				);
			}}
		</SiteHealthTemplate>
	);
}