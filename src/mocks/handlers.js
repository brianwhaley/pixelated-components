import { http, HttpResponse } from 'msw';

console.log('MSW handlers loaded');

// Mock data for Axe Core accessibility
const mockAxeData = {
	success: true,
	data: {
		site: 'example.com',
		url: 'https://example.com',
		violations: [
			{
				id: 'color-contrast',
				impact: 'serious',
				description: 'Elements must have sufficient color contrast',
				help: 'Ensure text has enough contrast against background',
				helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
				nodes: [
					{
						target: ['.header h1'],
						html: '<h1>Welcome</h1>',
						failureSummary: 'Fix any of the following: Element has insufficient color contrast of 2.5:1'
					}
				]
			},
			{
				id: 'image-alt',
				impact: 'critical',
				description: 'Images must have alternate text',
				help: 'Provide alternative text for images',
				helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
				nodes: [
					{
						target: ['img[alt=""]'],
						html: '<img src="logo.png" alt="">',
						failureSummary: 'Fix any of the following: aria-label attribute does not exist or is empty'
					}
				]
			}
		],
		passes: 45,
		incomplete: 2,
		inapplicable: 12
	}
};

// Mock data for Core Web Vitals
const mockCoreWebVitalsData = {
	success: true,
	data: {
		site: 'pixelated.tech',
		url: 'https://pixelated.tech',
		metrics: {
			cls: 0.05,
			fid: 85,
			lcp: 1200,
			fcp: 800,
			ttfb: 150,
			speedIndex: 1100,
			interactive: 1300,
			totalBlockingTime: 50,
			firstMeaningfulPaint: 900
		},
		scores: {
			performance: 85,
			accessibility: 90,
			bestPractices: 95,
			seo: 88,
			pwa: 75
		},
		categories: {
			performance: { score: 85, displayValue: 'Good' },
			accessibility: { score: 90, displayValue: 'Good' },
			bestPractices: { score: 95, displayValue: 'Good' },
			seo: { score: 88, displayValue: 'Good' },
			pwa: { score: 75, displayValue: 'Good' }
		}
	}
};

// Mock data for Google Analytics
const mockGoogleAnalyticsData = {
	success: true,
	data: {
		site: 'pixelated.tech',
		dateRange: {
			start: '2024-01-01',
			end: '2024-01-06'
		},
		metrics: {
			users: 1250,
			sessions: 1800,
			pageviews: 3200,
			bounceRate: 0.45,
			avgSessionDuration: 180,
			newUsers: 890
		},
		chartData: [
			{ date: '2024-01-01', users: 120, sessions: 150, pageviews: 280 },
			{ date: '2024-01-02', users: 135, sessions: 165, pageviews: 310 },
			{ date: '2024-01-03', users: 142, sessions: 178, pageviews: 325 },
			{ date: '2024-01-04', users: 158, sessions: 192, pageviews: 345 },
			{ date: '2024-01-05', users: 165, sessions: 198, pageviews: 365 },
			{ date: '2024-01-06', users: 172, sessions: 205, pageviews: 380 }
		]
	}
};

// Mock data for Google Search Console
const mockGoogleSearchConsoleData = {
	success: true,
	data: {
		site: 'pixelated.tech',
		dateRange: {
			start: '2024-01-01',
			end: '2024-01-06'
		},
		metrics: {
			clicks: 1250,
			impressions: 15000,
			ctr: 0.083,
			position: 12.5
		},
		chartData: [
			{ date: '2024-01-01', clicks: 85, impressions: 1200, ctr: 0.071, position: 14.2 },
			{ date: '2024-01-02', clicks: 92, impressions: 1350, ctr: 0.068, position: 13.8 },
			{ date: '2024-01-03', clicks: 98, impressions: 1420, ctr: 0.069, position: 13.5 },
			{ date: '2024-01-04', clicks: 105, impressions: 1480, ctr: 0.071, position: 13.2 },
			{ date: '2024-01-05', clicks: 112, impressions: 1520, ctr: 0.074, position: 12.8 },
			{ date: '2024-01-06', clicks: 118, impressions: 1580, ctr: 0.075, position: 12.5 }
		]
	}
};

// Mock data for CloudWatch uptime
const mockCloudWatchData = {
	success: true,
	data: {
		site: 'pixelated.tech',
		uptime: 99.8,
		responseTime: 245,
		status: 'operational',
		incidents: [],
		chartData: [
			{ timestamp: '2024-01-01T00:00:00Z', uptime: 100, responseTime: 220 },
			{ timestamp: '2024-01-02T00:00:00Z', uptime: 99.5, responseTime: 280 },
			{ timestamp: '2024-01-03T00:00:00Z', uptime: 100, responseTime: 210 },
			{ timestamp: '2024-01-04T00:00:00Z', uptime: 100, responseTime: 235 },
			{ timestamp: '2024-01-05T00:00:00Z', uptime: 99.9, responseTime: 250 },
			{ timestamp: '2024-01-06T00:00:00Z', uptime: 100, responseTime: 225 }
		]
	}
};

export const handlers = [
	// API endpoints using relative paths (MSW v2 matches these regardless of origin)
	http.get('/api/site-health/axe-core', () => {
		console.log('MSW: Intercepting axe-core request');
		return HttpResponse.json(mockAxeData);
	}),

	http.get('/api/site-health/core-web-vitals', () => {
		console.log('MSW: Intercepting core-web-vitals request');
		return HttpResponse.json(mockCoreWebVitalsData);
	}),

	http.get('/api/site-health/google-analytics', () => {
		console.log('MSW: Intercepting google-analytics request');
		return HttpResponse.json(mockGoogleAnalyticsData);
	}),

	http.get('/api/site-health/google-search-console', () => {
		console.log('MSW: Intercepting google-search-console request');
		return HttpResponse.json(mockGoogleSearchConsoleData);
	}),

	http.get('/api/site-health/cloudwatch', () => {
		console.log('MSW: Intercepting cloudwatch request');
		return HttpResponse.json(mockCloudWatchData);
	}),

	// External URLs used by some stories
	http.get('https://api.pixelated.tech/axe-core', () => {
		console.log('MSW: Intercepting external axe-core request');
		return HttpResponse.json(mockAxeData);
	}),

	http.get('https://api.pixelated.tech/core-web-vitals', () => {
		console.log('MSW: Intercepting external core-web-vitals request');
		return HttpResponse.json(mockCoreWebVitalsData);
	}),

	http.get('https://api.pixelated.tech/google-analytics', () => {
		console.log('MSW: Intercepting external google-analytics request');
		return HttpResponse.json(mockGoogleAnalyticsData);
	}),

	http.get('https://api.pixelated.tech/google-search-console', () => {
		console.log('MSW: Intercepting external google-search-console request');
		return HttpResponse.json(mockGoogleSearchConsoleData);
	}),

	http.get('https://api.pixelated.tech/cloudwatch', () => {
		console.log('MSW: Intercepting external cloudwatch request');
		return HttpResponse.json(mockCloudWatchData);
	}),

	http.get('https://api.pixelated.tech/template-data', () => {
		console.log('MSW: Intercepting template-data request');
		return HttpResponse.json({
			success: true,
			data: { message: 'Mock template data' }
		});
	}),

	// Generic fallback for any other site health endpoints
	http.get('/api/site-health/*', () => {
		console.log('MSW: Intercepting generic site-health request');
		return HttpResponse.json({
			success: true,
			data: { message: 'Mock data for site health endpoint' }
		});
	})
];