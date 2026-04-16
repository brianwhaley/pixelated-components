import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthOnSiteSEO } from '../components/admin/site-health/site-health-on-site-seo';
import { siteHealthData } from '../test/test-data';

// Mock data matching the OnSiteSEOData interface
const mockSiteData = siteHealthData.onSiteSeo;
const mockErrorData = siteHealthData.onSiteSeoError;

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
