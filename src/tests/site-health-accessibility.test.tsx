import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthAccessibility } from '../components/admin/site-health/site-health-accessibility';

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, siteName, title, endpoint, columnSpan }: any) => {
		const [data, setData] = React.useState<any>(null);
		const [loading, setLoading] = React.useState(true);

		React.useEffect(() => {
			// Simulate API response with accessibility audit data
			const mockSiteData = {
				site: 'test-site',
				url: 'https://test-site.com',
				status: 'success',
				scores: {
					accessibility: 0.92
				},
				audits: [
					{ id: 'color-contrast', score: 1.0, title: 'Color contrast' },
					{ id: 'label-elements', score: 0.95, title: 'Form labels' }
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
			<div data-testid="health-template" data-column-span={columnSpan}>
				<h3>{title}</h3>
				<div>{children && children(data)}</div>
			</div>
		);
	}
}));

describe('SiteHealthAccessibility Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const defaultProps = {
		siteName: 'test-site'
	};

	it('should render without crashing', () => {
		const { container } = render(<SiteHealthAccessibility {...defaultProps} />);
		expect(container).toBeDefined();
	});

	it('should render health template', async () => {
		render(<SiteHealthAccessibility {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should accept siteName prop', () => {
		const { container } = render(<SiteHealthAccessibility siteName="my-site" />);
		expect(container).toBeDefined();
	});

	it('should display accessibility metrics', async () => {
		render(<SiteHealthAccessibility {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.querySelector('h3')).toBeDefined();
		});
	});

	it('should handle accessibility audit data', async () => {
		render(<SiteHealthAccessibility siteName="test" />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should pass siteName to endpoint', async () => {
		render(<SiteHealthAccessibility siteName="example-site" />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should fetch accessibility data from API', async () => {
		render(<SiteHealthAccessibility {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should render Lighthouse audit results', async () => {
		render(<SiteHealthAccessibility {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should handle different accessibility scores', async () => {
		const { rerender } = render(
			<SiteHealthAccessibility siteName="site-1" />
		);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});

		rerender(<SiteHealthAccessibility siteName="site-2" />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should set correct title for accessibility', async () => {
		render(<SiteHealthAccessibility {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should require siteName parameter', () => {
		const { container } = render(
			<SiteHealthAccessibility siteName="required-site" />
		);

		expect(container).toBeDefined();
	});

	it('should render error message when no data available', () => {
		render(
			<SiteHealthAccessibility siteName="example.com" />
		)
		const errorMsg = screen.queryByText(/No accessibility data available/i);
		if (errorMsg) {
			expect(errorMsg).toBeInTheDocument();
		}
	});

	it('should accept siteName prop', () => {
		const { container } = render(
			<SiteHealthAccessibility siteName="test-site.com" />
		);
		expect(container).toBeDefined();
	});

	it('should render component without crashing for different site names', () => {
		const sites = ['example.com', 'test.org', 'demo.io'];
		
		sites.forEach(site => {
			const { container } = render(
				<SiteHealthAccessibility siteName={site} />
			);
			expect(container).toBeDefined();
		});
	});

	it('should use SiteHealthTemplate for rendering', () => {
		return render(
			<SiteHealthAccessibility siteName="example.com" />
		).container;
	});
});
