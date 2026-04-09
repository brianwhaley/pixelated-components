'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { DependencyData } from './site-health-types';

/**
 * SiteHealthDependencyVulnerabilities — Shows known dependency vulnerabilities and their severities for the site.
 *
 * @param {string} [props.siteName] - Site identifier used to fetch dependency vulnerability data.
 */
SiteHealthDependencyVulnerabilities.propTypes = {
/** Site identifier used to fetch dependency vulnerability reports */
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthDependencyVulnerabilitiesType = InferProps<typeof SiteHealthDependencyVulnerabilities.propTypes>;
export function SiteHealthDependencyVulnerabilities({ siteName }: SiteHealthDependencyVulnerabilitiesType) {
	return (
		<SiteHealthTemplate<DependencyData>
			siteName={siteName}
			title="Dependency Vulnerability"
			endpoint={{
				endpoint: '/api/site-health/security',
				responseTransformer: (result) => result, // Result is already in the correct format
			}}
		>
			{(data) => {
				if (!data) {
					return (
						<p style={{ color: '#6b7280' }}>No dependency data available for this site.</p>
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

						{/* Overall Status */}
						<div className="health-score-container">
							<div className="health-score-item">
								<div className="health-score-label">Overall Status</div>
								<div className="health-score-value" style={{
									color: data.status === 'Secure' ? '#10b981' :
										data.status === 'Low Risk' ? '#f59e0b' :
											data.status === 'Moderate Risk' ? '#f59e0b' :
												data.status === 'High Risk' ? '#ef4444' :
													data.status === 'Critical' ? '#ef4444' :
														'#6b7280'
								}}>
									{data.status}
								</div>
								<div className="health-score-bar">
									<div
										className="health-score-fill"
										style={{
											width: data.status === 'Secure' ? '100%' :
												data.status === 'Low Risk' ? '75%' :
													data.status === 'Moderate Risk' ? '50%' :
														data.status === 'High Risk' ? '25%' :
															data.status === 'Critical' ? '10%' : '0%',
											backgroundColor: data.status === 'Secure' ? '#10b981' :
												data.status === 'Low Risk' ? '#f59e0b' :
													data.status === 'Moderate Risk' ? '#f59e0b' :
														data.status === 'High Risk' ? '#ef4444' :
															data.status === 'Critical' ? '#ef4444' : '#6b7280'
										}}
									/>
								</div>
							</div>
						</div>

						{/* Dependencies Count */}
						<div className="health-audit-item">
							<span className="health-audit-icon" style={{ color: '#10b981' }}>
                ✓
							</span>
							<div className="health-audit-content">
								<span className="health-audit-title">
                  Dependencies: {data.totalDependencies || data.dependencies || 0}
								</span>
							</div>
						</div>

						{/* Vulnerabilities List */}
						{data.vulnerabilities && data.vulnerabilities.length > 0 && (
							<div>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Vulnerabilities ({data.summary.total})
								</h5>
								<div className="health-audit-list">
									{data.vulnerabilities.map((vuln: any, index: any) => (
										// eslint-disable-next-line pixelated/class-name-kebab-case
										<div key={index} className={`health-vulnerability-item health-vulnerability-${vuln.severity}`}>
											<div className="health-vulnerability-header">
												<span className="health-vulnerability-severity">
													{vuln.severity}
												</span>
												<div>
													<span className="health-vulnerability-name">
														{vuln.name}
													</span>
													{vuln.title && (
														<p className="health-vulnerability-details">
															{vuln.title}
														</p>
													)}
													<div className="health-vulnerability-meta">
														<span className="health-vulnerability-range">
                              Range: {vuln.range}
														</span>
														{vuln.fixAvailable && (
															<span className="health-vulnerability-fix">
                                ✓ Fix available
															</span>
														)}
													</div>
													{vuln.url && (
														<a
															href={vuln.url}
															target="_blank"
															rel="noopener noreferrer"
															className="health-vulnerability-link"
														>
                              View details →
														</a>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{(!data.vulnerabilities || data.vulnerabilities.length === 0) && data.status === 'Secure' && (
							<div className="health-audit-item">
								<span className="health-audit-icon" style={{ color: '#10b981' }}>
                  ✓
								</span>
								<div className="health-audit-content">
									<span className="health-audit-title">
                    No vulnerabilities found
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