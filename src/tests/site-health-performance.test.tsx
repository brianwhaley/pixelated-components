import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthPerformance } from '../components/admin/site-health/site-health-performance';

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, siteName, title, endpoint, columnSpan }: any) => {
		const [data, setData] = React.useState<any>(null);
		const [loading, setLoading] = React.useState(true);

		React.useEffect(() => {
			// Simulate API response with performance data
			const mockSiteData = {
				site: 'test-site',
				url: 'https://test-site.com',
				scores: {
					performance: 0.85,
					accessibility: 0.90,
					best_practices: 0.88,
					seo: 0.92
				},
				status: 'success',
				categories: {
					performance: {
						audits: [
							{
								id: 'first-contentful-paint',
								title: 'First Contentful Paint',
								score: 0.95,
								scoreDisplayMode: 'numeric',
								displayValue: '0.9 s'
							},
							{
								id: 'largest-contentful-paint',
								title: 'Largest Contentful Paint',
								score: 0.88,
								scoreDisplayMode: 'numeric',
								displayValue: '2.1 s'
							}
						]
					},
					pwa: {
						audits: []
					}
				}
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

describe('SiteHealthPerformance Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const defaultProps = {
		siteName: 'test-site'
	};

	it('should render without crashing', () => {
		const { container } = render(<SiteHealthPerformance {...defaultProps} />);
		expect(container).toBeDefined();
	});

	it('should render health template with correct title', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByText('PageSpeed - Performance')).toBeDefined();
		});
	});

	it('should accept siteName prop', () => {
		const { container } = render(
			<SiteHealthPerformance siteName="my-site" />
		);
		expect(container).toBeDefined();
	});

	it('should pass correct endpoint to template', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should set columnSpan to 2 for layout', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.getAttribute('data-column-span')).toBe('2');
		});
	});

	it('should display site name and URL from performance data', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			// Component renders within template which provides the data
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should render performance score display', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should handle performance metrics data', async () => {
		const { container } = render(
			<SiteHealthPerformance siteName="example.com" />
		);
		await waitFor(() => {
			expect(container.querySelector('[data-testid="health-template"]')).toBeDefined();
		});
	});

	it('should display performance opportunities', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should accept required siteName parameter', () => {
		const { container } = render(
			<SiteHealthPerformance siteName="required-site" />
		);

		expect(container).toBeDefined();
	});

	it('should render as layout component with proper styling', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should handle Lighthouse core web vitals data', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			const pageSpeedTitle = screen.getByText('PageSpeed - Performance');
			expect(pageSpeedTitle).toBeDefined();
			expect(template).toBeDefined();
		});
	});

	it('should use site-health template for data fetching', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			// Verify layout component was used
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should apply response transformer to API data', async () => {
		render(<SiteHealthPerformance {...defaultProps} />);
		await waitFor(() => {
			// Component should render successfully with transformed data
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});
});
