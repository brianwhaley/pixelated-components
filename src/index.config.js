/**
 * Shared configuration exports for pixelated monorepo
 * 
 * This file exports shared build and development configurations
 * that are used across all apps and packages in the monorepo.
 */

export { default as eslintConfig } from './eslint.config.mjs';
export { default as vitestConfig } from './vitest.config.ts';
export { default as tsconfigBase } from './tsconfig.json' assert { type: 'json' };
