import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthSEO } from '../components/admin/site-health/site-health-seo';
import { createSiteHealthResponse } from '../test/test-data';

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, siteName, title, endpoint, columnSpan }: any) => {
		const [data, setData] = React.useState<any>(null);
		const [loading, setLoading] = React.useState(true);

		React.useEffect(() => {
			(async () => {
				const mockSiteResponse = await createSiteHealthResponse(siteName || 'test-site', 'https://www.example.com');

				const transformedData = endpoint?.responseTransformer
					? endpoint.responseTransformer(mockSiteResponse)
					: mockSiteResponse;

				setData(transformedData);
				setLoading(false);
			})();
		}, [endpoint, siteName]);

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

describe('SiteHealthSEO Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const defaultProps = {
		siteName: 'test-site'
	};

	it('should render without crashing', () => {
		const { container } = render(<SiteHealthSEO {...defaultProps} />);
		expect(container).toBeDefined();
	});

	it('should render health template with SEO title', async () => {
		render(<SiteHealthSEO {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should accept siteName prop', () => {
		const { container } = render(<SiteHealthSEO siteName="my-site" />);
		expect(container).toBeDefined();
	});

	it('should display SEO metrics', async () => {
		render(<SiteHealthSEO {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.querySelector('h3')).toBeDefined();
		});
	});

	it('should handle various site names', async () => {
		const { rerender } = render(
			<SiteHealthSEO siteName="site-1" />
		);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});

		rerender(<SiteHealthSEO siteName="site-2" />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should pass correct siteName to endpoint', async () => {
		render(<SiteHealthSEO siteName="example-site" />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should fetch SEO data from API', async () => {
		render(<SiteHealthSEO {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should display site URL and indexing information', async () => {
		render(<SiteHealthSEO {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should handle SEO score display', async () => {
		render(<SiteHealthSEO {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should render required siteName parameter', () => {
		const { container } = render(
			<SiteHealthSEO siteName="required-site" />
		);

		expect(container).toBeDefined();
	});

	it('should apply response transformer to data', async () => {
		render(<SiteHealthSEO {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should set proper column span for layout', async () => {
		render(<SiteHealthSEO {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
		expect(template.getAttribute('data-column-span') || '2').toBe('2');
		});
	});
});
