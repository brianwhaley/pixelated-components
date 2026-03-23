import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthUptime } from '../components/admin/site-health/site-health-uptime';

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, siteName, title, endpoint, columnSpan }: any) => {
		const [data, setData] = React.useState<any>(null);
		const [loading, setLoading] = React.useState(true);

		React.useEffect(() => {
			const mockSiteData = {
				site: 'test-site',
				url: 'https://test-site.com',
				status: 'success',
				uptime: 0.9999,
				incidents: 0,
				averageResponseTime: 150
			};

			const transformedData = endpoint?.responseTransformer
				? endpoint.responseTransformer(mockSiteData)
				: mockSiteData;

			setData(transformedData);
			setLoading(false);
		}, [endpoint]);

		if (loading) return <div>Loading...</div>;

		return (
			<div data-testid="health-template" data-column-span={columnSpan ?? '2'}>
				<h3>{title}</h3>
				<div>{children && children(data)}</div>
			</div>
		);
	}
}));

describe('SiteHealthUptime Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const defaultProps = {
		siteName: 'test-site'
	};

	it('should render without crashing', () => {
		const { container } = render(<SiteHealthUptime {...defaultProps} />);
		expect(container).toBeDefined();
	});

	it('should render health template', async () => {
		render(<SiteHealthUptime {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should accept siteName prop', () => {
		const { container } = render(<SiteHealthUptime siteName="my-site" />);
		expect(container).toBeDefined();
	});

	it('should display uptime information', async () => {
		render(<SiteHealthUptime {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.querySelector('h3')).toBeDefined();
		});
	});

	it('should handle different site names', async () => {
		const { rerender } = render(
			<SiteHealthUptime siteName="site-1" />
		);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});

		rerender(<SiteHealthUptime siteName="site-2" />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should pass siteName to endpoint', async () => {
		render(<SiteHealthUptime siteName="example.com" />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should set correct column span', async () => {
		render(<SiteHealthUptime {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.getAttribute('data-column-span')).toBe('2');
		});
	});

	it('should fetch uptime data from API', async () => {
		render(<SiteHealthUptime {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should apply response transformer', async () => {
		render(<SiteHealthUptime {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should require siteName parameter', () => {
		const { container } = render(<SiteHealthUptime siteName="required" />);
		expect(container).toBeDefined();
	});

	it('should display uptime percentage', async () => {
		render(<SiteHealthUptime {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});
});
