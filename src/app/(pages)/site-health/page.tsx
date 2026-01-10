'use client';

const debug = false;

import { useState, useEffect } from 'react';
import { PageSection } from "@pixelated-tech/components";
import { SiteHealthGit, SiteHealthUptime, SiteHealthSecurity, SiteHealthOverview, SiteHealthPerformance, SiteHealthAccessibility, SiteHealthAxeCore, SiteHealthDependencyVulnerabilities, SiteHealthSEO, SiteHealthGoogleAnalytics, SiteHealthGoogleSearchConsole, SiteHealthOnSiteSEO, SiteHealthCloudwatch } from "@pixelated-tech/components/adminclient";
import './site-health.css';

export default function SiteHealthPage() {
	const [selectedSite, setSelectedSite] = useState<string>('');
	const [sites, setSites] = useState<Array<{name: string, url?: string}>>([]);
	const [loading, setLoading] = useState(true);

	// Date state
	const today = new Date();
	const oneMonthAgo = new Date(today);
	oneMonthAgo.setMonth(today.getMonth() - 1);

	const [startDate, setStartDate] = useState<string>(oneMonthAgo.toISOString().split('T')[0]);
	const [endDate, setEndDate] = useState<string>(today.toISOString().split('T')[0]);

	useEffect(() => {
		async function loadSites() {
			try {
				const response = await fetch(`${window.location.origin}/api/sites`);
				if (response.ok) {
					const sitesData = await response.json();
					setSites([...sitesData]);
				}
			} catch (error) {
				if (debug) console.error('Failed to load sites:', error);
			} finally {
				setLoading(false);
			}
		}

		loadSites();

		// Ensure axe-core is available on the client page for debugging and on-page analysis
		if (typeof window !== 'undefined' && !(window as any).axe) {
			const cdn = 'https://cdn.jsdelivr.net/npm/axe-core/axe.min.js';
			const localApi = '/api/axe-core';

			function inject(src: string, onErrorFallback?: string) {
				const s = document.createElement('script');
				s.src = src;
				s.async = false;
				s.onload = () => { if (debug) console.info('Loaded axe from', src); };
				s.onerror = () => {
					if (debug) console.warn('Failed to load axe from', src);
					if (onErrorFallback) inject(onErrorFallback);
				};
				document.head.appendChild(s);
			}

			try {
				inject(cdn, localApi);
			} catch (e) {
				if (debug) console.warn('Error injecting axe-core:', e);
			}
		}
	}, []);

	if (loading) {
		return (
			<div className="site-health-page">
				<div className="site-health-container">
					<PageSection maxWidth="1024px" columns={1}>
						<h1 className="site-health-title">Site Health</h1>
						<div className="site-health-status-msg">Loading sites...</div>
					</PageSection>
				</div>
			</div>
		);
	}

	return (
		<div className="site-health-page">
			<div className="site-health-container">
				{/* Header Section */}
				<PageSection maxWidth="1024px" columns={1}>
					<h1 className="site-health-title">Site Health</h1>

					<div className="site-health-header">
						{/* Date Range Selection */}
						<div className="site-health-date-range">
							<div>
								<label htmlFor="start-date" className="site-health-label">
                  Start Date
								</label>
								<input
									type="date"
									id="start-date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									className="site-health-input"
								/>
							</div>
							<div>
								<label htmlFor="end-date" className="site-health-label">
                  End Date
								</label>
								<input
									type="date"
									id="end-date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									className="site-health-input"
								/>
							</div>
						</div>

						{/* Site Selection Dropdown */}
						<div className="site-health-select-wrapper">
							<label htmlFor="site-select" className="site-health-label">
                Select Site
							</label>
							<select
								id="site-select"
								value={selectedSite}
								onChange={(e) => setSelectedSite(e.target.value)}
								className="site-health-select"
							>
								<option value="">Select a site...</option>
								{sites.map((site) => {
									return (
										<option key={site.name} value={site.name}>
											{site.name.replace('-', ' ')}
										</option>
									);
								})}
							</select>
						</div>
					</div>

				</PageSection>

				{/* Health Cards Grid */}
				<PageSection maxWidth="1024px" columns={2}>
					{/* Health Status Card */}
					<SiteHealthUptime siteName={selectedSite} />

					{/* Dependency Vulnerability Card */}
					<SiteHealthDependencyVulnerabilities siteName={selectedSite} />

					{/* Site Overview Card */}
					<SiteHealthOverview siteName={selectedSite} />

					{/* Performance Card */}
					<SiteHealthPerformance siteName={selectedSite} />

					{/* Accessibility Card */}
					<SiteHealthAccessibility siteName={selectedSite} />

					{/* Axe-Core Accessibility Card */}
					<SiteHealthAxeCore siteName={selectedSite} />

					{/* Security Card */}
					<SiteHealthSecurity siteName={selectedSite} />

					{/* SEO Card */}
					<SiteHealthSEO siteName={selectedSite} />

					{/* On-Site SEO Card */}
					<SiteHealthOnSiteSEO siteName={selectedSite} />

					{/* Git Push Notes Card */}
					<SiteHealthGit key={`git-${selectedSite}-${startDate}-${endDate}`} siteName={selectedSite} startDate={startDate} endDate={endDate} />

					{/* Google Analytics Card */}
					<SiteHealthGoogleAnalytics key={`ga-${selectedSite}-${startDate}-${endDate}`} siteName={selectedSite} startDate={startDate} endDate={endDate} />

					{/* Google Search Console Card */}
					<SiteHealthGoogleSearchConsole key={`gsc-${selectedSite}-${startDate}-${endDate}`} siteName={selectedSite} startDate={startDate} endDate={endDate} />

					{/* Route53 Uptime Card */}
					<SiteHealthCloudwatch key={`cloudwatch-${selectedSite}-${startDate}-${endDate}`} siteName={selectedSite} startDate={startDate} endDate={endDate} />
				</PageSection>
			</div>
		</div>
	);
}