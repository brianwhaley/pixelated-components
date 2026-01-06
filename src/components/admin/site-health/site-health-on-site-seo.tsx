'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { SiteHealthTemplate } from './site-health-template';
import { getScoreIndicator } from './site-health-indicators';
import { formatAuditItem, getAuditScoreIcon, getScoreColor } from './site-health-utils';

// On-Site SEO Audit Interface
interface OnSiteSEOAudit {
  id: string;
  title: string;
  score: number | null; // 0-1 scale
  scoreDisplayMode: 'numeric' | 'binary' | 'notApplicable';
  displayValue?: string;
  category: 'on-page' | 'on-site';
  details?: {
    items?: Array<Record<string, unknown>>;
  };
}

// Page Analysis Interface
interface PageAnalysis {
  url: string;
  title?: string;
  statusCode: number;
  audits: OnSiteSEOAudit[];
  crawledAt: string;
}

// On-Site SEO Data Interface
interface OnSiteSEOData {
  site: string;
  url: string;
  overallScore: number | null;
  pagesAnalyzed: PageAnalysis[];
  onSiteAudits: OnSiteSEOAudit[];
  totalPages: number;
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Restructure audits by type with all pages and their individual results
 */
function restructureAuditsByType(pagesAnalyzed: PageAnalysis[]): OnSiteSEOAudit[] {
	const auditMap = new Map<string, {
		audit: OnSiteSEOAudit;
		pageResults: Array<{ pageUrl: string; pageTitle?: string; score: number | null; displayValue?: string; details?: any }>;
	}>();

	// Collect all audit results by type
	pagesAnalyzed.forEach(page => {
		page.audits.forEach(audit => {
			if (!auditMap.has(audit.id)) {
				auditMap.set(audit.id, {
					audit: { ...audit },
					pageResults: []
				});
			}

			auditMap.get(audit.id)!.pageResults.push({
				pageUrl: page.url,
				pageTitle: page.title,
				score: audit.score,
				displayValue: audit.displayValue,
				details: audit.details
			});
		});
	});

	// Create restructured audits with all pages
	const restructuredAudits: OnSiteSEOAudit[] = [];

	auditMap.forEach(({ audit, pageResults }) => {
		// Calculate overall score for this audit type
		const validScores = pageResults.map(r => r.score).filter(score => score !== null) as number[];
		const overallScore = validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : null;

		// Include ALL pages for this audit type (not just failed ones)
		const allPageResults: Array<Record<string, unknown>> = [];
		pageResults.forEach(result => {
			allPageResults.push({
				page: result.pageTitle || result.pageUrl,
				url: result.pageUrl,
				score: result.score,
				displayValue: result.displayValue,
				details: result.details
			});
		});

		// Create restructured audit
		const passCount = pageResults.filter(r => r.score === 1).length;
		const totalCount = pageResults.length;

		const restructuredAudit: OnSiteSEOAudit = {
			id: audit.id,
			title: audit.title,
			score: overallScore,
			scoreDisplayMode: audit.scoreDisplayMode,
			displayValue: `${passCount}/${totalCount} pages pass`,
			category: audit.category,
			details: (overallScore !== null && overallScore < 1 && allPageResults.length > 0) ? {
				items: allPageResults.filter(r => r.score !== 1) // Only show failed pages in details
			} : undefined
		};

		restructuredAudits.push(restructuredAudit);
	});

	return restructuredAudits.sort((a, b) => (b.score || 0) - (a.score || 0));
}

// Fetch real SEO data from API
async function fetchOnSiteSEOData(siteName: string): Promise<OnSiteSEOData> {
	try {
		const response = await fetch(`/api/site-health/on-site-seo?siteName=${encodeURIComponent(siteName)}`);

		if (!response.ok) {
			throw new Error(`API request failed: ${response.status} ${response.statusText}`);
		}

		const data = await response.json();

		if (data.status === 'error') {
			throw new Error(data.error || 'SEO analysis failed');
		}

		// Process data to aggregate audits by type across all pages
		// const aggregatedOnPageAudits = restructureAuditsByType(data.pagesAnalyzed);

		return data;
	} catch (error) {
		console.error('Error fetching SEO data:', error);
		// Return error structure that the template can display
		return {
			site: siteName,
			url: '',
			overallScore: null,
			pagesAnalyzed: [],
			onSiteAudits: [],
			totalPages: 0,
			timestamp: new Date().toISOString(),
			status: 'error',
			error: error instanceof Error ? error.message : 'Failed to fetch SEO data'
		};
	}
}

SiteHealthOnSiteSEO.propTypes = {
	siteName: PropTypes.string.isRequired,
};
export type SiteHealthOnSiteSEOType = InferProps<typeof SiteHealthOnSiteSEO.propTypes>;
export function SiteHealthOnSiteSEO({ siteName }: SiteHealthOnSiteSEOType) {
	return (
		<SiteHealthTemplate
			siteName={siteName}
			title="On-Site SEO"
			fetchData={fetchOnSiteSEOData}
		>
			{(data: OnSiteSEOData | null) => {
				if (!data) return null;

				if (data.status === 'error') {
					return (
						<p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              Error: {data.error}
						</p>
					);
				}

				// Process data to aggregate audits by type across all pages
				const aggregatedOnPageAudits = restructureAuditsByType(data.pagesAnalyzed);

				const formatPageIssue = (item: Record<string, unknown>): string => {
					// Handle page-specific results from restructured data
					if (item.page && typeof item.page === 'string') {
						const pageName = item.page;
						const score = item.score as number;
						const displayValue = item.displayValue as string;
						const details = item.details as { items?: Array<Record<string, unknown>> };

						let result = `${pageName}: ${Math.round(score * 100)}%`;

						// Add display value if present
						if (displayValue) {
							result += ` (${displayValue})`;
						}

						// Add detailed breakdown for semantic tags
						if (details?.items && Array.isArray(details.items)) {
							const requiredSection = details.items.find(item => item.type === 'required');
							const optionalSection = details.items.find(item => item.type === 'optional');
							const summarySection = details.items.find(item => item.type === 'summary');

							if (requiredSection?.tags && Array.isArray(requiredSection.tags)) {
								const requiredTags = requiredSection.tags as Array<{tag: string, present: boolean}>;
								const presentRequired = requiredTags.filter(t => t.present).map(t => t.tag);
								const missingRequired = requiredTags.filter(t => !t.present).map(t => t.tag);

								result += `\n  Required tags found: ${presentRequired.join(', ') || 'none'}`;
								if (missingRequired.length > 0) {
									result += `\n  Required tags missing: ${missingRequired.join(', ')}`;
								}
							}

							if (optionalSection?.tags && Array.isArray(optionalSection.tags)) {
								const optionalTags = optionalSection.tags as Array<{tag: string, present: boolean}>;
								const presentOptional = optionalTags.filter(t => t.present).map(t => t.tag);

								if (presentOptional.length > 0) {
									result += `\n  Optional tags found: ${presentOptional.join(', ')}`;
								}
							}

							if (summarySection) {
								const totalCount = summarySection.totalCount as number;
								result += `\n  Total semantic tags: ${totalCount}`;
							}
						}

						return result;
					}

					// Fallback to original formatting
					return formatAuditItem(item);
				};

				return (
					<>
						{aggregatedOnPageAudits.length > 0 && (
							<div>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
									On-Page SEO Audits
								</h5>
								<div className="health-audit-list">
									{aggregatedOnPageAudits
										.filter(audit => audit.scoreDisplayMode !== 'notApplicable')
										.sort((a, b) => (b.score || 0) - (a.score || 0))
										.map((audit) => (
											<div key={audit.id} className="health-audit-item">
												<span className="health-audit-icon">
													{getAuditScoreIcon(audit.score)}
												</span>
												<div className="health-audit-content">
													<span className="health-audit-title">
														{audit.score === null ? '(N/A)' : `(${Math.round((audit.score || 0) * 100)}%)`} {audit.title}
													</span>
													{audit.displayValue && audit.score !== 1 && (
														<p className="health-audit-description">
															{audit.displayValue}
														</p>
													)}
													{audit.details && audit.details.items && Array.isArray(audit.details.items) && audit.details.items.length > 0 && audit.score !== 1 && (
														<div className="health-audit-details">
															<div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
																{audit.details.items
																	.filter((item: Record<string, unknown>) => (item.score as number) !== 1)
																	.map((item: Record<string, unknown>, idx: number) => (
																		<div key={idx} style={{ marginBottom: '0.125rem' }}>
																			{formatPageIssue(item)}
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

						{data.onSiteAudits.length > 0 && (
							<div style={{ marginTop: aggregatedOnPageAudits.length > 0 ? '2rem' : '0' }}>
								<h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
									On-Site SEO Audits
								</h5>
								<div className="health-audit-list">
									{data.onSiteAudits
										.filter(audit => audit.scoreDisplayMode !== 'notApplicable')
										.sort((a, b) => (b.score || 0) - (a.score || 0))
										.map((audit) => (
											<div key={audit.id} className="health-audit-item">
												<span className="health-audit-icon">
													{getAuditScoreIcon(audit.score)}
												</span>
												<div className="health-audit-content">
													<span className="health-audit-title">
														{audit.score === null ? '(N/A)' : `(${Math.round((audit.score || 0) * 100)}%)`} {audit.title}
													</span>
													{audit.displayValue && audit.score !== 1 && (
														<p className="health-audit-description">
															{audit.displayValue}
														</p>
													)}
													{audit.details && audit.details.items && Array.isArray(audit.details.items) && audit.details.items.length > 0 && audit.score !== 1 && (
														<div className="health-audit-details">
															<div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
																{audit.details.items
																	.filter((item: Record<string, unknown>) => (item.score as number) !== 1)
																	.map((item: Record<string, unknown>, idx: number) => (
																		<div key={idx} style={{ marginBottom: '0.125rem' }}>
																			{formatAuditItem(item)}
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
							Last checked: {new Date(data.timestamp).toLocaleString()}
						</p>
					</>
				);
			}}
		</SiteHealthTemplate>
	);
}