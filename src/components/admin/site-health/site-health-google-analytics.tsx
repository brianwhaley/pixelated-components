'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SiteHealthTemplate } from './site-health-template';

interface GoogleAnalyticsData {
  date: string;
  currentPageViews: number;
  previousPageViews: number;
}

SiteHealthGoogleAnalytics.propTypes = {
	siteName: PropTypes.string.isRequired,
	startDate: PropTypes.string,
	endDate: PropTypes.string,
};
export type SiteHealthGoogleAnalyticsType = InferProps<typeof SiteHealthGoogleAnalytics.propTypes>;
export function SiteHealthGoogleAnalytics({ siteName, startDate, endDate }: SiteHealthGoogleAnalyticsType) {
	const fetchAnalyticsData = async (site: string) => {
		const params = new URLSearchParams({ siteName: site });
		if (startDate) params.append('startDate', startDate);
		if (endDate) params.append('endDate', endDate);
		const response = await fetch(`/api/site-health/google-analytics?${params.toString()}`);

		if (!response.ok) {
			throw new Error(`Failed to fetch analytics data: ${response.status}`);
		}

		const result = await response.json();

		if (!result.success) {
			// Handle specific error types
			if (result.error?.includes('invalid_grant') || result.error?.includes('authentication')) {
				throw new Error('Google Analytics authentication expired. Please re-authorize the application.');
			} else if (result.error?.includes('GA4 Property ID not configured')) {
				throw new Error('GA4 Property ID not configured for this site');
			} else {
				throw new Error(result.error || 'Failed to load analytics data');
			}
		}

		return result.data;
	};

	return (
		<SiteHealthTemplate<GoogleAnalyticsData[]>
			siteName={siteName}
			title="Google Analytics"
			columnSpan={2}
			fetchData={fetchAnalyticsData}
		>
			{(data) => {
				if (!data || data.length === 0) {
					return (
						<div className="health-visualization-placeholder">
							<div className="health-text-secondary">No data available for the selected date range</div>
						</div>
					);
				}

				return (
					<div>
						<div style={{ width: '100%', height: '400px', border: '1px solid #ddd' }}>
							<ResponsiveContainer width="100%" height="100%">
								<ComposedChart
									data={data}
									key={`chart-${data.length}`}
									margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
								>
									<text x="50%" y={20} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#374151">
                    Page Views (Current vs Previous Period)
									</text>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date"
										tick={{ fontSize: 12 }}
										angle={-45}
										textAnchor="end"
										height={60}
									/>
									<YAxis tick={{ fontSize: 12 }} />
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
										dataKey="currentPageViews"
										fill="#3b82f6"
										name="Current Period"
										radius={[2, 2, 0, 0]}
									/>
									<Line
										type="monotone"
										dataKey="previousPageViews"
										stroke="#ef4444"
										strokeWidth={2}
										strokeDasharray="5 5"
										dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
										activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
										name="Previous Period"
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