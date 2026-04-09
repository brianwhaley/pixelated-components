import { PixelatedConfig } from '@/components/config/config.types';
import configJson from '@/config/pixelated.config.json';

/**
 * Standard mock configuration derived from the main pixelated.config.json.
 * Used as the default configuration for renderWithProviders in tests.
 */
export const mockConfig: PixelatedConfig = configJson as PixelatedConfig;

/**
 * Helper to create a partial configuration override for specific test cases.
 */
export const createMockConfig = (overrides: Partial<PixelatedConfig>): PixelatedConfig => ({
	...mockConfig,
	...overrides,
});
