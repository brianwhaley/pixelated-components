import React from 'react';
import { SiteHealthAxeCore } from '../../components/admin/site-health/site-health-axe-core';
import { SiteHealthOverview } from '../../components/admin/site-health/site-health-overview';
import { SiteHealthTemplate } from '../../components/admin/site-health/site-health-template';
import { SiteHealthPerformance } from '../../components/admin/site-health/site-health-performance';
import { SiteHealthSecurity } from '../../components/admin/site-health/site-health-security';
import { SiteHealthSEO } from '../../components/admin/site-health/site-health-seo';
import { SiteHealthAccessibility } from '../../components/admin/site-health/site-health-accessibility';
import { SiteHealthGoogleAnalytics } from '../../components/admin/site-health/site-health-google-analytics';
import { SiteHealthGoogleSearchConsole } from '../../components/admin/site-health/site-health-google-search-console';
import { SiteHealthOnSiteSEO } from '../../components/admin/site-health/site-health-on-site-seo';
import { SiteHealthDependencyVulnerabilities } from '../../components/admin/site-health/site-health-dependency-vulnerabilities';
import { SiteHealthGit } from '../../components/admin/site-health/site-health-github';
import { SiteHealthUptime } from '../../components/admin/site-health/site-health-uptime';
import { SiteHealthCloudwatch } from '../../components/admin/site-health/site-health-cloudwatch';

export default {
  title: 'Admin/Site Health',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Site health monitoring components for displaying accessibility, performance, and other site metrics.'
      }
    }
  }
};

// Mock data for SiteHealthAxeCore
const mockAxeData = {
  site: 'example.com',
  url: 'https://example.com',
  violations: [
    {
      id: 'color-contrast',
      impact: 'serious',
      description: 'Elements must have sufficient color contrast',
      help: 'Ensure text has enough contrast against background',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
      nodes: [
        {
          target: ['.header h1'],
          html: '<h1>Welcome</h1>',
          failureSummary: 'Fix any of the following: Element has insufficient color contrast of 2.5:1'
        }
      ]
    },
    {
      id: 'image-alt',
      impact: 'critical',
      description: 'Images must have alternate text',
      help: 'Provide alternative text for images',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
      nodes: [
        {
          target: ['img[alt=""]'],
          html: '<img src="logo.png" alt="">',
          failureSummary: 'Fix any of the following: aria-label attribute does not exist or is empty'
        }
      ]
    }
  ],
  passes: 45,
  incomplete: 2,
  inapplicable: 12
};

// Mock data for SiteHealthOverview
const mockCWVData = {
  site: 'example.com',
  url: 'https://example.com',
  metrics: {
    cls: 0.05,
    fid: 85,
    lcp: 1200,
    fcp: 800,
    ttfb: 150,
    speedIndex: 1100,
    interactive: 1300,
    totalBlockingTime: 50,
    firstMeaningfulPaint: 900
  },
  scores: {
    performance: 85,
    accessibility: 90,
    bestPractices: 95,
    seo: 88,
    pwa: 75
  },
  categories: {
    performance: { score: 85, displayValue: 'Good' },
    accessibility: { score: 90, displayValue: 'Good' },
    bestPractices: { score: 95, displayValue: 'Good' },
    seo: { score: 88, displayValue: 'Good' },
    pwa: { score: 75, displayValue: 'Good' }
  }
};

export const AxeCoreHealthCard = () => {
  const mockEndpoint = {
    endpoint: 'https://api.example.com/axe-core',
    method: 'GET' as const,
    responseTransformer: () => ({
      site: 'example.com',
      url: 'https://example.com',
      violations: [
        {
          id: 'color-contrast',
          impact: 'serious',
          description: 'Elements must have sufficient color contrast',
          help: 'Ensure text has enough contrast against background',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
          nodes: [
            {
              target: ['.header h1'],
              html: '<h1>Welcome</h1>',
              failureSummary: 'Fix any of the following: Element has insufficient color contrast of 2.5:1'
            }
          ]
        },
        {
          id: 'image-alt',
          impact: 'critical',
          description: 'Images must have alternate text',
          help: 'Provide alternative text for images',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
          nodes: [
            {
              target: ['img[alt=""]'],
              html: '<img src="logo.png" alt="">',
              failureSummary: 'Fix any of the following: aria-label attribute does not exist or is empty'
            }
          ]
        }
      ],
      passes: 45,
      incomplete: 2,
      inapplicable: 12
    })
  };

  return (
    <SiteHealthTemplate
      siteName="example.com"
      endpoint={mockEndpoint}
    >
      {(data) => {
        if (!data) return <div>Loading...</div>;

        const summary = {
          violations: data.violations.length,
          passes: data.passes,
          critical: data.violations.filter((v: any) => v.impact === 'critical').length,
          serious: data.violations.filter((v: any) => v.impact === 'serious').length,
          moderate: data.violations.filter((v: any) => v.impact === 'moderate').length,
          minor: data.violations.filter((v: any) => v.impact === 'minor').length
        };

        const getImpactColor = (impact: string) => {
          switch (impact) {
            case 'critical': return '#ef4444';
            case 'serious': return '#f59e0b';
            case 'moderate': return '#3b82f6';
            case 'minor': return '#6b7280';
            default: return '#6b7280';
          }
        };

        return (
          <div>
            <div className="health-score-container">
              <div className="health-score-item">
                <div className="health-score-label">Accessibility Score</div>
                <div className="health-score-value" style={{ color: summary.violations === 0 ? '#10b981' : '#ef4444' }}>
                  {summary.passes}/{summary.passes + summary.violations}
                </div>
              </div>
            </div>

            <div className="health-score-container">
              <div className="health-score-item">
                <div className="health-score-label">Test Results</div>
                <div className="health-score-grid">
                  <div className="health-stat-item">
                    <span className="health-stat-label">Passed: </span>
                    <span className="health-stat-value" style={{ color: '#10b981' }}>
                      {summary.passes}
                    </span>
                  </div>
                  <div className="health-stat-item">
                    <span className="health-stat-label">Violations: </span>
                    <span className="health-stat-value" style={{ color: summary.violations > 0 ? '#ef4444' : '#10b981' }}>
                      {summary.violations}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {summary.violations > 0 && (
              <div className="health-score-container">
                <div className="health-score-item">
                  <div className="health-score-label">Violation Impact Levels</div>
                  <div className="health-score-grid">
                    <div className="health-stat-item">
                      <span className="health-stat-label">Critical: </span>
                      <span className="health-stat-value" style={{ color: getImpactColor('critical') }}>
                        {summary.critical}
                      </span>
                    </div>
                    <div className="health-stat-item">
                      <span className="health-stat-label">Serious: </span>
                      <span className="health-stat-value" style={{ color: getImpactColor('serious') }}>
                        {summary.serious}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </SiteHealthTemplate>
  );
};

AxeCoreHealthCard.storyName = 'Axe Core Accessibility';

export const OverviewHealthCard = () => {
  const mockEndpoint = {
    endpoint: 'https://api.example.com/core-web-vitals',
    method: 'GET' as const,
    responseTransformer: () => ({
      site: 'example.com',
      url: 'https://example.com',
      metrics: {
        cls: 0.05,
        fid: 85,
        lcp: 1200,
        fcp: 800,
        ttfb: 150,
        speedIndex: 1100,
        interactive: 1300,
        totalBlockingTime: 50,
        firstMeaningfulPaint: 900
      },
      scores: {
        performance: 85,
        accessibility: 90,
        bestPractices: 95,
        seo: 88,
        pwa: 75
      },
      categories: {
        performance: { score: 85, displayValue: 'Good' },
        accessibility: { score: 90, displayValue: 'Good' },
        bestPractices: { score: 95, displayValue: 'Good' },
        seo: { score: 88, displayValue: 'Good' },
        pwa: { score: 75, displayValue: 'Good' }
      }
    })
  };

  return (
    <SiteHealthTemplate
      siteName="example.com"
      endpoint={mockEndpoint}
    >
      {(data) => {
        if (!data) return <div>Loading...</div>;

        const getScoreColor = (score: number) => {
          if (score >= 90) return '#10b981';
          if (score >= 50) return '#f59e0b';
          return '#ef4444';
        };

        return (
          <div>
            <div className="health-score-container">
              <div className="health-score-item">
                <div className="health-score-label">Overall Performance Score</div>
                <div className="health-score-value" style={{ color: getScoreColor(data.scores.performance) }}>
                  {data.scores.performance}
                </div>
              </div>
            </div>

            <div className="health-score-container">
              <div className="health-score-item">
                <div className="health-score-label">Core Web Vitals</div>
                <div className="health-score-grid">
                  <div className="health-stat-item">
                    <span className="health-stat-label">LCP: </span>
                    <span className="health-stat-value" style={{ color: data.metrics.lcp <= 2500 ? '#10b981' : '#ef4444' }}>
                      {(data.metrics.lcp / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <div className="health-stat-item">
                    <span className="health-stat-label">FID: </span>
                    <span className="health-stat-value" style={{ color: data.metrics.fid <= 100 ? '#10b981' : '#f59e0b' }}>
                      {data.metrics.fid}ms
                    </span>
                  </div>
                  <div className="health-stat-item">
                    <span className="health-stat-label">CLS: </span>
                    <span className="health-stat-value" style={{ color: data.metrics.cls <= 0.1 ? '#10b981' : '#f59e0b' }}>
                      {data.metrics.cls}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="health-score-container">
              <div className="health-score-item">
                <div className="health-score-label">Lighthouse Scores</div>
                <div className="health-score-grid">
                  <div className="health-stat-item">
                    <span className="health-stat-label">Performance: </span>
                    <span className="health-stat-value" style={{ color: getScoreColor(data.scores.performance) }}>
                      {data.scores.performance}
                    </span>
                  </div>
                  <div className="health-stat-item">
                    <span className="health-stat-label">Accessibility: </span>
                    <span className="health-stat-value" style={{ color: getScoreColor(data.scores.accessibility) }}>
                      {data.scores.accessibility}
                    </span>
                  </div>
                  <div className="health-stat-item">
                    <span className="health-stat-label">SEO: </span>
                    <span className="health-stat-value" style={{ color: getScoreColor(data.scores.seo) }}>
                      {data.scores.seo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </SiteHealthTemplate>
  );
};

OverviewHealthCard.storyName = 'Core Web Vitals Overview';

export const TemplateWithMockData = () => {
  const mockEndpoint = {
    endpoint: 'https://api.example.com/template-data',
    method: 'GET' as const,
    responseTransformer: () => ({
      score: 85,
      status: 'Good',
      details: 'Site performance is excellent'
    })
  };

  return (
    <SiteHealthTemplate
      siteName="example.com"
      endpoint={mockEndpoint}
    >
      {(data) => {
        if (!data) return <div>Loading...</div>;

        return (
          <div className="health-score-container">
            <div className="health-score-item">
              <div className="health-score-label">Template Example</div>
              <div className="health-score-value" style={{ color: '#10b981' }}>
                {data.score}
              </div>
            </div>
            <div className="health-score-item">
              <div className="health-score-label">Status</div>
              <div className="health-score-value">{data.status}</div>
            </div>
          </div>
        );
      }}
    </SiteHealthTemplate>
  );
};

TemplateWithMockData.storyName = 'Site Health Template';

export const PerformanceHealthCard = () => {
  const MockPerformanceComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>Performance Metrics</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#10b981' }}>88</span>
            <span className="score-label">Good</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metrics-grid">
            <div className="metric-item">
              <span className="metric-name">First Contentful Paint</span>
              <span className="metric-value" style={{ color: '#10b981' }}>800ms</span>
            </div>
            <div className="metric-item">
              <span className="metric-name">Speed Index</span>
              <span className="metric-value" style={{ color: '#10b981' }}>1.1s</span>
            </div>
            <div className="metric-item">
              <span className="metric-name">Time to Interactive</span>
              <span className="metric-value" style={{ color: '#f59e0b' }}>1.3s</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <MockPerformanceComponent />;
};

PerformanceHealthCard.storyName = 'Performance Metrics';

export const SecurityHealthCard = () => {
  const MockSecurityComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>Security Scan</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#10b981' }}>95</span>
            <span className="score-label">Excellent</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">Vulnerabilities Found:</span>
            <span className="metric-value" style={{ color: '#10b981' }}>0</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Security Headers:</span>
            <span className="metric-value" style={{ color: '#10b981' }}>All Present</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockSecurityComponent />;
};

SecurityHealthCard.storyName = 'Security Scan';

export const SEOHealthCard = () => {
  const MockSEOComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>SEO Analysis</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#f59e0b' }}>78</span>
            <span className="score-label">Needs Improvement</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">Meta Description:</span>
            <span className="metric-value" style={{ color: '#ef4444' }}>Missing</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Title Tag:</span>
            <span className="metric-value" style={{ color: '#10b981' }}>Present</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockSEOComponent />;
};

SEOHealthCard.storyName = 'SEO Analysis';

export const AccessibilityHealthCard = () => {
  const MockAccessibilityComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>Accessibility Audit</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#10b981' }}>90</span>
            <span className="score-label">Good</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">WCAG Compliance:</span>
            <span className="metric-value" style={{ color: '#10b981' }}>AA</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Issues Found:</span>
            <span className="metric-value" style={{ color: '#f59e0b' }}>3</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockAccessibilityComponent />;
};

AccessibilityHealthCard.storyName = 'Accessibility Audit';

export const GoogleAnalyticsHealthCard = () => {
  const MockGoogleAnalyticsComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>Google Analytics</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#10b981' }}>Active</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">Page Views (30d):</span>
            <span className="metric-value">12,543</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Unique Visitors:</span>
            <span className="metric-value">8,921</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockGoogleAnalyticsComponent />;
};

GoogleAnalyticsHealthCard.storyName = 'Google Analytics';

export const GoogleSearchConsoleHealthCard = () => {
  const MockGoogleSearchConsoleComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>Google Search Console</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#10b981' }}>Active</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">Impressions (30d):</span>
            <span className="metric-value">45,231</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Clicks (30d):</span>
            <span className="metric-value">1,234</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockGoogleSearchConsoleComponent />;
};

GoogleSearchConsoleHealthCard.storyName = 'Google Search Console';

export const OnSiteSEOHealthCard = () => {
  const MockOnSiteSEOComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>On-Site SEO</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#f59e0b' }}>82</span>
            <span className="score-label">Good</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">Title Tags:</span>
            <span className="metric-value" style={{ color: '#10b981' }}>15/15</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Meta Descriptions:</span>
            <span className="metric-value" style={{ color: '#f59e0b' }}>12/15</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockOnSiteSEOComponent />;
};

OnSiteSEOHealthCard.storyName = 'On-Site SEO';

export const DependencyVulnerabilitiesHealthCard = () => {
  const MockDependencyComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>Dependency Vulnerabilities</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#ef4444' }}>65</span>
            <span className="score-label">At Risk</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">High Severity:</span>
            <span className="metric-value" style={{ color: '#ef4444' }}>3</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Medium Severity:</span>
            <span className="metric-value" style={{ color: '#f59e0b' }}>7</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockDependencyComponent />;
};

DependencyVulnerabilitiesHealthCard.storyName = 'Dependency Vulnerabilities';

export const GitHubHealthCard = () => {
  const MockGitHubComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>GitHub Integration</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#10b981' }}>Active</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">Last Commit:</span>
            <span className="metric-value">2 hours ago</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Open Issues:</span>
            <span className="metric-value">5</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockGitHubComponent />;
};

GitHubHealthCard.storyName = 'GitHub Integration';

export const UptimeHealthCard = () => {
  const MockUptimeComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>Uptime Monitoring</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#10b981' }}>99.9%</span>
            <span className="score-label">Excellent</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">Uptime (30d):</span>
            <span className="metric-value" style={{ color: '#10b981' }}>99.9%</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Response Time:</span>
            <span className="metric-value">245ms</span>
          </div>
        </div>
      </div>
    );
  };

  return <MockUptimeComponent />;
};

UptimeHealthCard.storyName = 'Uptime Monitoring';

export const CloudwatchHealthCard = () => {
  const MockCloudwatchComponent = () => {
    return (
      <div className="site-health-card">
        <div className="site-health-header">
          <h3>CloudWatch Uptime</h3>
          <div className="site-health-score">
            <span className="score-value" style={{ color: '#10b981' }}>99.8%</span>
            <span className="score-label">Excellent</span>
          </div>
        </div>
        <div className="site-health-content">
          <div className="health-metric">
            <span className="metric-label">Uptime (24h):</span>
            <span className="metric-value" style={{ color: '#10b981' }}>99.8%</span>
          </div>
          <div className="health-metric">
            <span className="metric-label">Response Time:</span>
            <span className="metric-value">180ms</span>
          </div>
          <div className="health-chart">
            <div style={{ width: '100%', height: '200px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>CloudWatch Uptime Chart</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <MockCloudwatchComponent />;
};

CloudwatchHealthCard.storyName = 'CloudWatch Uptime Monitoring';