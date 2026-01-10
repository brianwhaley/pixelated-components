/**
 * Utility functions for API routes
 */

/**
 * Creates a standardized error response for API routes
 */
export function createErrorResponse(siteName: string, errorMessage: string) {
	return {
		success: false,
		siteName,
		error: errorMessage,
		timestamp: new Date().toISOString()
	};
}