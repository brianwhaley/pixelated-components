// Shared types for Site Health components
export interface PSIAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
  numericValue?: number;
  details?: Record<string, unknown>;
}

export interface PSICategory {
  id: string;
  title: string;
  score: number | null;
  audits: PSIAudit[];
}

export interface PSIScores {
  performance: number | null;
  accessibility: number | null;
  'best-practices': number | null;
  seo: number | null;
  pwa: number | null;
}

// OLD INTERFACES - No longer used after core-web-vitals consolidation
// All components now use CoreWebVitalsData and CoreWebVitalsResponse
/*
export interface SiteHealthData {
  site: string;
  url: string;
  scores: PSIScores;
  categories: {
    performance: PSICategory;
    accessibility: PSICategory;
    'best-practices': PSICategory;
    seo: PSICategory;
    pwa: PSICategory;
  };
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

export interface SiteHealthResponse {
  success: boolean;
  data?: SiteHealthData[];
  error?: string;
  details?: string;
}
*/

// Dependency vulnerability types
export interface Vulnerability {
  name: string;
  severity: 'info' | 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  url?: string;
  range: string;
  fixAvailable: boolean;
}

export interface DependencyData {
  success: boolean;
  status: string;
  message?: string;
  timestamp: string;
  url?: string;
  vulnerabilities: Vulnerability[];
  summary: {
    info: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
    total: number;
  };
  dependencies: number;
  totalDependencies: number;
  error?: string;
}

// Uptime types
export interface UptimeData {
  success: boolean;
  status: 'Healthy' | 'Unhealthy' | 'Unknown';
  timestamp: string;
  url?: string;
  message?: string;
}

// Git types
export interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author: string;
  version?: string;
}

export interface GitData {
  success: boolean;
  commits?: GitCommit[];
  error?: string;
  timestamp: string;
}

// Axe-core accessibility types
export interface AxeNode {
  target: string[];
  html: string;
  failureSummary?: string;
  ancestry?: string[];
}

export interface AxeViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: AxeNode[];
  tags: string[];
}

export interface AxeResult {
  violations: AxeViolation[];
  passes: AxeViolation[];
  incomplete: AxeViolation[];
  inapplicable: AxeViolation[];
  testEngine: {
    name: string;
    version: string;
  };
  testRunner: {
    name: string;
  };
  testEnvironment: {
    userAgent: string;
    windowWidth: number;
    windowHeight: number;
    orientationAngle?: number;
    orientationType?: string;
  };
  timestamp: string;
  url: string;
}

export interface AxeCoreData {
  site: string;
  url: string;
  result: AxeResult;
  summary: {
    violations: number;
    passes: number;
    incomplete: number;
    inapplicable: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  timestamp: string;
  status: 'success' | 'error';
  warnings?: string[];
  injectionSource?: string;
  error?: string;
}

export interface AxeCoreResponse {
  success: boolean;
  data?: AxeCoreData[];
  error?: string;
  details?: string;
}

// Core Web Vitals types
export interface CoreWebVitalsMetrics {
  cls: number;
  fid: number;
  lcp: number;
  fcp: number;
  ttfb: number;
  speedIndex: number;
  interactive: number;
  totalBlockingTime: number;
  firstMeaningfulPaint: number;
}

export interface CoreWebVitalsData {
  site: string;
  url: string;
  metrics: CoreWebVitalsMetrics;
  scores: PSIScores;
  categories: {
    performance: PSICategory;
    accessibility: PSICategory;
    'best-practices': PSICategory;
    seo: PSICategory;
    pwa: PSICategory;
  };
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

export interface CoreWebVitalsResponse {
  success: boolean;
  data?: CoreWebVitalsData[];
  error?: string;
  details?: string;
}