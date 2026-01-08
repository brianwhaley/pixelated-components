import '../src/css/pixelated.global.css'; // Global form styles
import '../src/css/pixelated.grid.scss'; // Global form styles
import '../src/css/pixelated.font.scss'; // Global grid styles
// Add any other global stylesheets here

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
};

export default preview;