'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Table } from '@pixelated-tech/components';
import { SiteHealthTemplate } from './site-health-template';
import type { GitData } from './site-health-types';

SiteHealthGit.propTypes = {
	siteName: PropTypes.string.isRequired,
	startDate: PropTypes.string,
	endDate: PropTypes.string,
};
export type SiteHealthGitType = InferProps<typeof SiteHealthGit.propTypes>;
export function SiteHealthGit({ siteName, startDate, endDate }: SiteHealthGitType) {
	const fetchGitData = async (site: string): Promise<GitData> => {
		const params = new URLSearchParams({ siteName: encodeURIComponent(site) });
		if (startDate) params.append('startDate', startDate);
		if (endDate) params.append('endDate', endDate);
		const response = await fetch(`/api/site-health/github?${params.toString()}`);
		if (!response.ok) {
			throw new Error('Failed to fetch git data');
		}
		const data = await response.json();
		return data;
	};

	return (
		<SiteHealthTemplate<GitData>
			siteName={siteName}
			title="Git Push Notes"
			fetchData={fetchGitData}
		>
			{(data) => {
				if (!data || !data.success) {
					return (
						<p style={{ color: '#6b7280' }}>No git data available for this site.</p>
					);
				}

				if (data.error) {
					return (
						<p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
              Error: {data.error}
						</p>
					);
				}

				// Prepare table data
				const tableData = (data.commits || []).map((commit: any) => ({
					Date: new Date(commit.date).toLocaleDateString(),
					Message: <span title={commit.message}>{commit.message}</span>,
					Version: commit.version ? (
						<span className="health-version-tag">
							{commit.version.split('~')[0]}
						</span>
					) : (
						<span className="health-text-muted">-</span>
					)
				}));

				return (
					<>
						<h4 className="health-site-name">
							{siteName.replace('-', ' ')}
						</h4>

						<div className="health-section-list">
							{tableData.length === 0 ? (
								<p className="health-empty-state">No recent commits found</p>
							) : (
								<Table id="git-table" data={tableData} altRowColor="#DDD" />
							)}
						</div>

						<p className="health-timestamp">
              Last checked: {new Date(data.timestamp).toLocaleString()}
						</p>
					</>
				);
			}}
		</SiteHealthTemplate>
	);
}