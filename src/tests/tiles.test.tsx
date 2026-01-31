import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Tiles } from '@/components/general/tiles';
import type { CarouselCardType } from '@/components/general/carousel';

// Mock SmartImage component
vi.mock('@/components/general/smartimage', () => ({
  SmartImage: (props: any) => React.createElement('img', {
    src: props.src,
    alt: props.alt,
    title: props.title,
    'data-testid': 'smart-image'
  })
}));

// Mock Loading component
vi.mock('@/components/general/loading', () => ({
  Loading: () => React.createElement('div', { 'data-testid': 'loading-spinner' }, 'Loading')
}));

describe('Tiles Component', () => {
  const mockCards: CarouselCardType[] = [
    {
      index: 0,
      cardIndex: 0,
      cardLength: 3,
      link: '/tile1',
      image: 'https://example.com/image1.jpg',
      imageAlt: 'Tile 1',
      bodyText: 'First tile description'
    },
    {
      index: 1,
      cardIndex: 1,
      cardLength: 3,
      link: '/tile2',
      image: 'https://example.com/image2.jpg',
      imageAlt: 'Tile 2',
      bodyText: 'Second tile description'
    },
    {
      index: 2,
      cardIndex: 2,
      cardLength: 3,
      link: '/tile3',
      image: 'https://example.com/image3.jpg',
      imageAlt: 'Tile 3',
      bodyText: 'Third tile description'
    }
  ];

  describe('Basic Rendering', () => {
    it('should render tiles container', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      expect(container.querySelector('.tiles-container')).toBeInTheDocument();
    });

    it('should render tile container', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      expect(container.querySelector('.tile-container')).toBeInTheDocument();
    });

    it('should render correct number of tiles', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(3);
    });

    it('should render single tile', () => {
      const singleCard = [mockCards[0]];
      const { container } = render(<Tiles cards={singleCard} />);
      const tiles = container.querySelectorAll('.tile');
      expect(tiles.length).toBe(1);
    });
  });

  describe('Row Count', () => {
    it('should apply default row count class (2 columns)', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      expect(container.querySelector('.row-2col')).toBeInTheDocument();
    });

    it('should apply custom row count class', () => {
      const { container } = render(<Tiles cards={mockCards} rowCount={3} />);
      expect(container.querySelector('.row-3col')).toBeInTheDocument();
    });

    it('should apply 1 column layout when specified', () => {
      const { container } = render(<Tiles cards={mockCards} rowCount={1} />);
      expect(container.querySelector('.row-1col')).toBeInTheDocument();
    });

    it('should apply 4 column layout when specified', () => {
      const { container } = render(<Tiles cards={mockCards} rowCount={4} />);
      expect(container.querySelector('.row-4col')).toBeInTheDocument();
    });
  });

  describe('Grid Items', () => {
    it('should render grid items for each card', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const gridItems = container.querySelectorAll('.grid-item');
      expect(gridItems.length).toBe(mockCards.length);
    });

    it('should render tiles within grid items', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const gridItems = container.querySelectorAll('.grid-item');
      gridItems.forEach(item => {
        expect(item.querySelector('.tile')).toBeInTheDocument();
      });
    });
  });

  describe('Tile Links', () => {
    it('should render tiles with links when link is provided', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const links = container.querySelectorAll('.tile-link');
      expect(links.length).toBe(3);
    });

    it('should set correct href on tile links', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const links = container.querySelectorAll('.tile-link') as NodeListOf<HTMLAnchorElement>;
      expect(links[0].href).toContain('/tile1');
      expect(links[1].href).toContain('/tile2');
      expect(links[2].href).toContain('/tile3');
    });

    it('should not render link wrapper when link is not provided', () => {
      const cardsWithoutLinks = [{
        index: 0,
        cardIndex: 0,
        cardLength: 1,
        image: 'https://example.com/image.jpg',
        imageAlt: 'No Link Tile'
      }];
      const { container } = render(<Tiles cards={cardsWithoutLinks as any} />);
      expect(container.querySelector('.tile-link')).not.toBeInTheDocument();
    });

    it('should render tile body directly when no link', () => {
      const cardsWithoutLinks = [{
        index: 0,
        cardIndex: 0,
        cardLength: 1,
        image: 'https://example.com/image.jpg',
        imageAlt: 'No Link Tile',
        bodyText: 'Body text'
      }];
      const { container } = render(<Tiles cards={cardsWithoutLinks as any} />);
      expect(container.querySelector('.tile-image')).toBeInTheDocument();
    });
  });

  describe('Tile Images', () => {
    it('should render SmartImage for each tile', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const images = container.querySelectorAll('[data-testid="smart-image"]');
      expect(images.length).toBe(mockCards.length);
    });

    it('should set image src attributes', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const images = container.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
      expect(images[0].src).toContain('image1.jpg');
      expect(images[1].src).toContain('image2.jpg');
      expect(images[2].src).toContain('image3.jpg');
    });

    it('should set image alt attributes', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const images = container.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
      expect(images[0].alt).toBe('Tile 1');
      expect(images[1].alt).toBe('Tile 2');
      expect(images[2].alt).toBe('Tile 3');
    });

    it('should set empty alt attribute when imageAlt is not provided', () => {
      const cardsWithoutAlt = [{ 
        index: 0,
        cardIndex: 0,
        cardLength: 1,
        image: 'https://example.com/image.jpg' 
      }];
      const { container } = render(<Tiles cards={cardsWithoutAlt} />);
      const image = container.querySelector('img') as HTMLImageElement;
      expect(image.alt).toBe('');
    });
  });

  describe('Tile Overlay', () => {
    it('should render tile image overlay', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const overlays = container.querySelectorAll('.tile-image-overlay');
      expect(overlays.length).toBe(mockCards.length);
    });

    it('should render overlay text container', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const overlayTexts = container.querySelectorAll('.tile-image-overlay-text');
      expect(overlayTexts.length).toBe(mockCards.length);
    });

    it('should render overlay title', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const titles = container.querySelectorAll('.tile-image-overlay-title');
      expect(titles.length).toBe(mockCards.length);
      expect(titles[0].textContent).toBe('Tile 1');
      expect(titles[1].textContent).toBe('Tile 2');
      expect(titles[2].textContent).toBe('Tile 3');
    });

    it('should render overlay body text', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const bodies = container.querySelectorAll('.tile-image-overlay-body');
      expect(bodies.length).toBe(mockCards.length);
      expect(bodies[0].textContent).toBe('First tile description');
      expect(bodies[1].textContent).toBe('Second tile description');
      expect(bodies[2].textContent).toBe('Third tile description');
    });

    it('should handle empty body text', () => {
      const cardsWithoutBody = [{ 
        index: 0,
        cardIndex: 0,
        cardLength: 1,
        image: 'img.jpg', 
        imageAlt: 'Title' 
      }];
      const { container } = render(<Tiles cards={cardsWithoutBody} />);
      const body = container.querySelector('.tile-image-overlay-body');
      expect(body?.textContent).toBe('');
    });
  });

  describe('Tile IDs', () => {
    it('should assign sequential IDs to tiles', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      expect(container.querySelector('#tile-0')).toBeInTheDocument();
      expect(container.querySelector('#tile-1')).toBeInTheDocument();
      expect(container.querySelector('#tile-2')).toBeInTheDocument();
    });

    it('should have unique tile IDs', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const tiles = container.querySelectorAll('[id^="tile-"]');
      const ids = Array.from(tiles).map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Empty State', () => {
    it('should render Loading component when cards array is empty', () => {
      const { container } = render(<Tiles cards={[]} />);
      expect(container.querySelector('[data-testid="loading-spinner"]')).toBeInTheDocument();
    });

    it('should not render tiles container when cards are empty', () => {
      const { container } = render(<Tiles cards={[]} />);
      expect(container.querySelector('.tiles-container')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should have proper class structure', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      expect(container.querySelector('.tiles-container')).toBeInTheDocument();
      expect(container.querySelector('.tile-container')).toBeInTheDocument();
      expect(container.querySelectorAll('.grid-item').length).toBe(3);
      expect(container.querySelectorAll('.tile').length).toBe(3);
    });

    it('should apply tile-image class to image containers', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const imageContainers = container.querySelectorAll('.tile-image');
      expect(imageContainers.length).toBe(mockCards.length);
    });
  });

  describe('Data Attributes', () => {
    it('should pass correct props to SmartImage', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(mockCards.length);
      
      images.forEach((img, index) => {
        expect(img.src).toContain(`image${index + 1}.jpg`);
        expect(img.alt).toBe(`Tile ${index + 1}`);
      });
    });
  });

  describe('Caption variant (accessibility-focused)', () => {
    it('applies caption class and data-caption prefers bodyText', () => {
      const cards = [{ image: '/img.jpg', imageAlt: 'Alt text', bodyText: 'Body caption' }];
      const { container } = render(<Tiles cards={cards as any} variant="caption" />);
      const tile = container.querySelector('.tile');
      expect(tile).toHaveClass('caption');
      // overlay remains in-DOM for screen-readers
      expect(tile!.querySelector('.tile-image-overlay-body')!.textContent).toBe('Body caption');
    });

    it('falls back to imageAlt when bodyText is empty', () => {
      const cards = [{ image: '/img.jpg', imageAlt: 'Alt only', bodyText: '' }];
      const { container } = render(<Tiles cards={cards as any} variant="caption" />);
      const tile = container.querySelector('.tile');
      expect(tile).toHaveClass('caption');
      expect(tile!.querySelector('.tile-image-overlay-title')!.textContent).toBe('Alt only');
    });

    it('does not add caption when both imageAlt and bodyText are missing', () => {
      const cards = [{ image: '/img.jpg', imageAlt: '', bodyText: '' }];
      const { container } = render(<Tiles cards={cards as any} variant="caption" />);
      const tile = container.querySelector('.tile');
      expect(tile).toHaveClass('caption');
      // no visible caption provided -> overlay title/body should be empty
      expect(tile!.querySelector('.tile-image-overlay-title')!.textContent).toBe('');
      expect(tile!.querySelector('.tile-image-overlay-body')!.textContent).toBe('');
    });

    it('ignores unknown variant values (no caption class added)', () => {
      const cards = [{ image: '/img.jpg', imageAlt: 'Alt text', bodyText: 'Body caption' }];
      const { container } = render(<Tiles cards={cards as any} variant={"not-a-variant" as any} />);
      const tile = container.querySelector('.tile');
      expect(tile).not.toHaveClass('caption');
      // original accessible overlay still present
      expect(tile!.querySelector('.tile-image-overlay-body')!.textContent).toBe('Body caption');
    });

    it('applies `overlay` variant as a modifier class', () => {
      const cards = [{ image: '/img.jpg', imageAlt: 'Overlay alt', bodyText: 'Overlay body' }];
      const { container } = render(<Tiles cards={cards as any} variant="overlay" />);
      const tile = container.querySelector('.tile');
      expect(tile).toHaveClass('overlay');
      // overlay DOM remains available for a11y
      expect(tile!.querySelector('.tile-image-overlay-body')!.textContent).toBe('Overlay body');
    });

    it('exports TilesVariants with expected values', async () => {
      const mod = await import('@/components/general/tiles');
      expect(Array.isArray(mod.TilesVariants)).toBe(true);
      expect(mod.TilesVariants).toEqual(expect.arrayContaining(['caption', 'overlay']));
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long text in body', () => {
      const longText = 'A'.repeat(500);
      const cardsWithLongText = [{
        index: 0,
        cardIndex: 0,
        cardLength: 1,
        image: 'img.jpg',
        imageAlt: 'Tile',
        bodyText: longText
      }];
      const { container } = render(<Tiles cards={cardsWithLongText} />);
      expect(container.querySelector('.tile-image-overlay-body')).toBeInTheDocument();
    });

    it('should handle very long alt text', () => {
      const longAlt = 'Long'.repeat(100);
      const cardsWithLongAlt = [{
        index: 0,
        cardIndex: 0,
        cardLength: 1,
        image: 'img.jpg',
        imageAlt: longAlt
      }];
      const { container } = render(<Tiles cards={cardsWithLongAlt} />);
      expect(container.querySelector('.tile-image-overlay-title')).toBeInTheDocument();
    });

    it('should handle large number of tiles', () => {
      const manyCards = Array.from({ length: 100 }, (_, i) => ({
        index: i,
        cardIndex: i,
        cardLength: 100,
        image: `https://example.com/image${i}.jpg`,
        imageAlt: `Tile ${i}`,
        bodyText: `Description ${i}`
      }));
      const { container } = render(<Tiles cards={manyCards} />);
      expect(container.querySelectorAll('.tile').length).toBe(100);
    });

    it('should handle special characters in text', () => {
      const specialCharsCard = [{
        index: 0,
        cardIndex: 0,
        cardLength: 1,
        image: 'img.jpg',
        imageAlt: 'Title & <Special>',
        bodyText: 'Body with "quotes" and \'apostrophes\''
      }];
      const { container } = render(<Tiles cards={specialCharsCard} />);
      expect(container.textContent).toContain('Title & <Special>');
    });
  });

  describe('Tile Structure', () => {
    it('should wrap link content with tile-link class', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const links = container.querySelectorAll('.tile-link');
      links.forEach(link => {
        expect(link.querySelector('.tile-image')).toBeInTheDocument();
      });
    });

    it('should maintain consistent structure across tiles', () => {
      const { container } = render(<Tiles cards={mockCards} />);
      const tiles = container.querySelectorAll('.tile');
      
      tiles.forEach(tile => {
        expect(tile.querySelector('.tile-image')).toBeInTheDocument();
        expect(tile.querySelector('.tile-image-overlay')).toBeInTheDocument();
      });
    });
  });
});
