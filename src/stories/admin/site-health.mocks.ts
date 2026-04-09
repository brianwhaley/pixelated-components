import type {
  AxeCoreResponse,
  CoreWebVitalsResponse,
  DependencyData,
  GitData,
  UptimeData
} from '../../components/admin/site-health/site-health-types';

const baseTime = '2026-01-05T14:00:00.000Z';

const performanceAudits = [
  {
    id: 'largest-contentful-paint',
    title: 'Largest Contentful Paint',
    description: 'LCP should stay under 2.5s on desktop.',
    score: 0.78,
    scoreDisplayMode: 'numeric',
    displayValue: '1.8s',
    details: {
      items: [
        { url: 'https://pixelated.tech/', measurement: '1.8s' }
      ]
    }
  },
  {
    id: 'total-blocking-time',
    title: 'Total Blocking Time',
    description: 'TBT should be below 200ms.',
    score: 0.86,
    scoreDisplayMode: 'numeric',
    displayValue: '120ms',
    details: {
      items: [
        { url: 'https://pixelated.tech/blog', measurement: '120ms' }
      ]
    }
  }
];

const accessibilityAudits = [
  {
    id: 'color-contrast',
    title: 'Color Contrast',
    description: 'Ensure text meets WCAG 2.1 AA contrast ratios.',
    score: 0.95,
    scoreDisplayMode: 'numeric',
    displayValue: 'Contrast ratio 8.1:1',
    details: {
      items: [
        { element: 'header h1', contrast: '8.1:1' }
      ]
    }
  },
  {
    id: 'image-alt',
    title: 'Image Alternatives',
    description: 'Images should include meaningful alt text.',
    score: 0.92,
    scoreDisplayMode: 'numeric',
    displayValue: '2 images missing alt',
    details: {
      items: [
        { url: 'https://pixelated.tech/about', issue: 'missing alt text' }
      ]
    }
  }
];

const bestPracticesAudits = [
  {
    id: 'uses-https',
    title: 'Uses HTTPS',
    description: 'Ensure the page is served over HTTPS.',
    score: 1,
    scoreDisplayMode: 'binary',
    displayValue: 'HTTPS enforced'
  }
];

const seoAudits = [
  {
    id: 'meta-description',
    title: 'Meta Description',
    description: 'Each page should have a descriptive meta description.',
    score: 0.88,
    scoreDisplayMode: 'numeric',
    displayValue: 'All key pages covered',
    details: {
      items: [
        { page: '/products', status: 'Present' }
      ]
    }
  }
];

const pwaAudits = [
  {
    id: 'service-worker',
    title: 'Service Worker',
    description: 'Register a service worker to support offline mode.',
    score: 0.6,
    scoreDisplayMode: 'numeric',
    displayValue: 'Service worker ready'
  }
];

export const mockCoreWebVitalsResponse: CoreWebVitalsResponse = {
  success: true,
  data: [
    {
      site: 'pixelated-tech',
      url: 'https://pixelated.tech',
      metrics: {
        cls: 0.03,
        fid: 15,
        lcp: 1580,
        fcp: 780,
        ttfb: 170,
        speedIndex: 1900,
        interactive: 2200,
        totalBlockingTime: 42,
        firstMeaningfulPaint: 910
      },
      scores: {
        performance: 0.87,
        accessibility: 0.94,
        'best-practices': 0.92,
        seo: 0.89,
        pwa: 0.76
      },
      categories: {
        performance: {
          id: 'performance',
          title: 'Performance',
          score: 0.87,
          audits: performanceAudits
        },
        accessibility: {
          id: 'accessibility',
          title: 'Accessibility',
          score: 0.94,
          audits: accessibilityAudits
        },
        'best-practices': {
          id: 'best-practices',
          title: 'Best Practices',
          score: 0.92,
          audits: bestPracticesAudits
        },
        seo: {
          id: 'seo',
          title: 'SEO',
          score: 0.89,
          audits: seoAudits
        },
        pwa: {
          id: 'pwa',
          title: 'PWA',
          score: 0.76,
          audits: pwaAudits
        }
      },
      timestamp: baseTime,
      status: 'success'
    }
  ],
  details: 'Captured from pixelated.tech (mocked)'
};

export const mockAxeCoreResponse: AxeCoreResponse = {
  success: true,
  data: [
    {
      site: 'pixelated-tech',
      url: 'https://pixelated.tech',
      result: {
        violations: [
          {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Elements must have sufficient color contrast',
            help: 'Ensure text has enough contrast against background',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
            nodes: [
              {
                target: ['.hero h1'],
                html: '<h1>Pixelated</h1>',
                failureSummary: 'Text needs more contrast',
                ancestry: ['.hero']
              }
            ],
            tags: ['cat.color', 'wcag2aa', 'wcag1aa']
          }
        ],
        passes: [
          {
            id: 'aria-allowed-attr',
            impact: 'minor',
            description: 'ARIA attributes must be allowed on this element',
            help: 'Ensure ARIA attributes are valid',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/aria-allowed-attr',
            nodes: [],
            tags: []
          }
        ],
        incomplete: [],
        inapplicable: [],
        testEngine: {
          name: 'axe-core',
          version: '4.8.0'
        },
        testRunner: {
          name: 'axe'
        },
        testEnvironment: {
          userAgent: 'Mozilla/5.0',
          windowWidth: 1440,
          windowHeight: 900
        },
        timestamp: baseTime,
        url: 'https://pixelated.tech'
      },
      summary: {
        violations: 1,
        passes: 107,
        incomplete: 0,
        inapplicable: 3,
        critical: 0,
        serious: 1,
        moderate: 0,
        minor: 0
      },
      timestamp: baseTime,
      status: 'success'
    }
  ]
};

export const mockGoogleAnalyticsData = [
  { date: '2025-12-30', currentPageViews: 1024, previousPageViews: 921 },
  { date: '2025-12-31', currentPageViews: 1132, previousPageViews: 970 },
  { date: '2026-01-01', currentPageViews: 1204, previousPageViews: 1011 },
  { date: '2026-01-02', currentPageViews: 1098, previousPageViews: 1024 },
  { date: '2026-01-03', currentPageViews: 1345, previousPageViews: 1098 },
  { date: '2026-01-04', currentPageViews: 1460, previousPageViews: 1187 }
];

export const mockGoogleSearchConsoleData = [
  { date: '2025-12-30', currentImpressions: 45213, currentClicks: 1345, previousImpressions: 39801, previousClicks: 1204 },
  { date: '2025-12-31', currentImpressions: 46890, currentClicks: 1420, previousImpressions: 41012, previousClicks: 1281 },
  { date: '2026-01-01', currentImpressions: 48310, currentClicks: 1510, previousImpressions: 42210, previousClicks: 1325 },
  { date: '2026-01-02', currentImpressions: 47905, currentClicks: 1475, previousImpressions: 41985, previousClicks: 1302 },
  { date: '2026-01-03', currentImpressions: 49512, currentClicks: 1532, previousImpressions: 42501, previousClicks: 1340 }
];

export const mockCloudwatchData = [
  { date: '2026-01-01', successCount: 96, failureCount: 1, totalChecks: 97, successRate: 0.989 },
  { date: '2026-01-02', successCount: 98, failureCount: 0, totalChecks: 98, successRate: 1 },
  { date: '2026-01-03', successCount: 95, failureCount: 2, totalChecks: 97, successRate: 0.979 },
  { date: '2026-01-04', successCount: 97, failureCount: 1, totalChecks: 98, successRate: 0.99 },
  { date: '2026-01-05', successCount: 98, failureCount: 0, totalChecks: 98, successRate: 1 }
];

export const mockGitData: GitData = {
  success: true,
  timestamp: baseTime,
  commits: [
    {
      hash: 'c1a2b3d',
      date: '2026-01-05T05:00:00.000Z',
      message: 'Update site health stories',
      author: 'Pixelated Bot',
      version: 'v2.4.7~beta'
    },
    {
      hash: 'd4e5f6g',
      date: '2026-01-03T18:30:00.000Z',
      message: 'Improve deployment pipeline',
      author: 'Pixelated Bot'
    }
  ]
};

export const mockDependencyData: DependencyData = {
  success: true,
  status: 'Low Risk',
  timestamp: baseTime,
  url: 'https://pixelated.tech',
  message: 'Dependency scan completed',
  summary: {
    info: 12,
    low: 3,
    moderate: 1,
    high: 0,
    critical: 0,
    total: 16
  },
  dependencies: 48,
  totalDependencies: 50,
  vulnerabilities: [
    {
      name: 'marked',
      severity: 'moderate',
      title: 'Prototype pollution (CVE-2023-xxxx)',
      url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-xxxx',
      range: '>=1.0.0 <3.0.0',
      fixAvailable: true
    },
    {
      name: 'lodash',
      severity: 'low',
      title: 'Minor advisory',
      range: '<4.0.0',
      fixAvailable: true
    }
  ]
};

export const mockUptimeData: UptimeData = {
  success: true,
  status: 'Healthy',
  timestamp: baseTime,
  url: 'https://pixelated.tech',
  message: 'All health checks passing'
};

export const mockOnSiteSEOData = {
  site: 'pixelated-tech',
  url: 'https://pixelated.tech',
  overallScore: 0.92,
  pagesAnalyzed: [
    {
      url: 'https://pixelated.tech/',
      title: 'Home',
      statusCode: 200,
      crawledAt: baseTime,
      audits: [
        {
          id: 'title-tag',
          title: 'Title Tag',
          score: 1,
          scoreDisplayMode: 'binary',
          displayValue: 'All good',
          category: 'on-page'
        },
        {
          id: 'meta-description',
          title: 'Meta Description',
          score: 0.9,
          scoreDisplayMode: 'numeric',
          displayValue: 'Short and descriptive',
          category: 'on-page',
          details: {
            items: [
              { page: '/', score: 0.9, displayValue: 'Present' }
            ]
          }
        }
      ]
    },
    {
      url: 'https://pixelated.tech/blog/',
      title: 'Blog',
      statusCode: 200,
      crawledAt: baseTime,
      audits: [
        {
          id: 'canonical-link',
          title: 'Canonical Link',
          score: 0.8,
          scoreDisplayMode: 'numeric',
          displayValue: 'Points to /blog',
          category: 'on-site'
        }
      ]
    }
  ],
  onSiteAudits: [
    {
      id: 'structured-data',
      title: 'Structured Data',
      score: 0.75,
      scoreDisplayMode: 'numeric',
      displayValue: 'Schema.org Article present',
      category: 'on-site',
      details: {
        items: [
          { page: '/blog/', score: 0.75 }
        ]
      }
    }
  ],
  totalPages: 2,
  timestamp: baseTime,
  status: 'success'
};

export const templateStoryMock = {
  score: 94,
  status: 'Healthy',
  details: 'Mock template response captured from pixelated.tech'
};
