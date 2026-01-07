import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from '@/components/general/timeline';
import { PixelatedClientConfigProvider } from '@/components/config/config.client';

// Mock SmartImage
vi.mock('@/components/general/smartimage', () => ({
  SmartImage: (props: any) => {
    const { src, alt, title, className } = props;
    return React.createElement('img', {
      src,
      alt,
      title,
      className,
      'data-testid': 'smart-image'
    });
  },
}));

const mockConfig = {
  cloudinary: {
    product_env: 'test-env',
    baseUrl: 'https://test.cloudinary.com',
    transforms: 'test-transforms',
  },
};

const renderWithConfig = (component: React.ReactElement, config = mockConfig) => {
  return render(
    <PixelatedClientConfigProvider config={config}>
      {component}
    </PixelatedClientConfigProvider>
  );
};

const mockTimelineData = [
  {
    title: 'First Event',
    content: 'This was the first major event in the timeline',
    image: '/images/event1.jpg',
    direction: 'left'
  },
  {
    title: 'Second Event',
    content: 'This was the second major event in the timeline',
    image: '/images/event2.jpg',
    direction: 'right'
  },
  {
    title: 'Third Event',
    content: 'This was the third major event in the timeline',
    image: '/images/event3.jpg',
    direction: 'left'
  }
];

describe('Timeline Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Timeline Rendering', () => {
    it('should render timeline container', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      expect(container.querySelector('.timeline')).toBeInTheDocument();
    });

    it('should render all timeline items', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const items = container.querySelectorAll('.timeline-container');
      expect(items.length).toBe(3);
    });

    it('should render timeline item titles', () => {
      renderWithConfig(<Timeline timelineData={mockTimelineData} />);
      expect(screen.getByText('First Event')).toBeInTheDocument();
      expect(screen.getByText('Second Event')).toBeInTheDocument();
      expect(screen.getByText('Third Event')).toBeInTheDocument();
    });

    it('should render timeline item content', () => {
      renderWithConfig(<Timeline timelineData={mockTimelineData} />);
      expect(screen.getByText('This was the first major event in the timeline')).toBeInTheDocument();
      expect(screen.getByText('This was the second major event in the timeline')).toBeInTheDocument();
      expect(screen.getByText('This was the third major event in the timeline')).toBeInTheDocument();
    });

    it('should render all timeline images', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const images = container.querySelectorAll('img[data-testid="smart-image"]');
      expect(images.length).toBe(3);
    });
  });

  describe('Timeline Direction Classes', () => {
    it('should apply correct direction class for left items', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const leftItems = container.querySelectorAll('.timeline-left');
      expect(leftItems.length).toBe(2); // First and third are left
    });

    it('should apply correct direction class for right items', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const rightItems = container.querySelectorAll('.timeline-right');
      expect(rightItems.length).toBe(1); // Second is right
    });

    it('should render alternating left-right timeline', () => {
      const alternatingData = [
        { title: 'Event 1', content: 'Content 1', image: '/img1.jpg', direction: 'left' },
        { title: 'Event 2', content: 'Content 2', image: '/img2.jpg', direction: 'right' },
        { title: 'Event 3', content: 'Content 3', image: '/img3.jpg', direction: 'left' },
        { title: 'Event 4', content: 'Content 4', image: '/img4.jpg', direction: 'right' }
      ];
      const { container } = renderWithConfig(
        <Timeline timelineData={alternatingData} />
      );
      expect(container.querySelectorAll('.timeline-left').length).toBe(2);
      expect(container.querySelectorAll('.timeline-right').length).toBe(2);
    });
  });

  describe('Timeline Image Handling', () => {
    it('should pass image source to SmartImage', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const images = container.querySelectorAll('img');
      expect(images[0]).toHaveAttribute('src', '/images/event1.jpg');
      expect(images[1]).toHaveAttribute('src', '/images/event2.jpg');
      expect(images[2]).toHaveAttribute('src', '/images/event3.jpg');
    });

    it('should use title as image alt text', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const images = container.querySelectorAll('img');
      expect(images[0]).toHaveAttribute('alt', 'First Event');
      expect(images[1]).toHaveAttribute('alt', 'Second Event');
      expect(images[2]).toHaveAttribute('alt', 'Third Event');
    });

    it('should set image title to match item title', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const images = container.querySelectorAll('img');
      expect(images[0]).toHaveAttribute('title', 'First Event');
      expect(images[1]).toHaveAttribute('title', 'Second Event');
      expect(images[2]).toHaveAttribute('title', 'Third Event');
    });

    it('should handle timeline with no images', () => {
      const noImageData = [
        { title: 'Event 1', content: 'Content 1', image: '', direction: 'left' },
        { title: 'Event 2', content: 'Content 2', image: undefined, direction: 'right' }
      ];
      const { container } = renderWithConfig(
        <Timeline timelineData={noImageData} />
      );
      expect(container.querySelectorAll('img').length).toBe(2);
    });
  });

  describe('Timeline Content Structure', () => {
    it('should wrap content in timeline-content div', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const contents = container.querySelectorAll('.timeline-content');
      expect(contents.length).toBe(3);
    });

    it('should have row-3col grid structure', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const grids = container.querySelectorAll('.row-3col');
      expect(grids.length).toBe(3);
    });

    it('should have image in grid-s1-e2 section', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const imageGrids = container.querySelectorAll('.grid-s1-e2 img');
      expect(imageGrids.length).toBe(3);
    });

    it('should have content in grid-s2-e4 section', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const contentGrids = container.querySelectorAll('.grid-s2-e4');
      expect(contentGrids.length).toBe(3);
    });

    it('should have h2 header in content section', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const headers = container.querySelectorAll('.grid-s2-e4 h2');
      expect(headers.length).toBe(3);
      expect(headers[0].textContent).toBe('First Event');
      expect(headers[1].textContent).toBe('Second Event');
      expect(headers[2].textContent).toBe('Third Event');
    });

    it('should have paragraph for content text', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const paragraphs = container.querySelectorAll('.grid-s2-e4 p');
      expect(paragraphs.length).toBe(3);
      expect(paragraphs[0].textContent).toBe('This was the first major event in the timeline');
      expect(paragraphs[1].textContent).toBe('This was the second major event in the timeline');
      expect(paragraphs[2].textContent).toBe('This was the third major event in the timeline');
    });
  });

  describe('Timeline Edge Cases', () => {
    it('should handle empty timeline data', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={[]} />
      );
      expect(container.querySelector('.timeline')).toBeInTheDocument();
      expect(container.querySelectorAll('.timeline-container').length).toBe(0);
    });

    it('should handle single timeline item', () => {
      const singleData = [
        { title: 'Only Event', content: 'Just one event', image: '/img.jpg', direction: 'left' }
      ];
      const { container } = renderWithConfig(
        <Timeline timelineData={singleData} />
      );
      expect(container.querySelectorAll('.timeline-container').length).toBe(1);
    });

    it('should handle null items in array', () => {
      const dataWithNull = [
        { title: 'Event 1', content: 'Content 1', image: '/img1.jpg', direction: 'left' },
        null as any,
        { title: 'Event 2', content: 'Content 2', image: '/img2.jpg', direction: 'right' }
      ];
      const { container } = renderWithConfig(
        <Timeline timelineData={dataWithNull} />
      );
      expect(container.querySelectorAll('.timeline-container').length).toBe(2);
    });

    it('should handle missing content field', () => {
      const noContentData = [
        { title: 'Event 1', content: undefined, image: '/img1.jpg', direction: 'left' },
        { title: 'Event 2', content: '', image: '/img2.jpg', direction: 'right' }
      ];
      const { container } = renderWithConfig(
        <Timeline timelineData={noContentData} />
      );
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(2);
    });

    it('should handle very long content text', () => {
      const longContent = 'A'.repeat(500);
      const longData = [
        { title: 'Event', content: longContent, image: '/img.jpg', direction: 'left' }
      ];
      renderWithConfig(<Timeline timelineData={longData} />);
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle special characters in title and content', () => {
      const specialData = [
        { 
          title: 'Event with "quotes" & <special> chars', 
          content: 'Content with special chars: © ® ™ → ↔', 
          image: '/img.jpg', 
          direction: 'left' 
        }
      ];
      renderWithConfig(<Timeline timelineData={specialData} />);
      expect(screen.getByText(/Event with.*quotes.*special.*chars/)).toBeInTheDocument();
      expect(screen.getByText(/Content with special chars/)).toBeInTheDocument();
    });
  });

  describe('Timeline Semantic HTML', () => {
    it('should use semantic heading hierarchy', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const h2Elements = container.querySelectorAll('h2');
      expect(h2Elements.length).toBe(3);
    });

    it('should use paragraph tags for content', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(3);
    });

    it('should have proper image attributes', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const images = container.querySelectorAll('img');
      images.forEach((img, index) => {
        expect(img).toHaveAttribute('src');
        expect(img).toHaveAttribute('alt');
        expect(img).toHaveAttribute('title');
      });
    });
  });

  describe('Timeline with Config', () => {
    it('should render with custom config', () => {
      const customConfig = {
        cloudinary: {
          product_env: 'custom-env',
          baseUrl: 'https://custom.cloudinary.com',
          transforms: 'custom-transforms',
        },
      };
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />,
        customConfig
      );
      expect(container.querySelector('.timeline')).toBeInTheDocument();
    });

    it('should render with minimal config', () => {
      const minimalConfig = {
        cloudinary: {
          product_env: 'test',
          baseUrl: 'test',
          transforms: 'test',
        },
      };
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />,
        minimalConfig
      );
      expect(container.querySelectorAll('.timeline-container').length).toBe(3);
    });
  });

  describe('Timeline Rendering Order', () => {
    it('should render items in correct order', () => {
      const { container } = renderWithConfig(
        <Timeline timelineData={mockTimelineData} />
      );
      const headers = container.querySelectorAll('h2');
      expect(headers[0].textContent).toBe('First Event');
      expect(headers[1].textContent).toBe('Second Event');
      expect(headers[2].textContent).toBe('Third Event');
    });

    it('should maintain data order with complex timeline', () => {
      const complexData = [
        { title: 'Event A', content: 'Content A', image: '/a.jpg', direction: 'left' },
        { title: 'Event B', content: 'Content B', image: '/b.jpg', direction: 'right' },
        { title: 'Event C', content: 'Content C', image: '/c.jpg', direction: 'left' },
        { title: 'Event D', content: 'Content D', image: '/d.jpg', direction: 'right' },
        { title: 'Event E', content: 'Content E', image: '/e.jpg', direction: 'left' }
      ];
      const { container } = renderWithConfig(
        <Timeline timelineData={complexData} />
      );
      const headers = Array.from(container.querySelectorAll('h2')).map(h => h.textContent);
      expect(headers).toEqual(['Event A', 'Event B', 'Event C', 'Event D', 'Event E']);
    });
  });
});
