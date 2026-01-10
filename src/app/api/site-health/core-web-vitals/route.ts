import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { performCoreWebVitalsAnalysis, CoreWebVitalsData } from '@pixelated-tech/components/adminserver';

const debug = false;

interface Site {
  name: string;
  localPath?: string;
  remote?: string;
  healthCheckId?: string;
  url?: string;
}

export async function GET(request: NextRequest) {
	try {
		// Read sites configuration
		const sitesPath = path.join(process.cwd(), 'src/app/data/sites.json');
		const sitesData = await fs.readFile(sitesPath, 'utf-8');
		const sites: Site[] = JSON.parse(sitesData);

		// Check if a specific site was requested
		const { searchParams } = new URL(request.url);
		const requestedSiteName = searchParams.get('siteName');
		const cacheParam = searchParams.get('cache');
		const useCache = cacheParam !== 'false'; // Default to true, only false when explicitly set

		if (!requestedSiteName) {
			return NextResponse.json({ success: false, error: 'siteName required' }, { status: 400 });
		}

		// Filter sites if a specific site was requested - only sites with URLs are processed
		const sitesToProcess = sites.filter(site => site.name === requestedSiteName && site.url);

		const results: CoreWebVitalsData[] = [];

		// Process sites sequentially to avoid overwhelming the API
		for (const site of sitesToProcess) {
			try {
				// Use the URL from the site configuration
				const url = site.url!;

				// Perform Core Web Vitals analysis using the integration
				const result = await performCoreWebVitalsAnalysis(url, site.name, useCache);
				results.push(result);

			} catch (error) {
				if (debug) console.error(`Error processing site ${site.name}:`, error);
				results.push({
					site: site.name,
					url: site.url!,
					metrics: {
						cls: 0,
						fid: 0,
						lcp: 0,
						fcp: 0,
						ttfb: 0,
						speedIndex: 0,
						interactive: 0,
						totalBlockingTime: 0,
						firstMeaningfulPaint: 0,
					},
					scores: {
						performance: 0,
						accessibility: 0,
						'best-practices': 0,
						seo: 0,
						pwa: 0,
					},
					categories: {
						performance: { id: 'performance', title: 'Performance', score: null, audits: [] },
						accessibility: { id: 'accessibility', title: 'Accessibility', score: null, audits: [] },
						'best-practices': { id: 'best-practices', title: 'Best Practices', score: null, audits: [] },
						seo: { id: 'seo', title: 'SEO', score: null, audits: [] },
						pwa: { id: 'pwa', title: 'PWA', score: null, audits: [] },
					},
					timestamp: new Date().toISOString(),
					status: 'error',
					error: error instanceof Error ? error.message : 'Unknown error',
				});
			}
		}

		return NextResponse.json({
			success: true,
			data: results,
		});
	} catch (error) {
		if (debug) console.error('Error in Core Web Vitals API:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch Core Web Vitals data',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}