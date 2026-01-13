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
	return (
		<SiteHealthTemplate<GitData>
			siteName={siteName}
			title="Git Push Notes"
			endpoint={{
				endpoint: '/api/site-health/github',
				params: {
					...(startDate && { startDate }),
					...(endDate && { endDate }),
				},
				responseTransformer: (result) => result, // Result is already in the correct format
			}}
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
					Date: new Date(commit.date).toLocaleString(),
					Message: <span title={commit.message}>{commit.message}</span>
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