// Shared utilities for site-health components
// This file contains common functions used across multiple site-health components

import { getScoreIndicator } from './site-health-indicators';

/**
 * Gets the icon for a score
 */
export function getAuditScoreIcon(score: number | null): string {
	return getScoreIndicator(score).icon;
}

/**
 * Gets the color for a score
 */
export function getScoreColor(score: number | null): string {
	return getScoreIndicator(score).color;
}

/**
 * Formats a score for display
 */
export function formatScore(score: number | null): string {
	if (score === null) return 'N/A';
	return `${Math.round(score * 100)}%`;
}

/**
 * Formats audit item details for display
 */
export function formatAuditItem(item: Record<string, unknown> | number, auditTitle?: string): string {
	// Handle raw timing data that might be passed directly
	if (typeof item === 'number') {
		let context = '';
		if (auditTitle) {
			if (auditTitle.toLowerCase().includes('server') || auditTitle.toLowerCase().includes('backend')) {
				context = ' server response';
			} else if (auditTitle.toLowerCase().includes('network') || auditTitle.toLowerCase().includes('request')) {
				context = ' network request';
			} else if (auditTitle.toLowerCase().includes('render') || auditTitle.toLowerCase().includes('blocking')) {
				context = ' render blocking';
			} else if (auditTitle.toLowerCase().includes('javascript') || auditTitle.toLowerCase().includes('js')) {
				context = ' JavaScript';
			} else if (auditTitle.toLowerCase().includes('image') || auditTitle.toLowerCase().includes('media')) {
				context = ' media resource';
			}
		}
		return `${(item as number).toFixed(2)}ms${context}`;
	}

	// Handle URLs
	if (item.url && typeof item.url === 'string') {
		return item.url;
	}

	// Handle sources (like JavaScript files)
	if (item.source && typeof item.source === 'string') {
		return item.source;
	}

	// Handle text descriptions
	if (item.text && typeof item.text === 'string') {
		return item.text;
	}

	// Handle entities (like "Google Tag Manager")
	if (item.entity && typeof item.entity === 'string') {
		return item.entity;
	}

	// Handle nodes with selectors
	if (item.node && typeof item.node === 'object' && 'selector' in (item.node as any)) {
		return `Element: ${(item.node as { selector: string }).selector}`;
	}

	// Handle nodes with snippets
	if (item.node && typeof item.node === 'object' && 'snippet' in (item.node as any)) {
		const snippet = (item.node as { snippet: string }).snippet;
		return `Element: ${snippet.length > 50 ? snippet.substring(0, 50) + '...' : snippet}`;
	}

	// Handle origins (like domains)
	if (item.origin && typeof item.origin === 'string') {
		return item.origin;
	}

	// Handle labels
	if (item.label && typeof item.label === 'string') {
		return item.label;
	}

	// Handle numeric values with units
	if (item.value && typeof item.value === 'object' && 'type' in (item.value as any) && (item.value as { type: string }).type === 'numeric') {
		const value = item.value as unknown as { value: number; granularity?: number };
		return `${value.value}${(item as any).unit || ''}`;
	}

	// Handle statistics
	if (item.statistic && typeof item.statistic === 'string' && item.value) {
		if (typeof item.value === 'object' && 'type' in (item.value as any) && (item.value as { type: string }).type === 'numeric') {
			const value = item.value as unknown as { value: number };
			return `${item.statistic}: ${value.value}`;
		}
		return item.statistic;
	}

	// Handle timing data with audit context
	if (typeof item === 'number') {
		let context = '';
		if (auditTitle) {
			if (auditTitle.toLowerCase().includes('server') || auditTitle.toLowerCase().includes('backend')) {
				context = ' server response';
			} else if (auditTitle.toLowerCase().includes('network') || auditTitle.toLowerCase().includes('request')) {
				context = ' network request';
			} else if (auditTitle.toLowerCase().includes('render') || auditTitle.toLowerCase().includes('blocking')) {
				context = ' render blocking';
			} else if (auditTitle.toLowerCase().includes('javascript') || auditTitle.toLowerCase().includes('js')) {
				context = ' JavaScript';
			} else if (auditTitle.toLowerCase().includes('image') || auditTitle.toLowerCase().includes('media')) {
				context = ' media resource';
			}
		}
		return `${(item as number).toFixed(2)}ms${context}`;
	}

	if (item.value && typeof item.value === 'number') {
		const unit = (item as any).unit || 'ms';
		let context = '';
		if (auditTitle && unit === 'ms') {
			if (auditTitle.toLowerCase().includes('server')) {
				context = ' server time';
			} else if (auditTitle.toLowerCase().includes('network')) {
				context = ' network time';
			}
		}
		return `${item.value.toFixed(2)}${unit}${context}`;
	}

	// Handle timing data with more context
	if (item.duration && typeof item.duration === 'number') {
		const duration = item.duration;
		let context = '';
		if (item.url && typeof item.url === 'string') {
			context = ` for ${item.url}`;
		} else if (item.source && typeof item.source === 'string') {
			context = ` for ${item.source}`;
		} else if (item.name && typeof item.name === 'string') {
			context = ` for ${item.name}`;
		} else if (item.path && typeof item.path === 'string') {
			context = ` for ${item.path}`;
		} else if (item.request && typeof item.request === 'string') {
			context = ` for ${item.request}`;
		}
		return `${duration.toFixed(2)}ms${context}`;
	}

	// Handle response times
	if (item.responseTime && typeof item.responseTime === 'number') {
		const url = (item.url && typeof item.url === 'string') ? ` (${item.url})` : '';
		return `${item.responseTime.toFixed(2)}ms response time${url}`;
	}

	// Handle start/end times
	if ((item.startTime || item.endTime) && typeof (item.startTime || item.endTime) === 'number') {
		const start = item.startTime && typeof item.startTime === 'number' ? item.startTime.toFixed(2) : '?';
		const end = item.endTime && typeof item.endTime === 'number' ? item.endTime.toFixed(2) : '?';
		const url = (item.url && typeof item.url === 'string') ? ` for ${item.url}` : '';
		return `${start}ms - ${end}ms${url}`;
	}

	// Handle transfer size with timing
	if (item.transferSize && typeof item.transferSize === 'number' && item.duration && typeof item.duration === 'number') {
		const size = (item.transferSize / 1024).toFixed(1);
		const time = item.duration.toFixed(2);
		const url = (item.url && typeof item.url === 'string') ? ` (${item.url})` : '';
		return `${size} KB in ${time}ms${url}`;
	}

	// Handle main thread time
	if (item.mainThreadTime && typeof item.mainThreadTime === 'number') {
		return `${item.mainThreadTime.toFixed(1)}ms`;
	}

	// For other objects, try to find a meaningful display
	if (item.group && typeof item.group === 'string') {
		return item.group;
	}

	if (item.type && typeof item.type === 'string') {
		return item.type;
	}

	// If we can't find anything meaningful, provide a generic description
	// This handles raw timing data that might be from various performance metrics
	if (typeof item === 'number') {
		return `${(item as number).toFixed(2)}ms`;
	}

	if (item.value && typeof item.value === 'number') {
		const unit = (item as any).unit || 'ms';
		return `${item.value.toFixed(2)}${unit}`;
	}

	return 'Performance metric data available';
}
