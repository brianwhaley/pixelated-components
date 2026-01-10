'use client';

import { useState, useEffect } from 'react';
import { PageSection, Loading, ToggleLoading, Table } from "@pixelated-tech/components";
import './component-usage.css';

interface Site {
  name: string;
  localPath: string;
}

interface UsageData {
  components: string[];
  siteList: Site[];
  usageMatrix: { [component: string]: { [site: string]: boolean } };
}

export default function ComponentUsagePage() {
	const [data, setData] = useState<UsageData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchData() {
			try {
				ToggleLoading({ show: true });
				const response = await fetch('/api/component-usage');
				if (!response.ok) {
					throw new Error('Failed to fetch component usage data');
				}
				const result = await response.json();
				setData(result);
			} catch (err) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				ToggleLoading({ show: false });
				setLoading(false);
			}
		}

		fetchData();
	}, []);

	if (loading) {
		return (
			<PageSection maxWidth="1024px" columns={1}>
				<div className="usage-page-wrapper">
					<div className="usage-page-container">
          	<h1 className="usage-page-title">Component Usage Analytics</h1>
						<div className="usage-status-container">
							<Loading />
							<p className="usage-status-text">Loading component usage data...</p>
						</div>
					</div>
				</div>
			</PageSection>
		);
	}

	if (error) {
		return (
			<PageSection maxWidth="1024px" columns={1}>
				<div className="usage-page-wrapper">
					<div className="usage-page-container">
          	<h1 className="usage-page-title">Component Usage Analytics</h1>
						<div className="usage-error-message">
              Error: {error}
						</div>
					</div>
				</div>
			</PageSection>
		);
	}

	if (!data) {
		return null;
	}

	const { components, siteList, usageMatrix } = data;

	// 1. Generate the data as a JSON object (array of objects)
	const tableData = components.map(component => {
		const row: any = {
			'Component': component
		};
    
		let rowTotal = 0;
		siteList.forEach(site => {
			const isUsed = usageMatrix[component][site.name];
			row[site.name] = isUsed ? <span className="usage-check-mark">✓</span> : "";
			if (isUsed) rowTotal++;
		});
    
		row['Total'] = rowTotal;
		return row;
	});

	// 2. Add the totals row (column summaries)
	const totalsRow: any = {
		'Component': "TOTAL"
	};
  
	siteList.forEach(site => {
		const colTotal = components.filter(comp => usageMatrix[comp][site.name]).length;
		totalsRow[site.name] = colTotal;
	});
  
	const grandTotal = components.reduce((acc, comp) => acc + siteList.filter(site => usageMatrix[comp][site.name]).length, 0);
	totalsRow['Total'] = grandTotal;
  
	tableData.push(totalsRow);

	return (
		<PageSection maxWidth="1024px" columns={1}>
			<div className="usage-page-wrapper">
				<div className="usage-page-container">
					<h1 className="usage-page-title">Component Usage Analytics</h1>
          
					<div className="usage-table-card">
						<Table 
							id="component-usage-table" 
							data={tableData} 
							altRowColor="#f9fafb" 
							sortable={false} 
						/>
					</div>

					<div className="usage-legend">
						<p>Legend: <span className="usage-legend-label">✓ Used</span></p>
						<p>This analysis scans for import statements from @pixelated-tech/components in each sites source code.</p>
					</div>
				</div>
			</div>
		</PageSection>
	);
}