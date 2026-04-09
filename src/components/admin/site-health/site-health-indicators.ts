// Shared constants and utilities for health card visual indicators
//
// USAGE:
// - SCORE_SCALE: For metrics with numerical scores (0-1 range like PageSpeed)
// - IMPACT_SCALE: For severity-based metrics (critical, serious, moderate, minor like axe-core)
// - getScoreIndicator(score): Returns {icon, color} for numerical scores
// - getImpactIndicator(impact): Returns {icon, color} for severity levels
// - getPassingIndicator(): Returns {icon, color} for successful/passing states
// - getIncompleteIndicator(): Returns {icon, color} for unknown/incomplete states
//
// EXAMPLE:
// import { getScoreIndicator, getImpactIndicator } from './health-indicators';
// const indicator = getScoreIndicator(0.85); // Returns {icon: '🟢', color: '#10b981'}
// const impact = getImpactIndicator('critical'); // Returns {icon: '🔴', color: '#dc2626'}
export const HEALTH_INDICATORS = {
	CRITICAL: '🔴',
	SERIOUS: '🟠',
	MODERATE: '🟡',
	MINOR: '⚪',
	PASSING: '🟢',
	UNKNOWN: '⚪'
} as const;

export const HEALTH_COLORS = {
	CRITICAL: '#dc2626', // red-600
	SERIOUS: '#ea580c',  // orange-600
	MODERATE: '#d97706', // amber-600
	MINOR: '#ca8a04',   // yellow-600
	PASSING: '#10b981',  // emerald-500
	UNKNOWN: '#6b7280'   // gray-500
} as const;

// Score-based scale (used by PageSpeed and similar metrics)
export const SCORE_SCALE = {
	EXCELLENT: { min: 0.9, icon: HEALTH_INDICATORS.PASSING, color: HEALTH_COLORS.PASSING },
	GOOD: { min: 0.7, icon: HEALTH_INDICATORS.MODERATE, color: HEALTH_COLORS.MODERATE },
	NEEDS_IMPROVEMENT: { min: 0.5, icon: HEALTH_INDICATORS.SERIOUS, color: HEALTH_COLORS.SERIOUS },
	POOR: { min: 0, icon: HEALTH_INDICATORS.CRITICAL, color: HEALTH_COLORS.CRITICAL }
} as const;

// Impact-based scale (used by axe-core and similar tools)
export const IMPACT_SCALE = {
	CRITICAL: { icon: HEALTH_INDICATORS.CRITICAL, color: HEALTH_COLORS.CRITICAL },
	SERIOUS: { icon: HEALTH_INDICATORS.SERIOUS, color: HEALTH_COLORS.SERIOUS },
	MODERATE: { icon: HEALTH_INDICATORS.MODERATE, color: HEALTH_COLORS.MODERATE },
	MINOR: { icon: HEALTH_INDICATORS.MINOR, color: HEALTH_COLORS.MINOR }
} as const;

// Utility functions
export function getScoreIndicator(score: number | null): { icon: string; color: string } {
	if (score === null) return { icon: HEALTH_INDICATORS.UNKNOWN, color: HEALTH_COLORS.UNKNOWN };

	if (score >= SCORE_SCALE.EXCELLENT.min) return SCORE_SCALE.EXCELLENT;
	if (score >= SCORE_SCALE.GOOD.min) return SCORE_SCALE.GOOD;
	if (score >= SCORE_SCALE.NEEDS_IMPROVEMENT.min) return SCORE_SCALE.NEEDS_IMPROVEMENT;
	return SCORE_SCALE.POOR;
}

export function getImpactIndicator(impact: string): { icon: string; color: string } {
	switch (impact.toLowerCase()) {
	case 'critical': return IMPACT_SCALE.CRITICAL;
	case 'serious': return IMPACT_SCALE.SERIOUS;
	case 'moderate': return IMPACT_SCALE.MODERATE;
	case 'minor': return IMPACT_SCALE.MINOR;
	default: return { icon: HEALTH_INDICATORS.UNKNOWN, color: HEALTH_COLORS.UNKNOWN };
	}
}

export function getPassingIndicator(): { icon: string; color: string } {
	return { icon: HEALTH_INDICATORS.PASSING, color: HEALTH_COLORS.PASSING };
}

export function getIncompleteIndicator(): { icon: string; color: string } {
	return { icon: HEALTH_INDICATORS.UNKNOWN, color: HEALTH_COLORS.UNKNOWN };
}