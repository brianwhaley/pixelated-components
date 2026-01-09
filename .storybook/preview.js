import React from 'react';
import { PixelatedClientConfigProvider } from '../src/components/config/config.client';
import { getClientOnlyPixelatedConfig } from '../src/components/config/config.utils';
import '../src/css/pixelated.global.css'; // Global form styles
import '../src/css/pixelated.grid.scss'; // Global form styles
import '../src/css/pixelated.font.scss'; // Global grid styles

let mockConfig = {};
try {
	// Import the local config file which is gitignored.
	// We use the stripper utility to ensure no secrets accidentally leak into the bundle.
	const rawConfig = require('../src/config/pixelated.config.json');
	mockConfig = getClientOnlyPixelatedConfig(rawConfig);
} catch (e) {
	console.warn('Local pixelated.config.json not found in src/config/. Storybook will use empty configuration.');
}

/** @type { import('@storybook/react-webpack5').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <PixelatedClientConfigProvider config={mockConfig}>
        <Story />
      </PixelatedClientConfigProvider>
    ),
  ],
};

export default preview;