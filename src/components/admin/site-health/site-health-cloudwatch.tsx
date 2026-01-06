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

SiteHealthCloudwatch.propTypes = {
	siteName: PropTypes.string.isRequired,
	startDate: PropTypes.string,
	endDate: PropTypes.string,
};
export type SiteHealthCloudwatchType = InferProps<typeof SiteHealthCloudwatch.propTypes>;
export function SiteHealthCloudwatch({ siteName, startDate, endDate }: SiteHealthCloudwatchType) {
	const fetchCloudwatchData = async (site: string) => {
		const params = new URLSearchParams({ siteName: site });
		if (startDate) params.append('startDate', startDate);
		if (endDate) params.append('endDate', endDate);
		const response = await fetch(`/api/site-health/cloudwatch?${params.toString()}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch CloudWatch data: ${response.status}`);
		}

		const result = await response.json();

		if (!result.success) {
			if (result.error?.includes('Health Check ID not configured')) {
				throw new Error('Route53 Health Check ID not configured for this site');
			} else {
				throw new Error(result.error || 'Failed to load CloudWatch health check data');
			}
		}

		return result.data;
	};

	return (
		<SiteHealthTemplate<CloudwatchHealthCheckData[]>
			siteName={siteName}
			title="CloudWatch Uptime"
			columnSpan={2}
			fetchData={fetchCloudwatchData}
		>
			{(data) => {
				if (!data || data.length === 0) {
					return (
						<div className="health-visualization-placeholder">
							<div className="health-text-secondary">No uptime data available. Route53 health checks may not be configured to send metrics to CloudWatch.</div>
						</div>
					);
				}

				// Check if all data points have zero checks (no actual data)
				const hasActualData = data.some((point: any) => point.totalChecks > 0);

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

				return (
					<div>
						<div style={{ width: '100%', height: '400px', border: '1px solid #ddd' }}>
							<ResponsiveContainer width="100%" height="100%">
								<ComposedChart
									data={data}
									key={`cloudwatch-chart-${data.length}`}
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
										labelFormatter={(label: string) => `Date: ${label}`}
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