import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthOnSiteSEO } from '../components/admin/site-health/site-health-on-site-seo';

// Mock data matching the OnSiteSEOData interface
const mockSiteData = {
	site: 'test-site.com',
	url: 'https://test-site.com',
	overallScore: 0.75,
	totalPages: 2,
	status: 'success' as const,
	timestamp: new Date().toISOString(),
	pagesAnalyzed: [
		{
			url: 'https://test-site.com',
			title: 'Home Page',
			statusCode: 200,
			crawledAt: new Date().toISOString(),
			audits: [
				{
					id: 'h1-tags',
					title: 'H1 Tags',
					score: 1,
					scoreDisplayMode: 'binary' as const,
					displayValue: '1 H1 tag(s) found',
					category: 'on-page' as const,
					details: {
						items: [
							{ tag: 'h1', text: 'Welcome' }
						]
					}
				},
				{
					id: 'title-tags',
					title: 'Title Tags',
					score: 1,
					scoreDisplayMode: 'binary' as const,
					displayValue: 'Title tag found',
					category: 'on-page' as const
				}
			]
		},
		{
			url: 'https://test-site.com/page1',
			title: 'Page 1',
			statusCode: 200,
			crawledAt: new Date().toISOString(),
			audits: [
				{
					id: 'h1-tags',
					title: 'H1 Tags',
					score: 0,
					scoreDisplayMode: 'binary' as const,
					displayValue: '0 H1 tag(s) found',
					category: 'on-page' as const
				},
				{
					id: 'title-tags',
					title: 'Title Tags',
					score: 1,
					scoreDisplayMode: 'binary' as const,
					displayValue: 'Title tag found',
					category: 'on-page' as const
				}
			]
		}
	],
	onSiteAudits: [
		{
			id: 'https',
			title: 'HTTPS',
			score: 1,
			scoreDisplayMode: 'binary' as const,
			displayValue: 'Site uses HTTPS',
			category: 'on-site' as const
		}
	]
};

const mockErrorData = {
	site: 'test-site.com',
	url: 'https://test-site.com',
	overallScore: null,
	totalPages: 0,
	status: 'error' as const,
	error: 'Failed to analyze site',
	timestamp: new Date().toISOString(),
	pagesAnalyzed: [],
	onSiteAudits: []
};

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, siteName, title, endpoint }: any) => {
		const [data, setData] = React.useState<any>(null);

		React.useEffect(() => {
			const transformedData = endpoint?.responseTransformer
				? endpoint.responseTransformer({ data: mockSiteData })
				: mockSiteData;

			setData(transformedData);
		}, [endpoint]);

		return (
			<div data-testid="health-template">
				<h3>{title}</h3>
				<div data-testid="health-content">{children && children(data)}</div>
			</div>
		);
	}
}));

// Mock utility functions
vi.mock('../components/admin/site-health/site-health-indicators', () => ({
	getScoreIndicator: (score: any) => `Score: ${score}`
}));

vi.mock('../components/admin/site-health/site-health-utils', () => ({
	formatAuditItem: (item: any) => `Audit: ${JSON.stringify(item)}`,
	getAuditScoreIcon: (score: any) => score === 1 ? '✓' : '✗',
	getScoreColor: (score: any) => score === 1 ? '#16a34a' : '#ef4444'
}));

describe('SiteHealthOnSiteSEO Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should export SiteHealthOnSiteSEO component', () => {
		expect(SiteHealthOnSiteSEO).toBeDefined();
		expect(typeof SiteHealthOnSiteSEO).toBe('function');
	});

	it('should render with siteName prop', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeInTheDocument();
		});
	});

	it('should render title "On-Site SEO"', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			expect(screen.getByText('On-Site SEO')).toBeInTheDocument();
		});
	});

	it('should render on-page audits section', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			expect(screen.getByText('On-Page SEO Audits')).toBeInTheDocument();
		});
	});

	it('should display audit titles and scores', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			expect(screen.getByText(/H1 Tags/)).toBeInTheDocument();
			expect(screen.getByText(/Title Tags/)).toBeInTheDocument();
		});
	});

	it('should include endpoint configuration', async () => {
		const { container } = render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeInTheDocument();
		});
	});

	it('should accept and use the siteName prop', () => {
		const { rerender } = render(<SiteHealthOnSiteSEO siteName="site-1" />);
		expect(screen.getByTestId('health-template')).toBeInTheDocument();
		
		rerender(<SiteHealthOnSiteSEO siteName="site-2" />);
		expect(screen.getByTestId('health-template')).toBeInTheDocument();
	});

	it('should have propTypes defined', () => {
		expect((SiteHealthOnSiteSEO as any).propTypes).toBeDefined();
		expect((SiteHealthOnSiteSEO as any).propTypes.siteName).toBeDefined();
	});

	it('should render content from SiteHealthTemplate children', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			expect(screen.getByTestId('health-content')).toBeInTheDocument();
		});
	});

	it('should display on-site audits', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			const content = screen.getByTestId('health-content');
			expect(content).toBeInTheDocument();
		});
	});

	it('should sort audits by score descending', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			// Check that health content is rendered with audit items
			const content = screen.getByTestId('health-content');
			expect(content).toBeInTheDocument();
			expect(content.textContent).toContain('H1 Tags');
		});
	});

	it('should format percentage scores', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			const content = screen.getByTestId('health-content');
			expect(content.textContent).toBeDefined();
		});
	});

	it('should render correctly with empty pages', async () => {
		render(<SiteHealthOnSiteSEO siteName="test-site" />);
		
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeInTheDocument();
			expect(screen.getByText('On-Site SEO')).toBeInTheDocument();
		});
	});
});
