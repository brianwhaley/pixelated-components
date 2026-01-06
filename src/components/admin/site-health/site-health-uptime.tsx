'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { UptimeData } from './site-health-types';

SiteHealthUptime.propTypes = {
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthUptimeType = InferProps<typeof SiteHealthUptime.propTypes>;
export function SiteHealthUptime({ siteName }: SiteHealthUptimeType) {
	return (
		<SiteHealthTemplate<UptimeData>
			siteName={siteName}
			title="Health Status"
			endpoint={{
				endpoint: '/api/site-health/uptime',
				responseTransformer: (result) => result, // Result is already in the correct format
			}}
		>
			{(data) => {
				if (!data) {
					return (
						<p style={{ color: '#6b7280' }}>No uptime data available for this site.</p>
					);
				}

				return (
					<>
						<h4 className="health-site-name">
							{siteName.replace('-', ' ')}
						</h4>
						<p className="health-site-url">
              URL: {data.url}
						</p>

						{/* Health Status */}
						<div className="health-score-container">
							<div className="health-score-item">
								<div className="health-score-label">Site Status</div>
								<div className="health-score-value" style={{
									color: data.status === 'Healthy' ? '#10b981' :
										data.status === 'Unhealthy' ? '#ef4444' : '#f59e0b'
								}}>
									{data.status}
								</div>
								<div className="health-score-bar">
									<div
										className="health-score-fill"
										style={{
											width: data.status === 'Healthy' ? '100%' :
												data.status === 'Unhealthy' ? '10%' : '50%',
											backgroundColor: data.status === 'Healthy' ? '#10b981' :
												data.status === 'Unhealthy' ? '#ef4444' : '#f59e0b'
										}}
									/>
								</div>
							</div>
						</div>

						{data.message && (
							<div className="health-audit-item">
								<span className="health-audit-icon" style={{
									color: data.status === 'Healthy' ? '#10b981' :
										data.status === 'Unhealthy' ? '#ef4444' : '#f59e0b'
								}}>
									{data.status === 'Healthy' ? '✓' : data.status === 'Unhealthy' ? '✗' : '⚠'}
								</span>
								<div className="health-audit-content">
									<span className="health-audit-title">
										{data.message}
									</span>
								</div>
							</div>
						)}

						<p className="health-timestamp">
              Last checked: {new Date(data.timestamp).toLocaleString()}
						</p>
					</>
				);
			}}
		</SiteHealthTemplate>
	);
}