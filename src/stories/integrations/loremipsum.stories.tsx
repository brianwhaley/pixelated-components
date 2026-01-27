import React from 'react';
import { LoremIpsum } from '@/components/integrations/loremipsum';

export default {
  title: 'General/LoremIpsum',
  component: LoremIpsum,
  argTypes: {
    paragraphs: { control: 'number' },
    seed: { control: 'text' }
  }
};

const Template: React.FC<React.ComponentProps<typeof LoremIpsum>> = (args) => (
  <div style={{ maxWidth: 860, margin: '0 auto' }}>
    <LoremIpsum {...args} />
  </div>
);

// Playground story: uses the real Lorem API by default and exposes a proxy control
export const Playground = {
  render: Template,
  args: { paragraphs: 3, seed: '', proxyBase: '' },
  parameters: {
    docs: {
      source: { type: 'dynamic' },
      description: {
        story: 'Fetches live Lorem Ipsum from https://lorem-api.com. If your browser blocks the request (CORS), provide a `proxyBase` (for example: `https://proxy.pixelated.tech/prod/proxy?url=`) using the controls.'
      }
    }
  }
};
