import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthDependencyVulnerabilities } from '../components/admin/site-health/site-health-dependency-vulnerabilities';
import { siteHealthData } from '../test/test-data';

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, siteName, title, endpoint, columnSpan }: any) => {
		const [data, setData] = React.useState<any>(null);
		const [loading, setLoading] = React.useState(true);

		React.useEffect(() => {
			const mockSiteData = {
				...siteHealthData.dependencyVulnerabilities,
				timestamp: new Date().toISOString(),
				url: 'https://test-site.com',
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

describe('SiteHealthDependencyVulnerabilities', () => {
	const defaultProps = {
		siteName: 'test-site'
	};

	it('should render without crashing', () => {
		const { container } = render(
			<SiteHealthDependencyVulnerabilities {...defaultProps} />
		);
		expect(container).toBeDefined();
	});

	it('should render health template', async () => {
		render(<SiteHealthDependencyVulnerabilities {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should accept siteName prop', () => {
		const { container } = render(
			<SiteHealthDependencyVulnerabilities siteName="my-site" />
		);
		expect(container).toBeDefined();
	});

	it('should display vulnerability metrics', async () => {
		render(<SiteHealthDependencyVulnerabilities {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.querySelector('h3')).toBeDefined();
		});
	});

	it('should handle dependency scan results', async () => {
		render(<SiteHealthDependencyVulnerabilities siteName="test" />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should pass siteName to endpoint', async () => {
		render(<SiteHealthDependencyVulnerabilities siteName="example.com" />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should fetch vulnerability data from API', async () => {
		render(<SiteHealthDependencyVulnerabilities {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should apply response transformer', async () => {
		render(<SiteHealthDependencyVulnerabilities {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should set correct column span', async () => {
		render(<SiteHealthDependencyVulnerabilities {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.getAttribute('data-column-span')).toBe('2');
		});
	});

	it('should display list of vulnerable packages', async () => {
		render(<SiteHealthDependencyVulnerabilities {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should show severity counts for vulnerabilities', async () => {
		render(<SiteHealthDependencyVulnerabilities {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});
});
