'use client';

import { useState, useEffect } from 'react';
import { PageSection, PageGridItem } from "@pixelated-tech/components";
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
        console.error('Failed to load sites:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSites();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <PageSection maxWidth="1024px" columns={1}>
            <h1 className="text-3xl font-bold mb-8">Site Health</h1>
            <div className="text-center">Loading sites...</div>
          </PageSection>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <PageSection maxWidth="1024px" columns={1}>
          <h1 className="text-3xl font-bold mb-8">Site Health</h1>

          {/* Date Range Selection */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Site Selection Dropdown */}
          <div className="mb-8">
            <label htmlFor="site-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Site
            </label>
            <select
              id="site-select"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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