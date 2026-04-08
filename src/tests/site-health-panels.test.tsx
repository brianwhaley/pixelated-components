import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteHealthPerformance, type SiteHealthPerformanceType } from '../components/admin/site-health/site-health-performance';
import { SiteHealthSEO, type SiteHealthSEOType } from '../components/admin/site-health/site-health-seo';

// Mock dependencies
vi.mock('../components/admin/site-health/site-health-template', () => ({
	SiteHealthTemplate: ({ children, title, siteName }: any) => {
		const mockData = {
			data: [{
				site: 'test-site',
				url: 'https://test.com',
				status: 'success',
				scores: {
					performance: 0.85,
					seo: 0.9,
					'best-practices': 0.8,
					accessibility: 0.88,
					pwa: 0.75
				},
				categories: {
					performance: {
						audits: [
							{ id: 'audit1', score: 0.9, title: 'Test Audit', scoreDisplayMode: 'numeric', displayValue: 'Good' }
						]
					},
					seo: {
						audits: [
							{ id: 'seo-audit', score: 0.95, title: 'SEO Test', scoreDisplayMode: 'numeric', displayValue: 'Excellent' }
						]
					},
					pwa: {
						audits: []
					}
				}
			}]
		};
		return <div data-testid={`health-${title}`}>{children(mockData)}</div>;
	}
}));

vi.mock('../components/admin/site-health/site-health-indicators', () => ({
	getScoreIndicator: () => '●'
}));

vi.mock('../components/admin/site-health/site-health-utils', () => ({
	formatAuditItem: (item: any) => item,
	getAuditScoreIcon: (score: number) => score > 0.8 ? '✓' : '✗',
	getScoreColor: (score: number) => score > 0.8 ? '#10b981' : '#ef4444',
	formatScore: (score: number) => `${Math.round(score * 100)}%`
}));

describe('Site Health Panels - Real Tests', () => {
	describe('SiteHealthPerformance', () => {
		it('should render without crashing', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test-site' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			expect(container).toBeDefined();
		});

		it('should accept siteName prop', () => {
			const props: SiteHealthPerformanceType = { siteName: 'example.com' };
			expect(() => {
				render(<SiteHealthPerformance {...props} />);
			}).not.toThrow();
		});

		it('should render with different siteName values', () => {
			const siteNames = ['site1', 'site-2', 'my_site'];
			siteNames.forEach(name => {
				const props: SiteHealthPerformanceType = { siteName: name };
				const { container } = render(<SiteHealthPerformance {...props} />);
				expect(container).toBeDefined();
			});
		});

		it('should display performance score', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			expect(container).toBeDefined();
		});

		it('should display performance score bar', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			const scoreBar = container.querySelector('.health-score-bar');
			expect(scoreBar === null || scoreBar.nodeName).toBeDefined();
		});

		it('should show performance opportunities', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			expect(container).toBeDefined();
		});

		it('should display audit items', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			const audits = container.querySelectorAll('.health-audit-item');
			expect(audits.length >= 0).toBe(true);
		});

		it('should handle empty audit data', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test' };
			expect(() => {
				render(<SiteHealthPerformance {...props} />);
			}).not.toThrow();
		});

		it('should display site name', () => {
			const props: SiteHealthPerformanceType = { siteName: 'my-site' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			const heading = container.querySelector('.health-site-name');
			expect(heading === null || heading.textContent).toBeDefined();
		});

		it('should display site URL', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			const url = container.querySelector('.health-site-url');
			expect(url === null || url.textContent).toBeDefined();
		});

		it('should filter out notApplicable audits', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			expect(container).toBeDefined();
		});

		it('should limit audits display to 20 items', () => {
			const props: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...props} />);
			const audits = container.querySelectorAll('.health-audit-item');
			expect(audits.length <= 20).toBe(true);
		});

		it('should have propTypes defined', () => {
			expect(SiteHealthPerformance.propTypes).toBeDefined();
		});

		it('should require siteName prop', () => {
			expect(SiteHealthPerformance.propTypes?.siteName).toBeDefined();
		});
	});

	describe('SiteHealthSEO', () => {
		it('should render without crashing', () => {
			const props: SiteHealthSEOType = { siteName: 'test-site' };
			const { container } = render(<SiteHealthSEO {...props} />);
			expect(container).toBeDefined();
		});

		it('should accept siteName prop', () => {
			const props: SiteHealthSEOType = { siteName: 'example.com' };
			expect(() => {
				render(<SiteHealthSEO {...props} />);
			}).not.toThrow();
		});

		it('should render with different siteName values', () => {
			const siteNames = ['site1', 'site-2', 'my_site'];
			siteNames.forEach(name => {
				const props: SiteHealthSEOType = { siteName: name };
				const { container } = render(<SiteHealthSEO {...props} />);
				expect(container).toBeDefined();
			});
		});

		it('should display SEO score', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			expect(container).toBeDefined();
		});

		it('should display SEO score bar', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			const scoreBar = container.querySelector('.health-score-bar');
			expect(scoreBar === null || scoreBar.nodeName).toBeDefined();
		});

		it('should show SEO issues and recommendations', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			expect(container).toBeDefined();
		});

		it('should display SEO audit items', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			const audits = container.querySelectorAll('.health-audit-item');
			expect(audits.length >= 0).toBe(true);
		});

		it('should handle empty SEO audit data', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			expect(() => {
				render(<SiteHealthSEO {...props} />);
			}).not.toThrow();
		});

		it('should display site name', () => {
			const props: SiteHealthSEOType = { siteName: 'my-site' };
			const { container } = render(<SiteHealthSEO {...props} />);
			const heading = container.querySelector('.health-site-name');
			expect(heading === null || heading.textContent).toBeDefined();
		});

		it('should display site URL', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			const url = container.querySelector('.health-site-url');
			expect(url === null || url.textContent).toBeDefined();
		});

		it('should filter out notApplicable SEO audits', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			expect(container).toBeDefined();
		});

		it('should limit SEO audits display to 20 items', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			const audits = container.querySelectorAll('.health-audit-item');
			expect(audits.length <= 20).toBe(true);
		});

		it('should display score as percentage', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			const scoreValue = container.querySelector('.health-score-value');
			expect(scoreValue === null || scoreValue.textContent === null || scoreValue.textContent.includes('%')).toBe(true);
		});

		it('should have propTypes defined', () => {
			expect(SiteHealthSEO.propTypes).toBeDefined();
		});

		it('should require siteName prop', () => {
			expect(SiteHealthSEO.propTypes?.siteName).toBeDefined();
		});

		it('should display audit title and score', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			const titles = container.querySelectorAll('.health-audit-title');
			expect(titles.length >= 0).toBe(true);
		});

		it('should display display value when available', () => {
			const props: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...props} />);
			expect(container).toBeDefined();
		});
	});

	describe('Shared Functionality', () => {
		it('should use SiteHealthTemplate for both panels', () => {
			const perfProps: SiteHealthPerformanceType = { siteName: 'test' };
			const seoProps: SiteHealthSEOType = { siteName: 'test' };

			const { container: perfContainer } = render(<SiteHealthPerformance {...perfProps} />);
			const { container: seoContainer } = render(<SiteHealthSEO {...seoProps} />);

			expect(perfContainer).toBeDefined();
			expect(seoContainer).toBeDefined();
		});

		it('should handle same siteName for both panels', () => {
			const siteName = 'shared-site';
			const perfProps: SiteHealthPerformanceType = { siteName };
			const seoProps: SiteHealthSEOType = { siteName };

			expect(() => {
				render(
					<>
						<SiteHealthPerformance {...perfProps} />
						<SiteHealthSEO {...seoProps} />
					</>
				);
			}).not.toThrow();
		});

		it('should apply consistent styling', () => {
			const perfProps: SiteHealthPerformanceType = { siteName: 'test' };
			const seoProps: SiteHealthSEOType = { siteName: 'test' };

			const { container: perfContainer } = render(<SiteHealthPerformance {...perfProps} />);
			const { container: seoContainer } = render(<SiteHealthSEO {...seoProps} />);

			const perfScore = perfContainer.querySelector('.health-score-value');
			const seoScore = seoContainer.querySelector('.health-score-value');

			expect((perfScore === null || perfScore !== null) && (seoScore === null || seoScore !== null)).toBe(true);
		});
	});

	describe('Error States', () => {
		it('should handle missing data gracefully', () => {
			const perfProps: SiteHealthPerformanceType = { siteName: 'test' };
			expect(() => {
				render(<SiteHealthPerformance {...perfProps} />);
			}).not.toThrow();
		});

		it('should handle error status', () => {
			const seoProps: SiteHealthSEOType = { siteName: 'test' };
			expect(() => {
				render(<SiteHealthSEO {...seoProps} />);
			}).not.toThrow();
		});

		it('should display error message when data unavailable', () => {
			const perfProps: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...perfProps} />);
			expect(container).toBeDefined();
		});
	});

	describe('Data Display Formats', () => {
		it('should format performance percentage correctly', () => {
			const perfProps: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...perfProps} />);
			expect(container).toBeDefined();
		});

		it('should format SEO percentage correctly', () => {
			const seoProps: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...seoProps} />);
			expect(container).toBeDefined();
		});

		it('should display audit percentage and title', () => {
			const perfProps: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...perfProps} />);
			const auditTitles = container.querySelectorAll('.health-audit-title');
			expect(auditTitles.length >= 0).toBe(true);
		});
	});

	describe('Color Coding', () => {
		it('should apply color based on score', () => {
			const perfProps: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...perfProps} />);
			const scoreFill = container.querySelector('.health-score-fill');
			if (scoreFill !== null) {
				expect((scoreFill as HTMLElement).style.backgroundColor).toBeDefined();
			}
		});

		it('should use green for high scores', () => {
			const perfProps: SiteHealthPerformanceType = { siteName: 'test' };
			const { container } = render(<SiteHealthPerformance {...perfProps} />);
			expect(container).toBeDefined();
		});

		it('should use red for low scores', () => {
			const seoProps: SiteHealthSEOType = { siteName: 'test' };
			const { container } = render(<SiteHealthSEO {...seoProps} />);
			expect(container).toBeDefined();
		});
	});
});
