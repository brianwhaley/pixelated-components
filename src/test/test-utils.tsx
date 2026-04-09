import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';
import { PixelatedConfig } from '@/components/config/config.types';
import { mockConfig } from './config.mock';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  config?: Partial<PixelatedConfig>;
}

/**
 * Custom render function that wraps components in the necessary providers.
 * Defaults to using the mock version of the global pixelated.config.json.
 */
function renderWithProviders(
	ui: ReactElement,
	{
		config = {},
		...renderOptions
	}: ExtendedRenderOptions = {}
) {
	const mergedConfig = { ...mockConfig, ...config };

	function Wrapper({ children }: { children: React.ReactNode }) {
		return (
			<PixelatedClientConfigProvider config={mergedConfig}>
				{children}
			</PixelatedClientConfigProvider>
		);
	}

	return {
		...render(ui, { wrapper: Wrapper, ...renderOptions }),
		config: mergedConfig,
	};
}

// Re-export everything from RTL
export * from '@testing-library/react';

// Override the default render with our custom one
export { renderWithProviders as render };
export { renderWithProviders };
