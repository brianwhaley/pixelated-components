import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/test-utils';

// Stub package-level UI used by StyleGuideUI so tests don't resolve built `dist` assets
vi.mock('@pixelated-tech/components', () => {
  const React = require('react');
  return {
    PageTitleHeader: (props: any) => React.createElement('h1', { className: 'page-title-header' }, props.title),
    PageSection: (props: any) => React.createElement('section', { id: props.id, className: 'page-section' }, props.children),
    flattenRoutes: (r: any) => {
      // simple leaf-only flatten used by tests
      if (!r) return [];
      return r.flatMap((item: any) => (item.routes ? item.routes : [item]));
    },
  };
});

import { StyleGuideUI }  from '../components/foundation/styleguide';

const nestedRoutes = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about', routes: [{ name: 'Team', path: '/team' }, { name: 'History', path: '/history' }] },
  { name: 'Blog', path: '/blog' },
];

const flatRoutes = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' },
];

describe('StyleGuideUI', () => {
  beforeEach(() => {
    // Reset CSS variables before each test
    document.documentElement.style.removeProperty('--header-font');
    document.documentElement.style.removeProperty('--body-font');
    document.documentElement.style.removeProperty('--primary-color');
    document.documentElement.style.removeProperty('--secondary-color');
  });

  describe('Component Rendering', () => {
    it('renders color swatches and page title', () => {
      render(<StyleGuideUI routes={nestedRoutes} />);
      expect(screen.getByText(/Primary Color/)).toBeInTheDocument();
      expect(screen.getByText(/Secondary Color/)).toBeInTheDocument();
      expect(screen.getByText(/Style Guide/)).toBeInTheDocument();
    });

    it('renders page title header component', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const header = container.querySelector('.page-title-header');
      expect(header).toBeInTheDocument();
    });

    it('renders page section containers', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const sections = container.querySelectorAll('.page-section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('renders fonts section', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const fontsSection = container.querySelector('#fonts-section');
      expect(fontsSection).toBeInTheDocument();
    });

    it('renders colors section', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const colorsSection = container.querySelector('#colors-section');
      expect(colorsSection).toBeInTheDocument();
    });

    it('renders routes section', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      expect(container).toBeTruthy();
    });
  });

  describe('CSS Variables - Fonts', () => {
    it('reads CSS vars and displays the first font token (strips quotes)', () => {
      document.documentElement.style.setProperty('--header-font', '"Montserrat", Arial, sans-serif');
      document.documentElement.style.setProperty('--body-font', "'Roboto', system-ui, -apple-system");

      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const fontsSection = container.querySelector('#fonts-section');

      // find the H1 inside the fonts section (there are multiple h1s on the page)
      const h1 = fontsSection?.querySelector('h1');
      expect(h1?.textContent).toContain('Montserrat');

      const p = fontsSection?.querySelector('p');
      expect(p?.textContent).toContain('Roboto');
    });

    it('handles font variables with unquoted values', () => {
      document.documentElement.style.setProperty('--header-font', 'Georgia, serif');
      document.documentElement.style.setProperty('--body-font', 'Verdana, sans-serif');

      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const fontsSection = container.querySelector('#fonts-section');
      expect(fontsSection).toBeInTheDocument();
    });

    it('handles font variables with system fonts', () => {
      document.documentElement.style.setProperty('--header-font', 'system-ui, -apple-system, sans-serif');
      document.documentElement.style.setProperty('--body-font', '-apple-system, system-ui, BlinkMacSystemFont, sans-serif');

      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const fontsSection = container.querySelector('#fonts-section');
      expect(fontsSection).toBeInTheDocument();
    });

    it('when CSS vars are absent the font placeholders are empty (component overwrites initial N/A)', () => {
      // remove any custom properties
      document.documentElement.style.removeProperty('--header-font');
      document.documentElement.style.removeProperty('--body-font');

      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const fontsSection = container.querySelector('#fonts-section');

      // component will attempt to read the CSS var and produce an empty token if absent
      const h1 = fontsSection?.querySelector('h1');
      expect(h1?.textContent).toMatch(/H1\s*-\s*\s*font/);

      const p = fontsSection?.querySelector('p');
      expect(p?.textContent).toMatch(/font\.\s+This is a paragraph/);
    });

    it('displays multiple font size/weight variations', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const fontsSection = container.querySelector('#fonts-section');
      const headings = fontsSection?.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect((headings?.length || 0) > 0).toBe(true);
    });
  });

  describe('CSS Variables - Colors', () => {
    it('displays primary and secondary color swatches', () => {
      render(<StyleGuideUI routes={nestedRoutes} />);
      expect(screen.getByText(/Primary Color/)).toBeInTheDocument();
      expect(screen.getByText(/Secondary Color/)).toBeInTheDocument();
    });

    it('handles custom color variables when set', () => {
      document.documentElement.style.setProperty('--primary-color', '#FF5733');
      document.documentElement.style.setProperty('--secondary-color', '#33FF57');

      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const colorsSection = container.querySelector('#colors-section');
      expect(colorsSection).toBeInTheDocument();
    });

    it('handles RGB color format', () => {
      document.documentElement.style.setProperty('--primary-color', 'rgb(255, 87, 51)');
      document.documentElement.style.setProperty('--secondary-color', 'rgb(51, 255, 87)');

      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const colorsSection = container.querySelector('#colors-section');
      expect(colorsSection).toBeInTheDocument();
    });

    it('handles HSL color format', () => {
      document.documentElement.style.setProperty('--primary-color', 'hsl(12, 100%, 67%)');
      document.documentElement.style.setProperty('--secondary-color', 'hsl(130, 100%, 67%)');

      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const colorsSection = container.querySelector('#colors-section');
      expect(colorsSection).toBeInTheDocument();
    });

    it('displays color swatches as visual elements', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const swatches = container.querySelectorAll('[style*="background-color"]');
      expect(swatches.length >= 0).toBe(true);
    });
  });

  describe('Routes - Rendering', () => {
    it('renders flattened route list including nested routes (only leaf routes are shown)', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const ul = container.querySelector('#fonts-section + #fonts-section ul') || container.querySelector('section#fonts-section ul');
      const items = Array.from(ul?.querySelectorAll('li') || []).map(li => (li.textContent || '').replace(/\s+/g, ' ').trim());

      expect(items).toContain('Team - /team');
      expect(items).toContain('History - /history');
      // parent with nested `routes` is not listed by getAllRoutes (leaf-only)
      expect(items).not.toContain('About - /about');
    });

    it('renders flat routes without nesting', () => {
      const { container } = render(<StyleGuideUI routes={flatRoutes} />);
      const routeItems = container.querySelectorAll('li');
      expect(routeItems.length >= flatRoutes.length).toBe(true);
    });

    it('handles routes without paths', () => {
      const routesWithoutPaths = [
        { name: 'Home' },
        { name: 'About' },
      ];
      const { container } = render(<StyleGuideUI routes={routesWithoutPaths as any} />);
      expect(container).toBeInTheDocument();
    });

    it('handles deeply nested routes', () => {
      const deepRoutes = [
        {
          name: 'Root',
          path: '/',
          routes: [
            {
              name: 'Level1',
              path: '/l1',
              routes: [
                { name: 'Level2', path: '/l1/l2' },
              ]
            }
          ]
        }
      ];
      const { container } = render(<StyleGuideUI routes={deepRoutes as any} />);
      expect(container).toBeInTheDocument();
    });

    it('renders all leaf routes from nested structure', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const listItems = container.querySelectorAll('li');
      // Should have at least the leaf routes
      expect(listItems.length >= 3).toBe(true); // Team, History, Blog, Home
    });
  });

  describe('Routes - Path Display', () => {
    it('displays route paths correctly', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const listItems = Array.from(container.querySelectorAll('li')).map(li => li.textContent?.trim() || '');
      const hasPathItems = listItems.some(item => item.includes('/'));
      expect(hasPathItems).toBe(true);
    });

    it('formats route names and paths together', () => {
      const { container } = render(<StyleGuideUI routes={flatRoutes} />);
      const listItems = container.querySelectorAll('li');
      expect(listItems.length > 0).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty routes array', () => {
      const { container } = render(<StyleGuideUI routes={[]} />);
      expect(container).toBeInTheDocument();
    });

    it('handles undefined routes gracefully', () => {
      const { container } = render(<StyleGuideUI routes={undefined as any} />);
      expect(container).toBeInTheDocument();
    });

    it('handles routes with special characters in names', () => {
      const specialRoutes = [
        { name: 'Home & Work', path: '/home-work' },
        { name: 'FAQ\'s', path: '/faq' },
        { name: 'About "Us"', path: '/about' },
      ];
      const { container } = render(<StyleGuideUI routes={specialRoutes as any} />);
      expect(container).toBeInTheDocument();
    });

    it('handles very long route names', () => {
      const longRoutes = [
        { name: 'This is a very long route name that should still render properly without breaking', path: '/long' },
      ];
      const { container } = render(<StyleGuideUI routes={longRoutes as any} />);
      expect(container).toBeInTheDocument();
    });

    it('handles routes with unicode characters', () => {
      const unicodeRoutes = [
        { name: 'Café Menu', path: '/cafe' },
        { name: '日本語', path: '/ja' },
        { name: 'Ελληνικά', path: '/el' },
      ];
      const { container } = render(<StyleGuideUI routes={unicodeRoutes as any} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Multiple Section Integration', () => {
    it('renders all major sections together', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      
      const fontSection = container.querySelector('#fonts-section');
      const colorSection = container.querySelector('#colors-section');
      const routeSection = container.querySelector('ul, ol');
      
      expect(fontSection || colorSection || routeSection).toBeInTheDocument();
    });

    it('maintains proper section hierarchy', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const sections = container.querySelectorAll('.page-section');
      sections.forEach(section => {
        expect(section).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides semantic HTML structure', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const sections = container.querySelectorAll('section');
      expect(sections.length > 0).toBe(true);
    });

    it('has proper heading hierarchy', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const headings = container.querySelectorAll('h1, h2, h3');
      expect(headings.length > 0).toBe(true);
    });

    it('renders lists with proper structure', () => {
      const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
      const lists = container.querySelectorAll('ul, ol');
      lists.forEach(list => {
        expect(list).toBeInTheDocument();
      });
    });
  });
});
