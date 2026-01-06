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
import { SiteHealthMockProvider } from '../../components/admin/site-health/site-health-mock-context';
import {
  mockAxeCoreResponse,
  mockCloudwatchData,
  mockCoreWebVitalsResponse,
  mockDependencyData,
  mockGitData,
  mockGoogleAnalyticsData,
  mockGoogleSearchConsoleData,
  mockOnSiteSEOData,
  mockUptimeData,
  templateStoryMock
} from './site-health.mocks';

export default {
  title: 'Admin/Site Health',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Site health monitoring components built on SiteHealthTemplate and mocked API data for Storybook.'
      }
    }
  }
};

const storyMocks = {
  'Axe-Core Accessibility': mockAxeCoreResponse,
  'PageSpeed - Site Overview': mockCoreWebVitalsResponse,
  'PageSpeed - Performance': mockCoreWebVitalsResponse,
  'PageSpeed - Security': { psiData: mockCoreWebVitalsResponse },
  'PageSpeed - SEO': mockCoreWebVitalsResponse,
  'PageSpeed - Accessibility': mockCoreWebVitalsResponse,
  'Google Analytics': mockGoogleAnalyticsData,
  'Google Search Console': mockGoogleSearchConsoleData,
  'On-Site SEO': mockOnSiteSEOData,
  'Dependency Vulnerability': mockDependencyData,
  'Git Push Notes': mockGitData,
  'Health Status': mockUptimeData,
  'CloudWatch Uptime': mockCloudwatchData
} as const;

type StoryTitle = keyof typeof storyMocks;

const MockedStory = ({ title, children }: { title: StoryTitle; children: React.ReactNode }) => (
  <SiteHealthMockProvider mocks={{ [title]: storyMocks[title] }}>
    {children}
  </SiteHealthMockProvider>
);

export const AxeCoreHealthCard = () => (
  <MockedStory title="Axe-Core Accessibility">
    <SiteHealthAxeCore siteName="pixelated.tech" />
  </MockedStory>
);

AxeCoreHealthCard.storyName = 'Axe Core Accessibility';

export const OverviewHealthCard = () => (
  <MockedStory title="PageSpeed - Site Overview">
    <SiteHealthOverview siteName="pixelated.tech" />
  </MockedStory>
);

OverviewHealthCard.storyName = 'Core Web Vitals Overview';

export const TemplateWithMockData = () => (
  <SiteHealthTemplate
    siteName="pixelated.tech"
    title="Site Health Template Example"
    data={templateStoryMock}
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

TemplateWithMockData.storyName = 'Site Health Template';

export const PerformanceHealthCard = () => (
  <MockedStory title="PageSpeed - Performance">
    <SiteHealthPerformance siteName="pixelated.tech" />
  </MockedStory>
);

PerformanceHealthCard.storyName = 'Performance Metrics';

export const SecurityHealthCard = () => (
  <MockedStory title="PageSpeed - Security">
    <SiteHealthSecurity siteName="pixelated.tech" />
  </MockedStory>
);

SecurityHealthCard.storyName = 'Security Scan';

export const SEOHealthCard = () => (
  <MockedStory title="PageSpeed - SEO">
    <SiteHealthSEO siteName="pixelated.tech" />
  </MockedStory>
);

SEOHealthCard.storyName = 'SEO Analysis';

export const AccessibilityHealthCard = () => (
  <MockedStory title="PageSpeed - Accessibility">
    <SiteHealthAccessibility siteName="pixelated.tech" />
  </MockedStory>
);

AccessibilityHealthCard.storyName = 'Accessibility Audit';

export const GoogleAnalyticsHealthCard = () => (
  <MockedStory title="Google Analytics">
    <SiteHealthGoogleAnalytics siteName="pixelated.tech" />
  </MockedStory>
);

GoogleAnalyticsHealthCard.storyName = 'Google Analytics';

export const GoogleSearchConsoleHealthCard = () => (
  <MockedStory title="Google Search Console">
    <SiteHealthGoogleSearchConsole siteName="pixelated.tech" />
  </MockedStory>
);

GoogleSearchConsoleHealthCard.storyName = 'Google Search Console';

export const OnSiteSEOHealthCard = () => (
  <MockedStory title="On-Site SEO">
    <SiteHealthOnSiteSEO siteName="pixelated.tech" />
  </MockedStory>
);

OnSiteSEOHealthCard.storyName = 'On-Site SEO';

export const DependencyVulnerabilitiesHealthCard = () => (
  <MockedStory title="Dependency Vulnerability">
    <SiteHealthDependencyVulnerabilities siteName="pixelated.tech" />
  </MockedStory>
);

DependencyVulnerabilitiesHealthCard.storyName = 'Dependency Vulnerabilities';

export const GitHubHealthCard = () => (
  <MockedStory title="Git Push Notes">
    <SiteHealthGit siteName="pixelated.tech" />
  </MockedStory>
);

GitHubHealthCard.storyName = 'GitHub Integration';

export const UptimeHealthCard = () => (
  <MockedStory title="Health Status">
    <SiteHealthUptime siteName="pixelated.tech" />
  </MockedStory>
);

UptimeHealthCard.storyName = 'Uptime Monitoring';

export const CloudwatchHealthCard = () => (
  <MockedStory title="CloudWatch Uptime">
    <SiteHealthCloudwatch siteName="pixelated.tech" />
  </MockedStory>
);

CloudwatchHealthCard.storyName = 'CloudWatch Uptime Monitoring';
