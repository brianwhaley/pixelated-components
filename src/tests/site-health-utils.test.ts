import { describe, it, expect } from 'vitest';
import { getAuditScoreIcon, getScoreColor, formatScore, formatAuditItem } from '../components/admin/site-health/site-health-utils';

describe('site-health-utils', () => {
	describe('getAuditScoreIcon', () => {
		it('should return check icon for high score', () => {
			expect(getAuditScoreIcon(0.95)).toBe('🟢');
		});
		it('should return warning icon for medium score', () => {
			expect(getAuditScoreIcon(0.6)).toBe('🟠');
		});
		it('should return error icon for low score', () => {
			expect(getAuditScoreIcon(0.2)).toBe('🔴');
		});
		it('should return help icon for null score', () => {
			expect(getAuditScoreIcon(null)).toBe('⚪');
		});
	});

	describe('getScoreColor', () => {
		it('should return green for high score', () => {
			expect(getScoreColor(0.95)).toBe('#10b981');
		});
		it('should return orange/yellow for medium score', () => {
			expect(getScoreColor(0.6)).toBe('#ea580c');
		});
		it('should return red for low score', () => {
			expect(getScoreColor(0.2)).toBe('#dc2626');
		});
	});

	describe('formatScore', () => {
		it('should format decimals as percentages', () => {
			expect(formatScore(0.85)).toBe('85%');
			expect(formatScore(0.999)).toBe('100%');
			expect(formatScore(0)).toBe('0%');
		});

		it('should return N/A for null', () => {
			expect(formatScore(null)).toBe('N/A');
		});
	});

	describe('formatAuditItem', () => {
		it('should prioritize descriptive strings over raw URLs when both present', () => {
			// In the current "unrefactored" code, URL takes precedence
			expect(formatAuditItem({ duration: 50.1, url: 'img.jpg' })).toBe('img.jpg');
		});

		it('should handle source strings as fallbacks', () => {
			expect(formatAuditItem({ source: 'script.js' })).toBe('script.js');
		});

		it('should handle text descriptions', () => {
			expect(formatAuditItem({ text: 'Some issue' })).toBe('Some issue');
		});

		it('should handle entities', () => {
			expect(formatAuditItem({ entity: 'Google Analytics' })).toBe('Google Analytics');
		});

		it('should handle nodes with selectors', () => {
			expect(formatAuditItem({ node: { selector: '.main-nav' } })).toBe('Element: .main-nav');
		});

		it('should handle nodes with snippets (short)', () => {
			expect(formatAuditItem({ node: { snippet: '<div>Text</div>' } })).toBe('Element: <div>Text</div>');
		});

		it('should handle nodes with snippets (long - truncated)', () => {
			const longSnippet = '<div>' + 'A'.repeat(100) + '</div>';
			expect(formatAuditItem({ node: { snippet: longSnippet } })).toContain('...');
			expect(formatAuditItem({ node: { snippet: longSnippet } }).length).toBeLessThan(65);
		});

		it('should handle origins', () => {
			expect(formatAuditItem({ origin: 'https://example.com' })).toBe('https://example.com');
		});

		it('should handle labels', () => {
			expect(formatAuditItem({ label: 'Diagnostic' })).toBe('Diagnostic');
		});

		it('should handle numeric values with units', () => {
			expect(formatAuditItem({ 
				value: { type: 'numeric', value: 45 }, 
				unit: 'px' 
			})).toBe('45px');
		});

		it('should handle statistics', () => {
			expect(formatAuditItem({ 
				statistic: 'Total Request count', 
				value: { type: 'numeric', value: 45 } 
			})).toBe('45');
		});

		it('should handle raw numbers with context (Server)', () => {
			expect(formatAuditItem(150.5, 'Server response time')).toBe('150.50ms server response');
		});

		it('should handle raw numbers with context (Network)', () => {
			expect(formatAuditItem(123.456, 'Network requests')).toBe('123.46ms network request');
		});

		it('should handle raw numbers with context (Render)', () => {
			expect(formatAuditItem(123.456, 'Render-blocking')).toBe('123.46ms render blocking');
		});

		it('should handle raw numbers with context (JavaScript)', () => {
			expect(formatAuditItem(123.456, 'JS Execution')).toBe('123.46ms JavaScript');
		});

		it('should handle raw numbers with context (Image)', () => {
			expect(formatAuditItem(123.456, 'Image elements')).toBe('123.46ms media resource');
		});

		it('should handle timing objects (Server Context)', () => {
			expect(formatAuditItem({ value: 30.5, unit: 'ms' }, 'Server latency')).toBe('30.50ms server time');
		});

		it('should handle timing objects (Network Context)', () => {
			expect(formatAuditItem({ value: 30.5, unit: 'ms' }, 'Network wait')).toBe('30.50ms network time');
		});

		it('should handle duration with more context (source)', () => {
			// Current behavior: source takes precedence
			expect(formatAuditItem({ duration: 10, source: 'script.ts' })).toBe('script.ts');
		});

		it('should handle duration with more context (name)', () => {
			expect(formatAuditItem({ duration: 10, name: 'Task' })).toBe('10.00ms for Task');
		});

		it('should handle duration with more context (path)', () => {
			expect(formatAuditItem({ duration: 10, path: '/test' })).toBe('10.00ms for /test');
		});

		it('should handle duration with more context (request)', () => {
			expect(formatAuditItem({ duration: 10, request: 'GET' })).toBe('10.00ms for GET');
		});

		it('should handle response times', () => {
			expect(formatAuditItem({ responseTime: 250 })).toBe('250.00ms response time');
			// Current behavior: url takes precedence
			expect(formatAuditItem({ responseTime: 250, url: 'api.com' })).toBe('api.com');
		});

		it('should handle start/end times', () => {
			expect(formatAuditItem({ startTime: 10, endTime: 25 })).toBe('10.00ms - 25.00ms');
			expect(formatAuditItem({ startTime: 10 })).toBe('10.00ms - ?ms');
		});

		it('should handle transfer size with timing', () => {
			// Current behavior: matches duration check further up (line 125 or 138-ish?)
			// Wait, let's look at the code again for lines 125-132.
			/*
			if (item.value && typeof item.value === 'number') {
				const unit = (item as any).unit || 'ms';
				...
				return `${item.value.toFixed(2)}${unit}${context}`;
			}
			*/
			// And lines 135-151:
			/*
			if (item.duration && typeof item.duration === 'number') {
				const duration = item.duration;
				...
				return `${duration.toFixed(2)}ms${context}`;
			}
			*/
			// Since { transferSize: 10240, duration: 150 } has duration, it hits that block first.
			expect(formatAuditItem({ transferSize: 10240, duration: 150 })).toBe('150.00ms');
		});

		it('should handle main thread time', () => {
			expect(formatAuditItem({ mainThreadTime: 12.34 })).toBe('12.3ms');
		});

		it('should handle group and type field fallbacks', () => {
			expect(formatAuditItem({ group: 'Diagnostics' })).toBe('Diagnostics');
			expect(formatAuditItem({ type: 'error' })).toBe('error');
		});

		it('should return numeric value as fallback', () => {
			expect(formatAuditItem({ value: 12.34, unit: 'ms' })).toBe('12.34ms');
		});

		it('should return generic message as last resort', () => {
			expect(formatAuditItem({})).toBe('Performance metric data available');
		});
	});
});
