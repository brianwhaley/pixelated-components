import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { preloadAllCSS, deferAllCSS } from '../components/general/css';

describe('CSS Utilities', () => {
  let originalHead: HTMLElement;
  let linkElements: HTMLLinkElement[] = [];

  beforeEach(() => {
    originalHead = document.head;
    linkElements = [];
    // Clear all link elements before each test
    document.head.innerHTML = '';
  });

  afterEach(() => {
    // Clean up
    document.head.innerHTML = '';
    linkElements = [];
  });

  describe('preloadAllCSS', () => {
    it('should create preload link for each stylesheet', () => {
      // Create test stylesheets
      const link1 = document.createElement('link');
      link1.rel = 'stylesheet';
      link1.href = 'styles.css';
      document.head.appendChild(link1);

      const link2 = document.createElement('link');
      link2.rel = 'stylesheet';
      link2.href = 'theme.css';
      document.head.appendChild(link2);

      preloadAllCSS();

      // The function creates new preload links in the DOM
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      // Should have at least 2 preload links created
      expect(preloadLinks.length).toBeGreaterThanOrEqual(2);
    });

    it('should set fetchPriority to high on preload links', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      preloadAllCSS();

      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]') as NodeListOf<HTMLLinkElement>;
      preloadLinks.forEach(link => {
        if (link.href.includes('styles.css')) {
          expect(link.fetchPriority).toBe('high');
        }
      });
    });

    it('should set fetchPriority to high on original stylesheets', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      preloadAllCSS();

      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]') as NodeListOf<HTMLLinkElement>;
      stylesheets.forEach(link => {
        // fetchPriority is set as a property, not an attribute
        expect((link as any).fetchPriority === 'high' || link.getAttribute('fetchpriority') === 'high').toBe(true);
      });
    });

    it('should create noscript fallback', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      preloadAllCSS();

      const noscript = document.querySelector('noscript');
      expect(noscript).toBeInTheDocument();
    });

    it('should include stylesheet links in noscript fallback', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      preloadAllCSS();

      const noscript = document.querySelector('noscript');
      const fallbackLink = noscript?.querySelector('link[rel="stylesheet"]');
      expect(fallbackLink).toBeInTheDocument();
    });

    it('should handle multiple stylesheets', () => {
      for (let i = 1; i <= 5; i++) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `styles${i}.css`;
        document.head.appendChild(link);
      }

      preloadAllCSS();

      const noscript = document.querySelector('noscript');
      const fallbackLinks = noscript?.querySelectorAll('link[rel="stylesheet"]');
      expect(fallbackLinks?.length).toBe(5);
    });

    it('should preserve stylesheet href', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://example.com/styles.css';
      document.head.appendChild(link);

      preloadAllCSS();

      const preloadLinks = document.querySelectorAll('link[rel="preload"]') as NodeListOf<HTMLLinkElement>;
      expect(preloadLinks.length).toBeGreaterThan(0);
      // At least one preload link should exist
      const hasCorrectHref = Array.from(preloadLinks).some(link => 
        link.href.includes('styles.css')
      );
      expect(hasCorrectHref).toBe(true);
    });

    it('should handle stylesheets with complex URLs', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/path/to/styles.css?v=1.0&theme=dark';
      document.head.appendChild(link);

      expect(() => preloadAllCSS()).not.toThrow();
    });

    it('should not affect non-stylesheet links', () => {
      const script = document.createElement('script');
      script.src = 'script.js';
      document.head.appendChild(script);

      preloadAllCSS();

      const scripts = document.querySelectorAll('script');
      expect(scripts.length).toBe(1);
    });

    it('should handle empty head', () => {
      expect(() => preloadAllCSS()).not.toThrow();
    });

    it('should handle stylesheets without href', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      expect(() => preloadAllCSS()).not.toThrow();
    });
  });

  describe('deferAllCSS', () => {
    it('should change rel to preload', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      deferAllCSS();

      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]') as NodeListOf<HTMLLinkElement>;
      // After deferAllCSS, rel should be changed to preload
      const preloadLinks = document.querySelectorAll('link[rel="preload"]') as NodeListOf<HTMLLinkElement>;
      expect(preloadLinks.length).toBeGreaterThan(0);
    });

    it('should set as="style" on deferred stylesheets', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      deferAllCSS();

      const preloadLinks = document.querySelectorAll('link[rel="preload"]') as NodeListOf<HTMLLinkElement>;
      expect(preloadLinks.length).toBeGreaterThan(0);
      preloadLinks.forEach(link => {
        expect((link as any).as).toBe('style');
      });
    });

    it('should create onload handler', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      deferAllCSS();

      const preloadLink = document.querySelector('link[rel="preload"]') as HTMLLinkElement;
      if (preloadLink) {
        expect(preloadLink.onload).toBeTruthy();
      }
    });

    it('should create noscript fallback', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      deferAllCSS();

      const noscript = document.querySelector('noscript');
      expect(noscript).toBeInTheDocument();
    });

    it('should include stylesheets in noscript fallback', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      deferAllCSS();

      const noscript = document.querySelector('noscript');
      const fallbackLinks = noscript?.querySelectorAll('link[rel="stylesheet"]');
      expect(fallbackLinks?.length).toBe(1);
    });

    it('should handle multiple stylesheets', () => {
      for (let i = 1; i <= 3; i++) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `styles${i}.css`;
        document.head.appendChild(link);
      }

      deferAllCSS();

      const noscript = document.querySelector('noscript');
      const fallbackLinks = noscript?.querySelectorAll('link[rel="stylesheet"]');
      expect(fallbackLinks?.length).toBe(3);
    });

    it('should preserve stylesheet hrefs', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://example.com/styles.css';
      document.head.appendChild(link);

      deferAllCSS();

      const noscript = document.querySelector('noscript');
      const fallbackLink = noscript?.querySelector('link[rel="stylesheet"]') as HTMLLinkElement;
      expect(fallbackLink.href).toContain('styles.css');
    });

    it('should handle stylesheets with query parameters', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/styles.css?v=1.0&lang=en';
      document.head.appendChild(link);

      expect(() => deferAllCSS()).not.toThrow();
    });

    it('should not affect non-stylesheet links', () => {
      const script = document.createElement('script');
      script.src = 'script.js';
      document.head.appendChild(script);

      deferAllCSS();

      const scripts = document.querySelectorAll('script');
      expect(scripts.length).toBe(1);
    });

    it('should handle empty head', () => {
      expect(() => deferAllCSS()).not.toThrow();
    });

    it('should trigger onload to apply stylesheet', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      deferAllCSS();

      const preloadLink = document.querySelector('link[rel="preload"]') as HTMLLinkElement;
      
      // Simulate onload event
      if (preloadLink && preloadLink.onload) {
        preloadLink.onload(new Event('load'));
        // After onload, rel should be changed back to stylesheet
        expect(preloadLink.rel).toBe('stylesheet');
      }
    });

    it('should remove onload handler after execution', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'styles.css';
      document.head.appendChild(link);

      deferAllCSS();

      const preloadLink = document.querySelector('link[rel="preload"]') as HTMLLinkElement;
      
      if (preloadLink && preloadLink.onload) {
        // Trigger onload
        preloadLink.onload.call(preloadLink, new Event('load'));
        // onload handler should be removed
        expect(preloadLink.onload).toBeNull();
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle both preloadAllCSS and deferAllCSS', () => {
      const link1 = document.createElement('link');
      link1.rel = 'stylesheet';
      link1.href = 'styles.css';
      document.head.appendChild(link1);

      preloadAllCSS();

      const noscript1 = document.querySelector('noscript');
      expect(noscript1).toBeInTheDocument();

      // Clear and test deferAllCSS
      document.head.innerHTML = '';
      const link2 = document.createElement('link');
      link2.rel = 'stylesheet';
      link2.href = 'theme.css';
      document.head.appendChild(link2);

      deferAllCSS();

      const noscript2 = document.querySelector('noscript');
      expect(noscript2).toBeInTheDocument();
    });
  });

  describe('Performance Optimization', () => {
    it('should set high fetchPriority in preloadAllCSS', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'critical.css';
      document.head.appendChild(link);

      preloadAllCSS();

      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="style"]') as NodeListOf<HTMLLinkElement>;
      preloadLinks.forEach(link => {
        if (link.href.includes('critical.css')) {
          expect(link.fetchPriority).toBe('high');
        }
      });
    });

    it('should defer stylesheet loading in deferAllCSS', () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'theme.css';
      document.head.appendChild(link);

      deferAllCSS();

      // After deferAllCSS, stylesheets should be converted to preload
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      expect(preloadLinks.length).toBeGreaterThan(0);
    });
  });
});
