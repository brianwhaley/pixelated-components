'use client';

import React, { useCallback } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import type { CoreWebVitalsResponse } from './site-health-types';
import { getScoreIndicator } from './site-health-indicators';
import { formatAuditItem, getAuditScoreIcon, getScoreColor } from './site-health-utils';

interface CombinedSecurityData {
  psiData?: CoreWebVitalsResponse;
}

SiteHealthSecurity.propTypes = {
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthSecurityType = InferProps<typeof SiteHealthSecurity.propTypes>;
export function SiteHealthSecurity({ siteName }: SiteHealthSecurityType) {
	const fetchSecurityData = useCallback(async (site: string): Promise<CombinedSecurityData> => {
		// Fetch PSI data for best practices security audits
		const psiResponse = await fetch(`/api/site-health/core-web-vitals?siteName=${encodeURIComponent(site)}`);
		const psiResult: CoreWebVitalsResponse = await psiResponse.json();

		return {
			psiData: psiResult.success ? psiResult : undefined
		};
	}, []);

	return (
		<SiteHealthTemplate<CombinedSecurityData>
			siteName={siteName}
			title="PageSpeed - Site Security"
			fetchData={fetchSecurityData}
		>
			{(data) => {
				const psiData = data?.psiData?.data?.[0];

				if (!psiData) {
					return (
						<p style={{ color: '#6b7280' }}>No security data available for this site.</p>
					);
				}

				if (psiData.status === 'error') {
					return (
						<p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              Error: {psiData.error}
						</p>
					);
				}

				return (
					<>
						<h4 className="health-site-name">
							{siteName.replace('-', ' ')}
						</h4>
						<p className="health-site-url">
              URL: {psiData.url}
						</p>

						{/* Best Practices Score */}
						{psiData.scores['best-practices'] !== null && (
							<div className="health-score-container">
								<div className="health-score-item">
									<div className="health-score-label">Best Practices Score</div>
									<div className="health-score-value" style={{ color: getScoreColor(psiData.scores['best-practices']) }}>
										{Math.round((psiData.scores['best-practices'] || 0) * 100)}%
									</div>
									<div className="health-score-bar">
										<div
											className="health-score-fill"
											style={{
												width: `${(psiData.scores['best-practices'] || 0) * 100}%`,
												backgroundColor: getScoreColor(psiData.scores['best-practices'])
											}}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Security Best Practices Audits */}
						{psiData.categories['best-practices'] && psiData.categories['best-practices'].audits.length > 0 && (
							<div>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                  Security Best Practices
								</h5>
								<div className="health-audit-list">
									{psiData.categories['best-practices'].audits
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
              Last checked: {new Date(psiData.timestamp).toLocaleString()}
						</p>
					</>
				);
			}}
		</SiteHealthTemplate>
	);
}