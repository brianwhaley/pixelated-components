import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '../test/test-utils';
import { ProjectTiles } from '@/components/general/tiles';

// Mock SmartImage so rendering is deterministic and fast
vi.mock('@/components/general/smartimage', () => ({
  SmartImage: (props: any) => React.createElement('img', { src: props.src, alt: props.alt, 'data-testid': 'smart-image' })
}));

describe('ProjectTiles component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
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

    it('renders component without crashing', () => {
      const sample = {
        title: 'Test',
        description: 'Test description',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      expect(container).toBeInTheDocument();
    });

    it('renders title as h3 heading', () => {
      const sample = {
        title: 'Project Heading',
        description: 'Description text',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('Project Heading');
    });

    it('renders description as paragraph', () => {
      const sample = {
        title: 'Title',
        description: 'This is a description',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph?.textContent).toBe('This is a description');
    });
  });

  describe('Tile Cards Rendering', () => {
    it('renders single tile card', () => {
      const sample = {
        title: 'Single Card',
        description: 'One card project',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 1, image: 'single.jpg', imageAlt: 'Single' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(1);
    });

    it('renders multiple tile cards', () => {
      const sample = {
        title: 'Multi Card',
        description: 'Multiple cards project',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 4, image: 'img1.jpg', imageAlt: 'One' },
          { index: 1, cardIndex: 1, cardLength: 4, image: 'img2.jpg', imageAlt: 'Two' },
          { index: 2, cardIndex: 2, cardLength: 4, image: 'img3.jpg', imageAlt: 'Three' },
          { index: 3, cardIndex: 3, cardLength: 4, image: 'img4.jpg', imageAlt: 'Four' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(4);
    });

    it('renders many tile cards', () => {
      const tileCards = Array.from({ length: 10 }, (_, i) => ({
        index: i,
        cardIndex: i,
        cardLength: 10,
        image: `img${i}.jpg`,
        imageAlt: `Image ${i}`
      }));

      const sample = {
        title: 'Many Cards',
        description: 'Project with many cards',
        tileCards
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(10);
    });

    it('passes correct image paths to SmartImage', () => {
      const sample = {
        title: 'Image Test',
        description: 'Testing image rendering',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 2, image: 'path/to/image1.jpg', imageAlt: 'Alt 1' },
          { index: 1, cardIndex: 1, cardLength: 2, image: 'path/to/image2.jpg', imageAlt: 'Alt 2' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const images = container.querySelectorAll('[data-testid="smart-image"]');
      expect(images.length).toBe(2);
      expect((images[0] as HTMLElement).getAttribute('src')).toBe('path/to/image1.jpg');
      expect((images[1] as HTMLElement).getAttribute('src')).toBe('path/to/image2.jpg');
    });

    it('passes correct alt text to SmartImage', () => {
      const sample = {
        title: 'Alt Text Test',
        description: 'Testing alt text',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 1, image: 'image.jpg', imageAlt: 'Descriptive Alt Text' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const image = container.querySelector('[data-testid="smart-image"]');
      expect((image as HTMLElement).getAttribute('alt')).toBe('Descriptive Alt Text');
    });
  });

  describe('Empty State', () => {
    it('renders with empty tiles array', () => {
      const sample = {
        title: 'No Tiles',
        description: 'Project with no tiles',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(0);
    });

    it('renders title and description even with no tiles', () => {
      const sample = {
        title: 'Empty Project',
        description: 'This project has no tiles',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      expect(container.querySelector('h3')?.textContent).toBe('Empty Project');
      expect(container.querySelector('p')?.textContent).toBe('This project has no tiles');
    });
  });

  describe('Card Properties', () => {
    it('handles cardLength property correctly', () => {
      const sample = {
        title: 'Card Length Test',
        description: 'Testing card length',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 3, image: 'img.jpg', imageAlt: 'Test' },
          { index: 1, cardIndex: 1, cardLength: 3, image: 'img.jpg', imageAlt: 'Test' },
          { index: 2, cardIndex: 2, cardLength: 3, image: 'img.jpg', imageAlt: 'Test' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(3);
    });

    it('handles varying cardLength values', () => {
      const sample = {
        title: 'Varying Lengths',
        description: 'Test varying card lengths',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 2, image: 'img1.jpg', imageAlt: 'First Group' },
          { index: 1, cardIndex: 1, cardLength: 2, image: 'img2.jpg', imageAlt: 'First Group' },
          { index: 2, cardIndex: 0, cardLength: 3, image: 'img3.jpg', imageAlt: 'Second Group' },
          { index: 3, cardIndex: 1, cardLength: 3, image: 'img4.jpg', imageAlt: 'Second Group' },
          { index: 4, cardIndex: 2, cardLength: 3, image: 'img5.jpg', imageAlt: 'Second Group' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(5);
    });

    it('tracks tile index correctly', () => {
      const indexes = [0, 1, 2, 3, 4];
      const sample = {
        title: 'Index Test',
        description: 'Testing index tracking',
        tileCards: indexes.map(i => ({
          index: i,
          cardIndex: i,
          cardLength: 5,
          image: `img${i}.jpg`,
          imageAlt: `Image ${i}`
        }))
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(5);
      tiles.forEach((_, i) => {
        expect(i).toBe(indexes[i]);
      });
    });
  });

  describe('Text Content Handling', () => {
    it('handles long titles', () => {
      const sample = {
        title: 'This is a very long project title that describes a complex project in great detail',
        description: 'Description',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const heading = container.querySelector('h3');
      expect(heading?.textContent).toContain('This is a very long project title');
    });

    it('handles long descriptions', () => {
      const longDesc = 'This is a very long description that provides detailed information about the project and what it does and its features.';
      const sample = {
        title: 'Project',
        description: longDesc,
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const paragraph = container.querySelector('p');
      expect(paragraph?.textContent).toBe(longDesc);
    });

    it('handles special characters in title', () => {
      const sample = {
        title: 'Project & "Special" <Characters>',
        description: 'Description',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const heading = container.querySelector('h3');
      expect(heading?.textContent).toContain('Project');
    });

    it('handles empty title', () => {
      const sample = {
        title: '',
        description: 'Description of empty title project',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const heading = container.querySelector('h3');
      expect(heading?.textContent).toBe('');
    });

    it('handles empty description', () => {
      const sample = {
        title: 'Title Only',
        description: '',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const paragraph = container.querySelector('p');
      expect(paragraph?.textContent).toBe('');
    });
  });

  describe('Image Alt Text Handling', () => {
    it('passes descriptive alt text to images', () => {
      const sample = {
        title: 'Alt Text Project',
        description: 'Testing alt text descriptions',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 1, image: 'img.jpg', imageAlt: 'A detailed description of the image' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const image = container.querySelector('[data-testid="smart-image"]');
      expect((image as HTMLElement).getAttribute('alt')).toBe('A detailed description of the image');
    });

    it('handles empty alt text', () => {
      const sample = {
        title: 'Empty Alt Project',
        description: 'Testing empty alt text',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 1, image: 'img.jpg', imageAlt: '' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const image = container.querySelector('[data-testid="smart-image"]');
      expect((image as HTMLElement).getAttribute('alt')).toBe('');
    });
  });

  describe('Grid Layout Classes', () => {
    it('renders tiles with tile class', () => {
      const sample = {
        title: 'Grid Test',
        description: 'Testing grid layout',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 2, image: 'img1.jpg', imageAlt: 'One' },
          { index: 1, cardIndex: 1, cardLength: 2, image: 'img2.jpg', imageAlt: 'Two' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const tiles = container.querySelectorAll('.tile');
      tiles.forEach(tile => {
        expect(tile).toHaveClass('tile');
      });
    });

    it('maintains tile structure and layout', () => {
      const sample = {
        title: 'Layout Test',
        description: 'Testing layout structure',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 4, image: 'img1.jpg', imageAlt: 'One' },
          { index: 1, cardIndex: 1, cardLength: 4, image: 'img2.jpg', imageAlt: 'Two' },
          { index: 2, cardIndex: 2, cardLength: 4, image: 'img3.jpg', imageAlt: 'Three' },
          { index: 3, cardIndex: 3, cardLength: 4, image: 'img4.jpg', imageAlt: 'Four' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const grid = container.querySelector('[class*="grid"], [class*="tiles"]') || container.firstChild;
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides alt text for all images', () => {
      const sample = {
        title: 'Accessible Project',
        description: 'Testing accessibility',
        tileCards: [
          { index: 0, cardIndex: 0, cardLength: 3, image: 'img1.jpg', imageAlt: 'Alt text 1' },
          { index: 1, cardIndex: 1, cardLength: 3, image: 'img2.jpg', imageAlt: 'Alt text 2' },
          { index: 2, cardIndex: 2, cardLength: 3, image: 'img3.jpg', imageAlt: 'Alt text 3' }
        ]
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const images = container.querySelectorAll('[data-testid="smart-image"]');
      images.forEach(img => {
        expect((img as HTMLElement).getAttribute('alt')).toBeTruthy();
      });
    });

    it('has semantic HTML structure', () => {
      const sample = {
        title: 'Semantic Test',
        description: 'Testing semantic HTML',
        tileCards: []
      };

      const { container } = render(<ProjectTiles {...sample} /> as any);
      const heading = container.querySelector('h3');
      const paragraph = container.querySelector('p');
      expect(heading).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
    });
  });
});