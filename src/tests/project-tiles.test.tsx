import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '../test/test-utils';
import { ProjectTiles } from '@/components/general/tiles';

// Mock SmartImage so rendering is deterministic and fast
vi.mock('@/components/general/smartimage', () => ({
  SmartImage: (props: any) => React.createElement('img', { src: props.src, alt: props.alt, 'data-testid': 'smart-image' })
}));

describe('ProjectTiles component', () => {
  it('renders title and description', () => {
    const sample = {
      title: 'Example Project',
      description: 'Project description',
      tileCards: [
        { index: 0, cardIndex: 0, cardLength: 2, image: 'img1.jpg', imageAlt: 'One' },
        { index: 1, cardIndex: 1, cardLength: 2, image: 'img2.jpg', imageAlt: 'Two' }
      ]
    };

    const { container } = render(<ProjectTiles {...sample} /> as any);
    expect(container.querySelector('h3')?.textContent).toBe('Example Project');
    expect(container.querySelector('p')?.textContent).toBe('Project description');
  });

  it('renders Tiles grid with provided cards', () => {
    const sample = {
      title: 'Example Project',
      description: 'Project description',
      tileCards: [
        { index: 0, cardIndex: 0, cardLength: 2, image: 'img1.jpg', imageAlt: 'One' },
        { index: 1, cardIndex: 1, cardLength: 2, image: 'img2.jpg', imageAlt: 'Two' }
      ]
    };

    const { container } = render(<ProjectTiles {...sample} /> as any);
    const tiles = container.querySelectorAll('.tile');
    expect(tiles.length).toBe(2);
  });
});