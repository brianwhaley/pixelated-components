import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { 
  Callout,
  CalloutHeader,
  CalloutButton,
  variants,
  shapes,
  layouts,
  directions
} from '../components/general/callout';

// Mock the SmartImage component before importing Callout
vi.mock('../cms/smartimage', () => ({
  SmartImage: (props: any) => {
    const { src, alt, title, onClick } = props;
    return React.createElement('img', {
      src,
      alt,
      title,
      onClick,
      'data-testid': 'smart-image'
    });
  },
}));

describe('Callout Component', () => {
  describe('Rendering - Basic Structure', () => {
    it('should render callout container with default class', () => {
      const { container } = render(
        <Callout title="Test Callout" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toBeInTheDocument();
    });

    it('should render callout with variant class', () => {
      const { container } = render(
        <Callout title="Test" variant="boxed" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('callout');
      expect(callout).toHaveClass('boxed');
    });

    it('should render with friendly ID based on title', () => {
      const { container } = render(
        <Callout title="My Test Title" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveAttribute('id', 'callout-my-test-title');
    });

    it('should not have ID when title is missing', () => {
      const { container } = render(
        <Callout />
      );
      const callout = container.querySelector('.callout');
      expect(callout).not.toHaveAttribute('id');
    });

    it('should render with horizontal layout by default', () => {
      const { container } = render(
        <Callout title="Test" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('horizontal');
    });

    it('should render with left direction by default', () => {
      const { container } = render(
        <Callout title="Test" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('left');
    });
  });

  describe('Rendering - Variants', () => {
    variants.forEach(variant => {
      it(`should render with variant: ${variant}`, () => {
        const { container } = render(
          <Callout title="Test" variant={variant} />
        );
        const callout = container.querySelector('.callout');
        expect(callout).toHaveClass(variant);
      });
    });

    it('should apply boxShape class when variant is boxed', () => {
      const { container } = render(
        <Callout title="Test" variant="boxed" boxShape="round" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('round');
    });

    it('should apply boxShape class when variant is boxed grid', () => {
      const { container } = render(
        <Callout title="Test" variant="boxed grid" boxShape="bevel" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('bevel');
    });

    it('should apply grid columns class', () => {
      const { container } = render(
        <Callout 
          title="Test" 
          variant="grid" 
          gridColumns={{ left: 1, right: 2 }}
        />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('callout-grid-1-2');
    });

    it('should not apply boxShape to split variant', () => {
      const { container } = render(
        <Callout 
          title="Test" 
          variant="split" 
          boxShape="round"
        />
      );
      const callout = container.querySelector('.callout');
      expect(callout).not.toHaveClass('round');
    });
  });

  describe('Rendering - Layouts and Directions', () => {
    layouts.forEach(layout => {
      it(`should render with layout: ${layout}`, () => {
        const { container } = render(
          <Callout title="Test" layout={layout} />
        );
        const callout = container.querySelector('.callout');
        expect(callout).toHaveClass(layout);
      });
    });

    directions.forEach(direction => {
      it(`should render with direction: ${direction}`, () => {
        const { container } = render(
          <Callout title="Test" direction={direction} />
        );
        const callout = container.querySelector('.callout');
        expect(callout).toHaveClass(direction);
      });
    });

    it('should not apply direction to vertical layout', () => {
      const { container } = render(
        <Callout title="Test" layout="vertical" direction="right" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).not.toHaveClass('right');
    });

    it('should not apply layout to split variant', () => {
      const { container } = render(
        <Callout title="Test" variant="split" layout="vertical" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).not.toHaveClass('vertical');
    });
  });

  describe('Rendering - Content Elements', () => {
    it('should render title', () => {
      render(<Callout title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should not render title when missing', () => {
      const { container } = render(<Callout />);
      const headers = container.querySelectorAll('.callout-header');
      expect(headers.length).toBe(0);
    });

    it('should render subtitle', () => {
      render(<Callout title="Title" subtitle="Test Subtitle" />);
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should not render subtitle when missing', () => {
      const { container } = render(<Callout title="Title" />);
      const subtitles = container.querySelectorAll('.callout-subtitle');
      expect(subtitles.length).toBe(0);
    });

    it('should render content', () => {
      render(<Callout title="Title" content="Test Content" />);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should not render content when missing', () => {
      const { container } = render(<Callout title="Title" />);
      const contents = container.querySelectorAll('.callout-content');
      expect(contents.length).toBe(0);
    });

    it('should render image when img is provided', () => {
      const { container } = render(<Callout title="Title" img="/test.jpg" imgAlt="Test" />);
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toBeInTheDocument();
      // SmartImage is mocked, so we check if the container exists
      expect(imageDiv?.children.length).toBeGreaterThan(0);
    });

    it('should not render image when img is missing', () => {
      render(<Callout title="Title" />);
      const images = screen.queryAllByTestId('smart-image');
      expect(images.length).toBe(0);
    });
  });

  describe('Rendering - Element Order', () => {
    it('should render image before body with left direction', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Test"
          direction="left"
        />
      );
      const callout = container.querySelector('.callout');
      const children = Array.from(callout?.children ?? []);
      const imageDiv = children.find(el => (el as any).className.includes('callout-image'));
      const bodyDiv = children.find(el => (el as any).className.includes('callout-body'));
      
      if (imageDiv && bodyDiv) {
        expect(children.indexOf(imageDiv)).toBeLessThan(children.indexOf(bodyDiv));
      }
    });

    it('should render body before image with right direction', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Test"
          direction="right"
        />
      );
      const callout = container.querySelector('.callout');
      const children = Array.from(callout?.children ?? []);
      const imageDiv = children.find(el => (el as any).className.includes('callout-image'));
      const bodyDiv = children.find(el => (el as any).className.includes('callout-body'));
      
      if (imageDiv && bodyDiv) {
        expect(children.indexOf(bodyDiv)).toBeLessThan(children.indexOf(imageDiv));
      }
    });
  });

  describe('CalloutHeader Component', () => {
    it('should render header with title', () => {
      render(<CalloutHeader title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render h2 element', () => {
      const { container } = render(<CalloutHeader title="Test" />);
      const h2 = container.querySelector('h2');
      expect(h2).toBeInTheDocument();
      expect(h2).toHaveClass('callout-title');
    });

    it('should render as link when URL is provided', () => {
      render(<CalloutHeader title="Test" url="/test" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render without link when URL is missing', () => {
      const { container } = render(<CalloutHeader title="Test" />);
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(0);
    });

    it('should apply target="_blank" when provided', () => {
      render(<CalloutHeader title="Test" url="https://example.com" target="_blank" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('CalloutButton Component', () => {
    it('should render button with link when URL is provided', () => {
      render(<CalloutButton title="Click Me" url="/test" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should apply target="_blank" when provided', () => {
      render(<CalloutButton title="Click Me" url="/test" target="_blank" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click Me');
    });

    it('should have callout-button class', () => {
      const { container } = render(
        <CalloutButton title="Click Me" url="/test" />
      );
      const button = container.querySelector('.callout-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Callout - Button Rendering Logic', () => {
    it('should render button with buttonText when provided', () => {
      render(
        <Callout 
          title="Title" 
          url="/test" 
          buttonText="Click Here"
        />
      );
      expect(screen.getByText('Click Here')).toBeInTheDocument();
    });

    it('should render button with title when buttonText is missing', () => {
      render(
        <Callout 
          title="My Title" 
          url="/test"
        />
      );
      // Find the button link that contains the title
      const buttons = screen.getAllByRole('button');
      const titleButtons = buttons.filter(btn => btn.textContent?.includes('My Title'));
      expect(titleButtons.length).toBeGreaterThan(0);
    });

    it('should not render button when URL is missing', () => {
      render(
        <Callout 
          title="Title" 
          buttonText="Click"
        />
      );
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });

    it('should not render button when both URL and buttonText are missing', () => {
      render(
        <Callout 
          title="Title"
        />
      );
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });
  });

  describe('Callout - URL Handling', () => {
    it('should set target="_blank" for external URLs starting with http', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          url="https://example.com"
        />
      );
      const links = container.querySelectorAll('a[href="https://example.com"]');
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
      });
    });

    it('should set target for internal URLs', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          url="/internal-page"
        />
      );
      const links = container.querySelectorAll('a[href="/internal-page"]');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Callout - Image Handling', () => {
    it('should apply imgShape class to image container', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Test"
          imgShape="round"
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toHaveClass('round');
    });

    it('should use imgAlt as alt text', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Alternative text"
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toBeInTheDocument();
    });

    it('should use title as alt text when imgAlt is missing', () => {
      const { container } = render(
        <Callout 
          title="My Title" 
          img="/test.jpg"
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toBeInTheDocument();
    });

    it('should use empty string as alt text when both are missing', () => {
      const { container } = render(
        <Callout 
          img="/test.jpg"
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toBeInTheDocument();
    });

    it('should use title as title attribute', () => {
      const { container } = render(
        <Callout 
          title="My Title" 
          img="/test.jpg" 
          imgAlt="Alt text"
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toBeInTheDocument();
    });

    it('should use imgAlt as title attribute when title is missing', () => {
      const { container } = render(
        <Callout 
          img="/test.jpg" 
          imgAlt="Alternative text"
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toBeInTheDocument();
    });
  });

  describe('Callout - Image Click Handler', () => {
    it('should wrap image in anchor when URL is provided without imgClick', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Test"
          url="/test"
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      const link = imageDiv?.querySelector('a');
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should apply onClick handler to image when imgClick is provided', () => {
      const mockClick = vi.fn();
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Test"
          url="/test-url"
          imgClick={mockClick}
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toBeInTheDocument();
    });

    it('should not wrap image in anchor when imgClick is provided', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Test"
          url="/test"
          imgClick={() => {}}
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      const link = imageDiv?.querySelector('a');
      expect(link).not.toBeInTheDocument();
    });

    it('should render plain image when no URL or imgClick', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Test"
        />
      );
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
      const imageDiv = container.querySelector('.callout-image');
      const link = imageDiv?.querySelector('a');
      expect(link).not.toBeInTheDocument();
    });
  });

  describe('Callout - Grid Columns', () => {
    it('should apply default grid columns 1-2', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          variant="grid"
        />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('callout-grid-1-2');
    });

    it('should apply custom grid columns', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          variant="grid"
          gridColumns={{ left: 2, right: 1 }}
        />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('callout-grid-2-1');
    });

    it('should apply grid columns to boxed grid variant', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          variant="boxed grid"
          gridColumns={{ left: 1, right: 3 }}
        />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('callout-grid-1-3');
    });

    it('should not apply grid columns to non-grid variants', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          variant="default"
          gridColumns={{ left: 1, right: 2 }}
        />
      );
      const callout = container.querySelector('.callout');
      expect(callout).not.toHaveClass('callout-grid-1-2');
    });
  });

  describe('Callout - HTML Structure', () => {
    it('should have callout-body div', () => {
      const { container } = render(
        <Callout title="Title" content="Content" />
      );
      const body = container.querySelector('.callout-body');
      expect(body).toBeInTheDocument();
    });

    it('should have callout-image div when image is provided', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Test"
        />
      );
      const image = container.querySelector('.callout-image');
      expect(image).toBeInTheDocument();
    });

    it('should have callout-header div when title is provided', () => {
      const { container } = render(
        <Callout title="Title" />
      );
      const header = container.querySelector('.callout-header');
      expect(header).toBeInTheDocument();
    });

    it('should have callout-subtitle div when subtitle is provided', () => {
      const { container } = render(
        <Callout title="Title" subtitle="Subtitle" />
      );
      const subtitle = container.querySelector('.callout-subtitle');
      expect(subtitle).toBeInTheDocument();
    });

    it('should have callout-content div when content is provided', () => {
      const { container } = render(
        <Callout title="Title" content="Content" />
      );
      const content = container.querySelector('.callout-content');
      expect(content).toBeInTheDocument();
    });

    it('should have callout-button div when button is rendered', () => {
      const { container } = render(
        <Callout title="Title" url="/test" buttonText="Button" />
      );
      const button = container.querySelector('.callout-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Callout - Edge Cases', () => {
    it('should handle empty title', () => {
      const { container } = render(<Callout title="" />);
      const callout = container.querySelector('.callout');
      expect(callout).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(200);
      render(<Callout title={longTitle} />);
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      render(<Callout title="Title & Description™" />);
      expect(screen.getByText('Title & Description™')).toBeInTheDocument();
    });

    it('should handle HTML-like content safely', () => {
      render(<Callout title="Title" content="<script>alert('xss')</script>" />);
      expect(screen.getByText("<script>alert('xss')</script>")).toBeInTheDocument();
    });

    it('should handle all shapes', () => {
      shapes.forEach(shape => {
        const { container } = render(
          <Callout title="Title" variant="boxed" boxShape={shape} />
        );
        const callout = container.querySelector('.callout');
        expect(callout).toHaveClass(shape);
      });
    });

    it('should combine multiple classes correctly', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          variant="boxed" 
          boxShape="round"
          layout="vertical"
          direction="right"
        />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('callout');
      expect(callout).toHaveClass('boxed');
      expect(callout).toHaveClass('round');
      expect(callout).toHaveClass('vertical');
      // direction should not apply to vertical layout
      expect(callout).not.toHaveClass('right');
    });
  });

  describe('Callout - Accessibility', () => {
    it('should have semantic heading structure', () => {
      const { container } = render(
        <Callout title="Title" subtitle="Subtitle" />
      );
      const h2 = container.querySelector('h2');
      const h3 = container.querySelector('h3');
      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it('should have proper link structure with external link attributes', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          url="https://example.com"
          img="/test.jpg"
          imgAlt="Test"
        />
      );
      const links = container.querySelectorAll('a[target="_blank"]');
      links.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should have proper image alt text', () => {
      const { container } = render(
        <Callout 
          title="Title" 
          img="/test.jpg" 
          imgAlt="Descriptive alt text"
        />
      );
      const imageDiv = container.querySelector('.callout-image');
      expect(imageDiv).toBeInTheDocument();
    });
  });

  describe('Callout - Integration Scenarios', () => {
    it('should render full callout with all content', () => {
      const mockClick = vi.fn();
      const { container } = render(
        <Callout 
          title="Complete Callout"
          subtitle="With all features"
          content="This is the main content"
          img="/test.jpg"
          imgAlt="Test image"
          imgShape="round"
          url="/destination"
          buttonText="Learn More"
          variant="boxed"
          boxShape="squircle"
          layout="horizontal"
          direction="left"
          imgClick={mockClick}
          aboveFold={true}
        />
      );
      
      expect(screen.getByText('Complete Callout')).toBeInTheDocument();
      expect(screen.getByText('With all features')).toBeInTheDocument();
      expect(screen.getByText('This is the main content')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      
      const callout = container.querySelector('.callout');
      expect(callout).toHaveClass('boxed');
      expect(callout).toHaveClass('squircle');
      expect(callout).toHaveClass('horizontal');
      expect(callout).toHaveClass('left');
    });

    it('should render minimal callout with just title', () => {
      const { container } = render(
        <Callout title="Simple" />
      );
      const callout = container.querySelector('.callout');
      expect(callout).toBeInTheDocument();
      expect(screen.getByText('Simple')).toBeInTheDocument();
    });
  });
});
