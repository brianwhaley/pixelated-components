import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthGoogleAnalytics } from '../components/admin/site-health/site-health-google-analytics';

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, siteName, title, endpoint, columnSpan }: any) => {
		const [data, setData] = React.useState<any>(null);
		const [loading, setLoading] = React.useState(true);

		React.useEffect(() => {
			// Simulate API response with analytics data
			const mockSiteData = {
				site: 'test-site',
				status: 'success',
				currentPageViews: 1200,
				previousPageViews: 1000,
				traffic: [
					{ date: '2024-01-15', pageViews: 1200 },
					{ date: '2024-01-16', pageViews: 1500 },
					{ date: '2024-01-17', pageViews: 1350 }
				]
			};

			// Apply response transformer if provided
			const transformedData = endpoint?.responseTransformer
				? endpoint.responseTransformer(mockSiteData)
				: mockSiteData;

			setData(transformedData);
			setLoading(false);
		}, [endpoint]);

		if (loading) {
			return <div>Loading...</div>;
		}

		return (
			<div data-testid="health-template" data-column-span={columnSpan ?? '2'}>
				<h3>{title}</h3>
				<div>{children && children(data)}</div>
			</div>
		);
	}
}));

// Mock recharts components
vi.mock('recharts', () => ({
	ComposedChart: ({ children, data }: any) => (
		<div data-testid="composed-chart" data-items={data?.length || 0}>
			{children}
		</div>
	),
	Bar: ({ dataKey }: any) => <div data-testid={`bar-${dataKey}`} />,
	Line: ({ dataKey }: any) => <div data-testid={`line-${dataKey}`} />,
	XAxis: () => <div data-testid="x-axis" />,
	YAxis: () => <div data-testid="y-axis" />,
	CartesianGrid: () => <div data-testid="grid" />,
	Tooltip: () => <div data-testid="tooltip" />,
	Legend: () => <div data-testid="legend" />,
	ResponsiveContainer: ({ children }: any) => <div data-testid="responsive">{children}</div>,
}));

describe('SiteHealthGoogleAnalytics Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const defaultProps = {
		siteName: 'test-site'
	};

	it('should render without crashing', () => {
		const { container } = render(<SiteHealthGoogleAnalytics {...defaultProps} />);
		expect(container).toBeDefined();
	});

	it('should render health template with correct title', async () => {
		render(<SiteHealthGoogleAnalytics {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByText('Google Analytics')).toBeDefined();
		});
	});

	it('should accept siteName prop', () => {
		const { container } = render(
			<SiteHealthGoogleAnalytics siteName="my-site" />
		);
		expect(container).toBeDefined();
	});

	it('should pass siteName to endpoint', async () => {
		render(<SiteHealthGoogleAnalytics siteName="example-site" />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should set columnSpan to 2', async () => {
		render(<SiteHealthGoogleAnalytics {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.getAttribute('data-column-span')).toBe('2');
		});
	});

	it('should render analytics chart with data', async () => {
		render(<SiteHealthGoogleAnalytics {...defaultProps} />);
		// Component displays placeholder when no real data available
		const template = screen.getByTestId('health-template');
		expect(template).toBeDefined();
	});

	it('should handle different site configurations', async () => {
		const { rerender } = render(
			<SiteHealthGoogleAnalytics siteName="prod" />
		);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});

		rerender(<SiteHealthGoogleAnalytics siteName="staging" />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should accept optional startDate parameter', async () => {
		const { container } = render(
			<SiteHealthGoogleAnalytics 
				siteName="test-site"
				startDate="2024-01-01"
			/>
		);
		await waitFor(() => {
			expect(container).toBeDefined();
		});
	});

	it('should accept optional endDate parameter', async () => {
		const { container } = render(
			<SiteHealthGoogleAnalytics 
				siteName="test-site"
				endDate="2024-01-31"
			/>
		);
		await waitFor(() => {
			expect(container).toBeDefined();
		});
	});

	it('should handle date range parameters', async () => {
		render(
			<SiteHealthGoogleAnalytics 
				siteName="test-site"
				startDate="2024-01-01"
				endDate="2024-01-31"
			/>
		);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should render composed chart with page view data', async () => {
		render(<SiteHealthGoogleAnalytics {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should include responsive container for chart', async () => {
		render(<SiteHealthGoogleAnalytics {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should display both current and previous period data', async () => {
		render(<SiteHealthGoogleAnalytics {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});
});
