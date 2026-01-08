"use client";

import React from 'react';
import type { PixelatedConfig } from './config.types';

const PixelatedConfigContext = React.createContext<PixelatedConfig | null>(null);

export const PixelatedClientConfigProvider = ({
	config,
	children,
}: {
  config: PixelatedConfig;
  children: React.ReactNode;
}) => {
	return <PixelatedConfigContext.Provider value={config}>{children}</PixelatedConfigContext.Provider>;
};

/**
 * Hook to get the Pixelated config. This throws in development when the provider is missing to
 * make misconfiguration obvious. If you prefer a non-throwing variant use `useOptionalPixelatedConfig`.
 */
export const usePixelatedConfig = (): PixelatedConfig | null => {
	const ctx = React.useContext(PixelatedConfigContext);
	if (!ctx) {
		// Get calling function name from stack trace
		let caller = 'unknown component';
		try {
			const error = new Error();
			const stack = error.stack?.split('\n')[2]; // Get the caller line
			if (stack) {
				const match = stack.match(/at\s+([^\s(]+)/);
				if (match && match[1]) {
					caller = match[1].replace(/^use/, '').toLowerCase(); // Remove 'use' prefix and lowercase
				}
			}
		} catch {
			// Ignore errors in stack parsing
		}

		// Log warning when provider is missing but continue gracefully
		console.warn(`PixelatedClientConfigProvider not found when called by ${caller}. Some components may not work as expected. Wrap your app with PixelatedClientConfigProvider for full functionality.`);
		return null;
	}
	// Also return null if config is empty (no environment config loaded)
	if (Object.keys(ctx).length === 0) {
		console.warn('Pixelated config is empty. Check that src/app/config/pixelated.config.json is available.');
		return null;
	}
	return ctx;
};
