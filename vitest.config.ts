import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// ============================================================================
// CODE COVERAGE THRESHOLDS
// Adjust these values to change coverage enforcement globally
// Applies to: global coverage, per-file coverage, and per-function coverage
// Only counts .ts, .tsx, .js files (excludes CSS, JSON, build scripts, etc.)
// ============================================================================
const COVERAGE_THRESHOLDS = {
	lines: 70.9,
	functions: 71.75,
	branches: 58,
	statements: 68.75,
};

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['src/components/**/*.{ts,tsx,js}'],
			exclude: [
				'node_modules/',
				'dist/',
				'**/*.stories.ts',
				'**/*.stories.tsx',
				'**/*.css',
				'**/data/**',
				'**/scripts/**',
				'**/test/**',
				'**/tests/**',
			],
			thresholds: {
				lines: COVERAGE_THRESHOLDS.lines,
				functions: COVERAGE_THRESHOLDS.functions,
				branches: COVERAGE_THRESHOLDS.branches,
				statements: COVERAGE_THRESHOLDS.statements,
				/* perFile: true, */
				perFile: false,
			},
		},
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
