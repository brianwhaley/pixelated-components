import { describe, it, expect, vi } from 'vitest';
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

import { StyleGuideUI }  from '../components/general/styleguide';

const nestedRoutes = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about', routes: [{ name: 'Team', path: '/team' }, { name: 'History', path: '/history' }] },
  { name: 'Blog', path: '/blog' },
];

describe('StyleGuideUI', () => {
  it('renders color swatches and page title', () => {
    render(<StyleGuideUI routes={nestedRoutes} />);
    expect(screen.getByText(/Primary Color/)).toBeInTheDocument();
    expect(screen.getByText(/Secondary Color/)).toBeInTheDocument();
    expect(screen.getByText(/Style Guide/)).toBeInTheDocument();
  });

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

  it('renders flattened route list including nested routes (only leaf routes are shown)', () => {
    const { container } = render(<StyleGuideUI routes={nestedRoutes} />);
    const ul = container.querySelector('#fonts-section + #fonts-section ul') || container.querySelector('section#fonts-section ul');
    const items = Array.from(ul?.querySelectorAll('li') || []).map(li => (li.textContent || '').replace(/\s+/g, ' ').trim());

    expect(items).toContain('Team - /team');
    expect(items).toContain('History - /history');
    // parent with nested `routes` is not listed by getAllRoutes (leaf-only)
    expect(items).not.toContain('About - /about');
  });
});
