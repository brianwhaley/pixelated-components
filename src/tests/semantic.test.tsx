import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageTitleHeader, PageSection, PageNav, PageFooter, PageSectionBackgroundImage } from '@/components/general/semantic';

// Mock SmartImage component
vi.mock('@/components/general/smartimage', () => ({
  SmartImage: (props: any) => React.createElement('img', {
    src: props.src,
    alt: props.alt,
    className: props.className,
    id: props.id,
    title: props.title,
    'data-testid': 'smart-image',
    ...props
  })
}));

// Mock usePixelatedConfig hook
vi.mock('@/components/config/config.client', () => ({
  usePixelatedConfig: () => ({
    cloudinary: {
      product_env: 'test',
      baseUrl: 'https://example.com'
    }
  })
}));

describe('Semantic Components', () => {
  describe('PageTitleHeader', () => {
    it('should render title as h1 element', () => {
      render(<PageTitleHeader title="Test Title" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Title');
    });

    it('should apply page-title-header class', () => {
      const { container } = render(<PageTitleHeader title="Test Title" />);
      const heading = container.querySelector('h1');
      expect(heading).toHaveClass('page-title-header');
    });

    it('should render title without link when no url provided', () => {
      const { container } = render(<PageTitleHeader title="Test Title" />);
      const link = container.querySelector('a');
      expect(link).not.toBeInTheDocument();
    });

    it('should render title with link when url is provided', () => {
      render(<PageTitleHeader title="Test Title" url="/test-page" />);
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test-page');
    });

    it('should set target to _blank for external URLs', () => {
      render(<PageTitleHeader title="Test Title" url="https://external.com" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should set target to _self for internal URLs', () => {
      render(<PageTitleHeader title="Test Title" url="/internal-page" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_self');
    });

    it('should set rel="noopener noreferrer" for external links', () => {
      render(<PageTitleHeader title="Test Title" url="https://external.com" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should handle empty title string', () => {
      render(<PageTitleHeader title="" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(500);
      render(<PageTitleHeader title={longTitle} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.textContent).toBe(longTitle);
    });

    it('should handle special characters in title', () => {
      render(<PageTitleHeader title="Title & <Special> 'Characters'" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.textContent).toContain('Title & <Special> \'Characters\'');
    });

    it('should handle title with line breaks', () => {
      render(<PageTitleHeader title="Line 1 Line 2" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    it('should handle http URL correctly', () => {
      render(<PageTitleHeader title="External" url="http://example.com" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should handle HTTPS URL correctly', () => {
      render(<PageTitleHeader title="External" url="HTTPS://EXAMPLE.COM" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should preserve case in URL', () => {
      render(<PageTitleHeader title="Test" url="/Test-Page" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/Test-Page');
    });
  });

  describe('PageSection', () => {
    it('should render section element', () => {
      const { container } = render(<PageSection><div>Content</div></PageSection>);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(<PageSection><div data-testid="child">Test Content</div></PageSection>);
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should apply custom id when provided', () => {
      const { container } = render(<PageSection id="custom-section"><div>Content</div></PageSection>);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('id', 'custom-section');
    });

    it('should apply custom className when provided', () => {
      const { container } = render(<PageSection className="custom-class"><div>Content</div></PageSection>);
      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-class');
    });

    it('should handle grid layout type', () => {
      const { container } = render(<PageSection layoutType="grid"><div>Content</div></PageSection>);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should handle flex layout type', () => {
      const { container } = render(<PageSection layoutType="flex"><div>Content</div></PageSection>);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should handle none layout type', () => {
      const { container } = render(<PageSection layoutType="none"><div>Content</div></PageSection>);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <PageSection>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </PageSection>
      );
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('should handle nested PageSection components', () => {
      const { container } = render(
        <PageSection id="parent">
          <PageSection id="child">
            <div>Nested Content</div>
          </PageSection>
        </PageSection>
      );
      expect(container.querySelector('#parent')).toBeInTheDocument();
      expect(container.querySelector('#child')).toBeInTheDocument();
    });

    it('should handle empty section', () => {
      const { container } = render(<PageSection></PageSection>);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should preserve both id and className', () => {
      const { container } = render(
        <PageSection id="test-id" className="test-class">
          <div>Content</div>
        </PageSection>
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('id', 'test-id');
      expect(section).toHaveClass('test-class');
    });

    it('should handle complex children with multiple elements', () => {
      render(
        <PageSection>
          <header>Header</header>
          <main>Main Content</main>
          <footer>Footer</footer>
        </PageSection>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should handle whitespace in children', () => {
      const { container } = render(
        <PageSection>
          <div>  Content with spaces  </div>
        </PageSection>
      );
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should render PageTitleHeader inside PageSection', () => {
      render(
        <PageSection id="hero">
          <PageTitleHeader title="Main Title" />
        </PageSection>
      );
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Main Title');
    });

    it('should render PageTitleHeader with link inside PageSection', () => {
      render(
        <PageSection className="hero-section">
          <PageTitleHeader title="Clickable Title" url="/page" />
          <div>Additional content</div>
        </PageSection>
      );
      const link = screen.getByRole('link');
      const additionalContent = screen.getByText('Additional content');
      expect(link).toBeInTheDocument();
      expect(additionalContent).toBeInTheDocument();
    });

    it('should render multiple PageTitleHeaders in PageSection', () => {
      render(
        <PageSection>
          <PageTitleHeader title="First Title" />
          <PageTitleHeader title="Second Title" />
        </PageSection>
      );
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(2);
      expect(headings[0]).toHaveTextContent('First Title');
      expect(headings[1]).toHaveTextContent('Second Title');
    });

    it('should render nested sections with titles', () => {
      const { container } = render(
        <PageSection id="main" layoutType="grid">
          <PageTitleHeader title="Main Section" />
          <PageSection id="subsection">
            <PageTitleHeader title="Subsection" />
          </PageSection>
        </PageSection>
      );
      const mainSection = container.querySelector('#main');
      const subSection = container.querySelector('#subsection');
      expect(mainSection).toBeInTheDocument();
      expect(subSection).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined className', () => {
      const { container } = render(
        <PageSection className={undefined} id="test">
          <div>Content</div>
        </PageSection>
      );
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should handle empty className string', () => {
      const { container } = render(
        <PageSection className="" id="test">
          <div>Content</div>
        </PageSection>
      );
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should handle className with special characters', () => {
      const { container } = render(
        <PageSection className="class-1 class_2 class3" id="test">
          <div>Content</div>
        </PageSection>
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('class-1');
      expect(section).toHaveClass('class_2');
      expect(section).toHaveClass('class3');
    });

    it('should handle very long id', () => {
      const longId = 'a'.repeat(500);
      const { container } = render(
        <PageSection id={longId}>
          <div>Content</div>
        </PageSection>
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('id', longId);
    });
  });

  describe('PageNav', () => {
    const mockLinks = [
      { href: '/home', label: 'Home' },
      { href: '/about', label: 'About' },
      { href: 'https://external.com', label: 'External' }
    ];

    it('should render nav element', () => {
      const { container } = render(
        <PageNav links={mockLinks} />
      );
      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should return null when no links provided', () => {
      const { container } = render(
        <PageNav links={[]} />
      );
      expect(container.querySelector('nav')).not.toBeInTheDocument();
    });

    it('should return null when links is undefined', () => {
      const { container } = render(
        <PageNav links={undefined} />
      );
      expect(container.querySelector('nav')).not.toBeInTheDocument();
    });

    it('should render links with correct hrefs', () => {
      const { getByText } = render(
        <PageNav links={mockLinks} />
      );
      expect(getByText('Home')).toHaveAttribute('href', '/home');
      expect(getByText('About')).toHaveAttribute('href', '/about');
      expect(getByText('External')).toHaveAttribute('href', 'https://external.com');
    });

    it('should set target to _blank for external URLs', () => {
      const { getByText } = render(
        <PageNav links={mockLinks} />
      );
      expect(getByText('External')).toHaveAttribute('target', '_blank');
    });

    it('should set target to _self for internal URLs', () => {
      const { getByText } = render(
        <PageNav links={mockLinks} />
      );
      expect(getByText('Home')).toHaveAttribute('target', '_self');
      expect(getByText('About')).toHaveAttribute('target', '_self');
    });

    it('should set rel="noopener noreferrer" for external links', () => {
      const { getByText } = render(
        <PageNav links={mockLinks} />
      );
      expect(getByText('External')).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should not set rel for internal links', () => {
      const { getByText } = render(
        <PageNav links={mockLinks} />
      );
      expect(getByText('Home')).not.toHaveAttribute('rel');
    });

    it('should apply correct nav class with orientation', () => {
      const { container } = render(
        <PageNav links={mockLinks} orientation="vertical" />
      );
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('page-nav');
      expect(nav).toHaveClass('page-nav-vertical');
    });

    it('should default to horizontal orientation', () => {
      const { container } = render(
        <PageNav links={mockLinks} />
      );
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('page-nav-horizontal');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <PageNav links={mockLinks} className="custom-nav" />
      );
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-nav');
      expect(nav).toHaveClass('page-nav');
    });

    it('should handle empty label', () => {
      const linksWithEmpty = [
        { href: '/page', label: '' }
      ];
      const { container } = render(
        <PageNav links={linksWithEmpty} />
      );
      expect(container.querySelector('a')).toBeInTheDocument();
    });

    it('should filter out falsy links', () => {
      const mixedLinks = [
        { href: '/home', label: 'Home' },
        null,
        undefined,
        { href: '/about', label: 'About' }
      ] as any;
      const { container } = render(
        <PageNav links={mixedLinks} />
      );
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(2);
    });

    it('should handle external URL with custom target', () => {
      const linksWithTarget = [
        { href: 'https://external.com', label: 'External', target: '_self' as const }
      ];
      const { getByText } = render(
        <PageNav links={linksWithTarget} />
      );
      expect(getByText('External')).toHaveAttribute('target', '_self');
    });

    it('should handle many links', () => {
      const manyLinks = Array.from({ length: 50 }, (_, i) => ({
        href: `/page${i}`,
        label: `Link ${i}`
      }));
      const { container } = render(
        <PageNav links={manyLinks} />
      );
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(50);
    });
  });

  describe('PageFooter', () => {
    const mockLinks = [
      { href: '/privacy', label: 'Privacy' },
      { href: '/contact', label: 'Contact' }
    ];

    it('should render footer element', () => {
      const { container } = render(
        <PageFooter text="Copyright 2024" />
      );
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should return null when no content provided', () => {
      const { container } = render(
        <PageFooter />
      );
      expect(container.querySelector('footer')).not.toBeInTheDocument();
    });

    it('should render text content', () => {
      const { getByText } = render(
        <PageFooter text="Copyright 2024" />
      );
      expect(getByText('Copyright 2024')).toBeInTheDocument();
    });

    it('should render footer links', () => {
      const { getByText } = render(
        <PageFooter links={mockLinks} />
      );
      expect(getByText('Privacy')).toBeInTheDocument();
      expect(getByText('Contact')).toBeInTheDocument();
    });

    it('should set correct href and target for footer links', () => {
      const { getByText } = render(
        <PageFooter links={mockLinks} />
      );
      expect(getByText('Privacy')).toHaveAttribute('href', '/privacy');
      expect(getByText('Privacy')).toHaveAttribute('target', '_self');
    });

    it('should set target to _blank for external footer links', () => {
      const externalLinks = [
        { href: 'https://external.com', label: 'External' }
      ];
      const { getByText } = render(
        <PageFooter links={externalLinks} />
      );
      expect(getByText('External')).toHaveAttribute('target', '_blank');
    });

    it('should render children when provided', () => {
      const { getByText } = render(
        <PageFooter>
          <div>Custom Footer Content</div>
        </PageFooter>
      );
      expect(getByText('Custom Footer Content')).toBeInTheDocument();
    });

    it('should render text, links, and children together', () => {
      const { getByText, container } = render(
        <PageFooter text="Copyright 2024" links={mockLinks}>
          <div>Additional Content</div>
        </PageFooter>
      );
      expect(getByText('Copyright 2024')).toBeInTheDocument();
      expect(getByText('Privacy')).toBeInTheDocument();
      expect(getByText('Additional Content')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <PageFooter text="Footer" className="custom-footer" />
      );
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('page-footer');
      expect(footer).toHaveClass('custom-footer');
    });

    it('should handle footer with only text', () => {
      const { getByText, container } = render(
        <PageFooter text="Only text" />
      );
      expect(getByText('Only text')).toBeInTheDocument();
      expect(container.querySelector('.page-footer-links')).not.toBeInTheDocument();
    });

    it('should handle footer with only links', () => {
      const { getByText, container } = render(
        <PageFooter links={mockLinks} />
      );
      expect(getByText('Privacy')).toBeInTheDocument();
      expect(container.querySelector('footer p')).not.toBeInTheDocument();
    });

    it('should filter out falsy links', () => {
      const mixedLinks = [
        { href: '/privacy', label: 'Privacy' },
        null,
        { href: '/contact', label: 'Contact' }
      ] as any;
      const { container } = render(
        <PageFooter links={mixedLinks} />
      );
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(2);
    });

    it('should handle link with custom target', () => {
      const linksWithTarget = [
        { href: 'https://external.com', label: 'External', target: '_self' as const }
      ];
      const { getByText } = render(
        <PageFooter links={linksWithTarget} />
      );
      expect(getByText('External')).toHaveAttribute('target', '_self');
    });

    it('should handle many footer links', () => {
      const manyLinks = Array.from({ length: 20 }, (_, i) => ({
        href: `/link${i}`,
        label: `Link ${i}`
      }));
      const { container } = render(
        <PageFooter links={manyLinks} />
      );
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(20);
    });

    it('should not render rel attribute for internal links', () => {
      const { getByText } = render(
        <PageFooter links={mockLinks} />
      );
      expect(getByText('Privacy')).not.toHaveAttribute('rel');
    });

    it('should render rel="noopener noreferrer" for external links', () => {
      const externalLinks = [
        { href: 'https://external.com', label: 'External' }
      ];
      const { getByText } = render(
        <PageFooter links={externalLinks} />
      );
      expect(getByText('External')).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});

describe('PageSection Component', () => {
  describe('Grid Layout', () => {
    it('should render grid layout with default props', () => {
      const { container } = render(<PageSection layoutType="grid">Content</PageSection>);
      const section = container.querySelector('.page-section');
      const content = container.querySelector('.page-section-content');
      
      expect(section).toBeInTheDocument();
      expect(content).toHaveClass('row-12col');
      expect(content).toHaveStyle({ gridAutoFlow: 'row' });
    });

    it('should apply custom grid columns', () => {
      const { container } = render(<PageSection layoutType="grid" columns={6}>Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveClass('row-6col');
    });

    it('should apply grid auto flow', () => {
      const { container } = render(<PageSection layoutType="grid" autoFlow="column">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ gridAutoFlow: 'column' });
    });

    it('should apply justify items', () => {
      const { container } = render(<PageSection layoutType="grid" justifyItems="center">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ justifyItems: 'center' });
    });

    it('should apply align items', () => {
      const { container } = render(<PageSection layoutType="grid" alignItems="center">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ alignItems: 'center' });
    });
  });

  describe('Flex Layout', () => {
    it('should render flex layout', () => {
      const { container } = render(<PageSection layoutType="flex">Content</PageSection>);
      const section = container.querySelector('.page-section');
      const content = container.querySelector('.page-section-content');
      
      expect(section).toHaveClass('page-section-flex');
      expect(content).toHaveStyle({ display: 'flex' });
    });

    it('should apply flex direction', () => {
      const { container } = render(<PageSection layoutType="flex" direction="column">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ flexDirection: 'column' });
    });

    it('should apply flex wrap', () => {
      const { container } = render(<PageSection layoutType="flex" wrap="nowrap">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ flexWrap: 'nowrap' });
    });

    it('should apply justify content', () => {
      const { container } = render(<PageSection layoutType="flex" justifyContent="center">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ justifyContent: 'center' });
    });
  });

  describe('None Layout', () => {
    it('should render none layout', () => {
      const { container } = render(<PageSection layoutType="none">Content</PageSection>);
      const section = container.querySelector('.page-section');
      expect(section).toHaveClass('page-section-none');
    });
  });

  describe('Styling Props', () => {
    it('should apply background color', () => {
      const { container } = render(<PageSection background="red">Content</PageSection>);
      const section = container.querySelector('.page-section');
      expect(section).toHaveStyle({ background: 'red' });
    });

    it('should apply max width', () => {
      const { container } = render(<PageSection maxWidth="800px">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ maxWidth: '800px' });
    });

    it('should apply padding', () => {
      const { container } = render(<PageSection padding="20px">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ padding: '20px' });
    });

    it('should apply gap', () => {
      const { container } = render(<PageSection gap="10px">Content</PageSection>);
      const content = container.querySelector('.page-section-content');
      expect(content).toHaveStyle({ gap: '10px' });
    });
  });

  describe('Background Image', () => {
    it('should render background image when provided', () => {
      render(<PageSection backgroundImage="test.jpg">Content</PageSection>);
      expect(screen.getByTestId('smart-image')).toBeInTheDocument();
    });

    it('should not render background image when not provided', () => {
      const { container } = render(<PageSection>Content</PageSection>);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(0);
    });
  });

  describe('ID and ClassName', () => {
    it('should apply id to section', () => {
      const { container } = render(<PageSection id="test-section">Content</PageSection>);
      const section = container.querySelector('.page-section');
      expect(section).toHaveAttribute('id', 'test-section');
    });

    it('should apply className to section', () => {
      const { container } = render(<PageSection className="custom-class">Content</PageSection>);
      const section = container.querySelector('.page-section');
      expect(section).toHaveClass('page-section', 'custom-class');
    });
  });
});

describe('PageSectionBackgroundImage Component', () => {
  it('should render SmartImage with correct props', () => {
    render(<PageSectionBackgroundImage backgroundImage="test.jpg" />);
    const image = screen.getByTestId('smart-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'test.jpg');
    expect(image).toHaveClass('section-background-image');
  });

  it('should apply id when provided', () => {
    render(<PageSectionBackgroundImage backgroundImage="test.jpg" id="section1" />);
    const image = screen.getByTestId('smart-image');
    expect(image).toHaveAttribute('id', 'section1-background-image');
  });

  it('should apply title when id is provided', () => {
    render(<PageSectionBackgroundImage backgroundImage="test.jpg" id="section1" />);
    const image = screen.getByTestId('smart-image');
    expect(image).toHaveAttribute('title', 'section1 background image');
  });

  it('should apply alt text when id is provided', () => {
    render(<PageSectionBackgroundImage backgroundImage="test.jpg" id="section1" />);
    const image = screen.getByTestId('smart-image');
    expect(image).toHaveAttribute('alt', 'section1 background image');
  });

  it('should handle missing id gracefully', () => {
    render(<PageSectionBackgroundImage backgroundImage="test.jpg" />);
    const image = screen.getByTestId('smart-image');
    expect(image).not.toHaveAttribute('id');
    expect(image).not.toHaveAttribute('title');
    expect(image).toHaveAttribute('alt', '');
  });
});

describe('PageNav Component', () => {
  const mockLinks = [
    { href: '/home', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: 'https://external.com', label: 'External' }
  ];

  it('should render horizontal navigation by default', () => {
    const { container } = render(<PageNav links={mockLinks} />);
    const nav = container.querySelector('.page-nav');
    expect(nav).toHaveClass('page-nav-horizontal');
  });

  it('should render vertical navigation', () => {
    const { container } = render(<PageNav links={mockLinks} orientation="vertical" />);
    const nav = container.querySelector('.page-nav');
    expect(nav).toHaveClass('page-nav-vertical');
  });

  it('should render all links', () => {
    render(<PageNav links={mockLinks} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('External')).toBeInTheDocument();
  });

  it('should apply correct href attributes', () => {
    render(<PageNav links={mockLinks} />);
    expect(screen.getByText('Home')).toHaveAttribute('href', '/home');
    expect(screen.getByText('About')).toHaveAttribute('href', '/about');
  });

  it('should set target _blank for external links', () => {
    render(<PageNav links={mockLinks} />);
    const externalLink = screen.getByText('External');
    expect(externalLink).toHaveAttribute('target', '_blank');
    expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should set target _self for internal links', () => {
    render(<PageNav links={mockLinks} />);
    const homeLink = screen.getByText('Home');
    expect(homeLink).toHaveAttribute('target', '_self');
    expect(homeLink).not.toHaveAttribute('rel');
  });

  it('should respect explicit target attribute', () => {
    const linksWithTarget = [
      { href: '/home', label: 'Home', target: '_blank' as const }
    ];
    render(<PageNav links={linksWithTarget} />);
    const link = screen.getByText('Home');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should apply custom className', () => {
    const { container } = render(<PageNav links={mockLinks} className="custom-nav" />);
    const nav = container.querySelector('.page-nav');
    expect(nav).toHaveClass('page-nav-horizontal', 'custom-nav');
  });

  it('should filter out null/undefined links', () => {
    const linksWithNulls = [
      { href: '/home', label: 'Home' },
      null,
      { href: '/about', label: 'About' },
      undefined
    ] as any;
    render(<PageNav links={linksWithNulls} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('should return null when no links provided', () => {
    const { container } = render(<PageNav links={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when links is undefined', () => {
    const { container } = render(<PageNav links={undefined as any} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('PageFooter Component', () => {
  it('should render footer with text', () => {
    render(<PageFooter text="Copyright 2023" />);
    expect(screen.getByText('Copyright 2023')).toBeInTheDocument();
  });

  it('should render footer with links', () => {
    const links = [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' }
    ];
    render(<PageFooter links={links} />);
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
  });

  it('should render footer with children', () => {
    render(<PageFooter><div>Custom content</div></PageFooter>);
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<PageFooter className="custom-footer" text="Test" />);
    const footer = container.querySelector('.page-footer');
    expect(footer).toHaveClass('page-footer', 'custom-footer');
  });

  it('should filter out null/undefined links', () => {
    const linksWithNulls = [
      { href: '/privacy', label: 'Privacy' },
      null,
      { href: '/terms', label: 'Terms' }
    ] as any;
    render(<PageFooter links={linksWithNulls} />);
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
  });

  it('should return null when no content provided', () => {
    const { container } = render(<PageFooter />);
    expect(container.firstChild).toBeNull();
  });

  it('should handle external links in footer', () => {
    const externalLinks = [
      { href: 'https://external.com', label: 'External' }
    ];
    render(<PageFooter links={externalLinks} />);
    const link = screen.getByText('External');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should handle internal links in footer', () => {
    const internalLinks = [
      { href: '/contact', label: 'Contact' }
    ];
    render(<PageFooter links={internalLinks} />);
    const link = screen.getByText('Contact');
    expect(link).toHaveAttribute('target', '_self');
    expect(link).not.toHaveAttribute('rel');
  });
});
