import React from 'react';
import { Hero } from '@/components/general/hero';
import { LoremIpsum } from '@/components/integrations/loremipsum';

export default {
  title: 'General',
  component: Hero,
  argTypes: {
	img: { control: { type: 'text' } },
    variant: { control: { type: 'radio' }, options: ['static', 'anchored'] },
    height: { control: { type: 'number' } },
    paragraphs: { control: { type: 'number', min: 0, max: 50, step: 1 } }
  }
};

const Template: React.FC<any> = ({ img, height = 60, paragraphs = 15, ...args }) => {
  const heroSrc = img;
  const heroHeight = typeof height === 'number' ? `${height}vh` : height;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <Hero img={heroSrc} {...args} height={heroHeight} />

      <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
        <LoremIpsum paragraphs={Math.max(0, Math.floor(paragraphs))} />
      </div>
    </div>
  );
};

export const HeroPlayground = {
  render: Template,
  args: {
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=900&fit=crop',
    variant: 'static',
    paragraphs: 15,
    height: 60
  }
};

