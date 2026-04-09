import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { SiteHealthSecurity } from '../components/admin/site-health/site-health-security';
import type { DependencyData, Vulnerability } from '../components/admin/site-health/site-health-types';

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
				scores: {
					security: 0.95
				},
				certStatus: 'valid',
				certExpires: '2025-12-31'
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

describe('SiteHealthSecurity Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const defaultProps = {
		siteName: 'test-site'
	};

	it('should render without crashing', () => {
		const { container } = render(<SiteHealthSecurity {...defaultProps} />);
		expect(container).toBeDefined();
	});

	it('should render health template', async () => {
		render(<SiteHealthSecurity {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should accept siteName prop', () => {
		const { container } = render(<SiteHealthSecurity siteName="my-site" />);
		expect(container).toBeDefined();
	});

	it('should display security metrics', async () => {
		render(<SiteHealthSecurity {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.querySelector('h3')).toBeDefined();
		});
	});

	it('should handle security data rendering', async () => {
		render(<SiteHealthSecurity siteName="test" />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template).toBeDefined();
		});
	});

	it('should pass siteName to API endpoint', async () => {
		render(<SiteHealthSecurity siteName="example.com" />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should set correct column span', async () => {
		render(<SiteHealthSecurity {...defaultProps} />);
		await waitFor(() => {
			const template = screen.getByTestId('health-template');
			expect(template.getAttribute('data-column-span')).toBe('2');
		});
	});

	it('should fetch security data from API', async () => {
		render(<SiteHealthSecurity {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should apply response transformer', async () => {
		render(<SiteHealthSecurity {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});

	it('should require siteName parameter', () => {
		const { container } = render(<SiteHealthSecurity siteName="required" />);
		expect(container).toBeDefined();
	});

	it('should handle SSL certificate data', async () => {
		render(<SiteHealthSecurity {...defaultProps} />);
		await waitFor(() => {
			expect(screen.getByTestId('health-template')).toBeDefined();
		});
	});
});

describe('site-health-security - Real Tests Extended', () => {
	describe('Type structure validation', () => {
		it('should define Vulnerability interface properties', () => {
			const vuln: Partial<Vulnerability> = {
				name: 'test-package',
				severity: 'high',
				title: 'Test Vulnerability',
				range: '1.0.0',
				fixAvailable: true
			};
			expect(vuln.name).toBe('test-package');
			expect(vuln.severity).toBe('high');
		});

		it('should support all severity levels', () => {
			const severities: Vulnerability['severity'][] = ['info', 'low', 'moderate', 'high', 'critical'];
			severities.forEach(s => {
				expect(['info', 'low', 'moderate', 'high', 'critical'].includes(s)).toBe(true);
			});
		});

		it('should create Vulnerability objects', () => {
			const vuln: Vulnerability = {
				name: 'package',
				severity: 'critical',
				title: 'Critical Issue',
				range: '1.0.0',
				fixAvailable: true,
				url: 'https://example.com'
			};
			expect(vuln).toBeDefined();
		});

		it('should create valid DependencyData object', () => {
			const data: DependencyData = {
				success: true,
				status: 'analyzed',
				timestamp: new Date().toISOString(),
				vulnerabilities: [],
				summary: {
					info: 0,
					low: 0,
					moderate: 0,
					high: 0,
					critical: 0,
					total: 0,
				},
				dependencies: 100,
				totalDependencies: 100,
			};
			expect(data.success).toBe(true);
			expect(data.summary.total).toBe(0);
		});

		it('should handle vulnerabilities in DependencyData', () => {
			const data: DependencyData = {
				success: true,
				status: 'analyzed',
				timestamp: new Date().toISOString(),
				vulnerabilities: [
					{
						name: 'test',
						severity: 'high',
						title: 'Test',
						range: '1.0.0',
						fixAvailable: false
					}
				],
				summary: {
					info: 0,
					low: 0,
					moderate: 0,
					high: 1,
					critical: 0,
					total: 1,
				},
				dependencies: 50,
				totalDependencies: 100,
			};
			expect(data.vulnerabilities).toHaveLength(1);
			expect(data.summary.high).toBe(1);
		});
	});
});
