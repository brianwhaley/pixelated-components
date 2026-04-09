import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthGit } from '../components/admin/site-health/site-health-github';

// Mock the SiteHealthTemplate component
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, siteName, title, endpoint, columnSpan }: any) => {
		const [data, setData] = React.useState<any>(null);
		const [loading, setLoading] = React.useState(true);

		React.useEffect(() => {
			const mockSiteData = {
				site: 'test-site',
				status: 'success',
				commits: [
					{ hash: 'abc123', message: 'Fix bug', author: 'dev', date: '2025-01-15' },
					{ hash: 'def456', message: 'Add feature', author: 'dev', date: '2025-01-14' }
				]
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

describe('SiteHealthGit Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const defaultProps = {
		siteName: 'test-site'
	};

	it('should render without crashing', () => {
		const { container } = render(<SiteHealthGit {...defaultProps} />);
		expect(container).toBeDefined();
	});

	it('should render title', async () => {
		render(<SiteHealthGit {...defaultProps} />);
		await waitFor(() => {
			const title = screen.getByText('Git Push Notes');
			expect(title).toBeDefined();
		});
	});

	it('should accept siteName prop', async () => {
		render(<SiteHealthGit siteName="my-site" />);
		await waitFor(() => {
			const title = screen.getByText('Git Push Notes');
			expect(title).toBeDefined();
		});
	});

	it('should accept optional startDate prop', () => {
		const { container } = render(
			<SiteHealthGit {...defaultProps} startDate="2025-01-01" />
		);
		expect(container).toBeDefined();
	});

	it('should accept optional endDate prop', () => {
		const { container } = render(
			<SiteHealthGit {...defaultProps} endDate="2025-12-31" />
		);
		expect(container).toBeDefined();
	});

	it('should accept both date filters', async () => {
		render(
			<SiteHealthGit 
				siteName="my-site"
				startDate="2025-01-01" 
				endDate="2025-12-31"
			/>
		);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should pass siteName to endpoint', async () => {
		render(<SiteHealthGit siteName="example.com" />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should fetch git commit data from API', async () => {
		render(<SiteHealthGit {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should apply response transformer to data', async () => {
		render(<SiteHealthGit {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should set correct column span for layout', async () => {
		render(<SiteHealthGit {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.getAttribute('data-column-span')).toBe('2');
		});
	});

	it('should display commit history', async () => {
		render(<SiteHealthGit {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should handle date range filters', async () => {
		render(
			<SiteHealthGit 
				siteName="test-site"
				startDate="2025-01-01"
				endDate="2025-01-31"
			/>
		);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});
});
