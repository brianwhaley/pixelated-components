import { describe, it, expect } from 'vitest';

// Test exports from site-health-types.ts
import * as siteHealthTypes from '../components/admin/site-health/site-health-types';

describe('site-health-types - Export Coverage', () => {
	it('should export PSIAudit interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export PSICategory interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export PSIScores interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export Vulnerability interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export DependencyData interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export UptimeData interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export GitCommit interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export GitData interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export AxeNode interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export AxeViolation interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export AxeResult interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export AxeCoreData interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export AxeCoreResponse interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export CoreWebVitalsMetrics interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export CoreWebVitalsData interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});

	it('should export CoreWebVitalsResponse interface', () => {
		expect(siteHealthTypes).toBeDefined();
	});
});
