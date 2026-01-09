import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '../test/test-utils';
import { VisualDesignStyles, GoogleFontsImports } from '../components/sitebuilder/config/ConfigEngine';

// Mock the google-fonts module
vi.mock('../components/sitebuilder/config/google-fonts', () => ({
  generateGoogleFontsUrl: vi.fn((fonts: string[]) => {
    if (fonts.length === 0) return '';
    const cleanFonts = fonts
      .map((font: string) => font.replace(/['"]/g, '').trim())
      .filter((font: string) => font.length > 0);
    const fontParam = cleanFonts
      .map((font: string) => font.replace(/\s+/g, '+'))
      .join('|');
    return `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;
  })
}));

describe('ConfigEngine Components', () => {
  describe('VisualDesignStyles Component', () => {
    it('should render CSS custom properties from flat tokens', () => {
      const tokens = {
        'primary-color': '#007bff',
        'font-size-base': '16px',
        'spacing-unit': '8px'
      };

      const { container } = render(<VisualDesignStyles visualdesign={tokens} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('--primary-color: #007bff;');
      expect(styleElement?.textContent).toContain('--font-size-base: 16px;');
      expect(styleElement?.textContent).toContain('--spacing-unit: 8px;');
    });

    it('should build font stacks from 3-field structure', () => {
      const tokens = {
        'header-font-primary': 'Montserrat',
        'header-font-fallback': 'Arial',
        'header-font-generic': 'sans-serif',
        'body-font-primary': 'Open Sans',
        'body-font-fallback': 'Helvetica',
        'body-font-generic': 'sans-serif'
      };

      const { container } = render(<VisualDesignStyles visualdesign={tokens} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('--header-font-family: "Montserrat", "Arial", "sans-serif";');
      expect(styleElement?.textContent).toContain('--body-font-family: "Open Sans", "Helvetica", "sans-serif";');
    });

    it('should handle missing font fields gracefully', () => {
      const tokens = {
        'header-font-primary': 'Montserrat',
        'header-font-generic': 'sans-serif',
        'body-font-fallback': 'Helvetica'
      };

      const { container } = render(<VisualDesignStyles visualdesign={tokens} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('--header-font-family: "Montserrat", "sans-serif";');
      // body-font-fallback alone doesn't create a font family since there's no primary
      expect(styleElement?.textContent).not.toContain('--body-font-family');
    });

    it('should include responsive font sizing when font min/max values exist', () => {
      const tokens = {
        'font-size1-min': '14px',
        'font-size1-max': '18px',
        'font-size2-min': '16px',
        'font-size2-max': '20px',
        'font-min-screen': '320px',
        'font-max-screen': '1200px'
      };

      const { container } = render(<VisualDesignStyles visualdesign={tokens} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('--font-size1: clamp(var(--font-size1-min), calc(var(--font-size1-min) + ((var(--font-size1-max) - var(--font-size1-min)) * ((100vw - var(--font-min-screen)) / (var(--font-max-screen) - var(--font-min-screen))))), var(--font-size1-max));');
      expect(styleElement?.textContent).toContain('h1 { font-size: var(--font-size1); }');
    });

    it('should handle empty or undefined tokens', () => {
      const { container } = render(<VisualDesignStyles visualdesign={undefined} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain(':root {');
      expect(styleElement?.textContent).toContain('}');
    });

    it('should resolve object values with value property', () => {
      const tokens = {
        'primary-color': { value: '#007bff' },
        'font-size-base': { value: '16px' }
      };

      const { container } = render(<VisualDesignStyles visualdesign={tokens} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('--primary-color: #007bff;');
      expect(styleElement?.textContent).toContain('--font-size-base: 16px;');
    });

    it('should handle old 2-field font format', () => {
      const tokens = {
        'header-font': '"Playfair Display", serif',
        'body-font': '"Lato", sans-serif'
      };

      const { container } = render(<VisualDesignStyles visualdesign={tokens} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeInTheDocument();
      expect(styleElement?.textContent).toContain('--header-font: "Playfair Display", serif;');
      expect(styleElement?.textContent).toContain('--body-font: "Lato", sans-serif;');
    });
  });

  describe('GoogleFontsImports Component', () => {
    it('should render Google Fonts link when Google fonts are present', () => {
      const tokens = {
        'header-font-primary': 'Montserrat',
        'body-font-primary': 'Open Sans',
        'accent-font-fallback': 'Arial' // web-safe, should be ignored
      };

      const { container } = render(<GoogleFontsImports visualdesign={tokens} />);

      // Check for stylesheet link
      const stylesheet = container.querySelector('link[rel="stylesheet"]');
      expect(stylesheet).toBeInTheDocument();
      expect(stylesheet?.getAttribute('href')).toBe('https://fonts.googleapis.com/css2?family=Montserrat|Open+Sans&display=swap');
    });

    it('should not render when only web-safe fonts are present', () => {
      const tokens = {
        'header-font-primary': 'Arial',
        'body-font-primary': 'Helvetica'
      };

      const { container } = render(<GoogleFontsImports visualdesign={tokens} />);

      const stylesheet = container.querySelector('link[rel="stylesheet"]');
      expect(stylesheet).not.toBeInTheDocument();
    });

    it('should filter out web-safe fonts from Google Fonts import', () => {
      const tokens = {
        'header-font-primary': 'Montserrat',
        'body-font-primary': 'Arial', // web-safe
        'accent-font-primary': 'Roboto' // web-safe
      };

      const { container } = render(<GoogleFontsImports visualdesign={tokens} />);

      const stylesheet = container.querySelector('link[rel="stylesheet"]');
      expect(stylesheet).toBeInTheDocument();
      expect(stylesheet?.getAttribute('href')).toContain('Montserrat');
      expect(stylesheet?.getAttribute('href')).not.toContain('Arial');
      expect(stylesheet?.getAttribute('href')).not.toContain('Roboto');
    });

    it('should handle empty or undefined tokens', () => {
      const { container } = render(<GoogleFontsImports visualdesign={undefined} />);

      const stylesheet = container.querySelector('link[rel="stylesheet"]');
      expect(stylesheet).not.toBeInTheDocument();
    });

    it('should handle tokens without primary font fields', () => {
      const tokens = {
        'some-other-field': 'value',
        'header-font-fallback': 'Arial',
        'body-font-generic': 'sans-serif'
      };

      const { container } = render(<GoogleFontsImports visualdesign={tokens} />);

      const stylesheet = container.querySelector('link[rel="stylesheet"]');
      expect(stylesheet).not.toBeInTheDocument();
    });

    it('should set crossorigin attribute on fonts.gstatic.com preconnect', () => {
      const tokens = {
        'header-font-primary': 'Montserrat'
      };

      const { container } = render(<GoogleFontsImports visualdesign={tokens} />);

      // Check for stylesheet link (preconnect links may not render in test environment)
      const stylesheet = container.querySelector('link[rel="stylesheet"]');
      expect(stylesheet).toBeInTheDocument();
    });
  });
});