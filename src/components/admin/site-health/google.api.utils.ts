/**
 * Google API Integration Utilities
 * Shared utility functions for Google API integrations
 * These are NOT server actions - just regular utility functions
 */

export interface DateRange {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
  currentStartStr: string;
  currentEndStr: string;
  previousStartStr: string;
  previousEndStr: string;
}

/**
 * Calculate date ranges for current and previous periods
 */
export function calculateDateRanges(startDate?: string, endDate?: string): DateRange {
	const currentEndDate = endDate ? new Date(endDate) : new Date();
	const currentStartDate = startDate ? new Date(startDate) : new Date(currentEndDate.getTime() - 30 * 24 * 60 * 60 * 1000);

	// Calculate previous period (same duration before the current period)
	const periodDuration = currentEndDate.getTime() - currentStartDate.getTime();
	const previousEndDate = new Date(currentStartDate.getTime() - 24 * 60 * 60 * 1000); // One day before start
	const previousStartDate = new Date(previousEndDate.getTime() - periodDuration);

	return {
		currentStart: currentStartDate,
		currentEnd: currentEndDate,
		previousStart: previousStartDate,
		previousEnd: previousEndDate,
		currentStartStr: currentStartDate.toISOString().split('T')[0],
		currentEndStr: currentEndDate.toISOString().split('T')[0],
		previousStartStr: previousStartDate.toISOString().split('T')[0],
		previousEndStr: previousEndDate.toISOString().split('T')[0],
	};
}

/**
 * Format date for chart display
 */
export function formatChartDate(date: Date): string {
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Get cached data or null if not cached
 */
export function getCachedData(cache: any, cacheKey: string): any {
	return cache.get(cacheKey);
}

/**
 * Set cached data
 */
export function setCachedData(cache: any, cacheKey: string, data: any): void {
	cache.set(cacheKey, data);
}