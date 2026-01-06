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
	return (
		<SiteHealthTemplate<GoogleAnalyticsData[]>
			siteName={siteName}
			title="Google Analytics"
			columnSpan={2}
			endpoint={{
				endpoint: '/api/site-health/google-analytics',
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
							<div className="health-text-secondary">No data available for the selected date range</div>
						</div>
					);
				}

				// Filter out any invalid data points
				const validData = data.filter((point: any) => 
					point && 
					typeof point === 'object' && 
					typeof point.date === 'string' && 
					typeof point.currentPageViews === 'number' && 
					typeof point.previousPageViews === 'number'
				);

				if (validData.length === 0) {
					return (
						<div className="health-visualization-placeholder">
							<div className="health-text-secondary">Invalid data format received from Google Analytics API.</div>
						</div>
					);
				}

				return (
					<div>
						<div style={{ width: '100%', height: '400px', border: '1px solid #ddd' }}>
							<ResponsiveContainer width="100%" height="100%">
								<ComposedChart
									data={validData}
									key={`chart-${validData.length}`}
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