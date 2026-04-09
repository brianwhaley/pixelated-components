/** @type { import('@storybook/react-webpack5').Preview } */

import '../../components/admin/site-health/site-health.css';

const preview = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Admin components for site management and monitoring.'
      }
    }
  }
};

export default preview;