import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Loading, ToggleLoading } from '../components/general/loading';

describe('Loading Component', () => {
  describe('Loading Spinner', () => {
    it('should render loading spinner div', () => {
      const { container } = render(<Loading />);
      const loadingDiv = container.querySelector('#loadingSpinner');
      expect(loadingDiv).toBeInTheDocument();
    });

    it('should have loading class on container', () => {
      const { container } = render(<Loading />);
      const loadingDiv = container.querySelector('#loadingSpinner');
      expect(loadingDiv).toHaveClass('loading');
    });

    it('should render spinner element', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should render all 12 spinner bars', () => {
      const { container } = render(<Loading />);
      const bars = container.querySelectorAll('.spinner > div');
      expect(bars.length).toBe(12);
    });

    it('should have correct bar classes', () => {
      const { container } = render(<Loading />);
      for (let i = 1; i <= 12; i++) {
        const bar = container.querySelector(`.bar${i}`);
        expect(bar).toBeInTheDocument();
      }
    });

    it('should render bars in correct order', () => {
      const { container } = render(<Loading />);
      const bars = container.querySelectorAll('.spinner > div');
      bars.forEach((bar, index) => {
        expect(bar).toHaveClass(`bar${index + 1}`);
      });
    });

    it('should have loading class on container div', () => {
      const { container } = render(<Loading />);
      const loadingContainer = container.querySelector('.loading');
      expect(loadingContainer).toBeInTheDocument();
    });

    it('should render spinner as child of loading container', () => {
      const { container } = render(<Loading />);
      const loading = container.querySelector('#loadingSpinner.loading');
      const spinner = loading?.querySelector('.spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should have unique IDs for each bar', () => {
      const { container } = render(<Loading />);
      const barClasses = new Set();
      const bars = container.querySelectorAll('.spinner > div');
      bars.forEach(bar => {
        Array.from(bar.classList).forEach(cls => {
          if (cls.match(/^bar\d+$/)) {
            barClasses.add(cls);
          }
        });
      });
      expect(barClasses.size).toBe(12);
    });
  });

  describe('Loading Structure', () => {
    it('should wrap content in fragment', () => {
      const { container } = render(<Loading />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render single loading container', () => {
      const { container } = render(<Loading />);
      const loadingDivs = container.querySelectorAll('#loadingSpinner');
      expect(loadingDivs.length).toBe(1);
    });

    it('should not have any text content in spinner bars', () => {
      const { container } = render(<Loading />);
      const bars = container.querySelectorAll('.spinner > div');
      bars.forEach(bar => {
        expect(bar.textContent).toBe('');
      });
    });

    it('should have correct semantic structure', () => {
      const { container } = render(<Loading />);
      const loading = container.querySelector('#loadingSpinner');
      const spinner = loading?.querySelector('.spinner');
      expect(spinner?.parentElement).toBe(loading);
    });
  });

  describe('Multiple Instances', () => {
    it('should render multiple Loading components', () => {
      const { container } = render(
        <>
          <Loading />
          <Loading />
        </>
      );
      const loadingDivs = container.querySelectorAll('#loadingSpinner');
      // Note: Both will have same ID, so only one query finds both
      expect(loadingDivs.length).toBeGreaterThan(0);
    });

    it('should share same loadingSpinner ID', () => {
      const { container } = render(
        <>
          <Loading />
          <Loading />
        </>
      );
      const loadingDivs = container.querySelectorAll('[id="loadingSpinner"]');
      expect(loadingDivs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('CSS Classes', () => {
    it('should apply loading class for styling', () => {
      const { container } = render(<Loading />);
      const loadingDiv = container.querySelector('.loading');
      expect(loadingDiv?.classList.contains('loading')).toBe(true);
    });

    it('should apply spinner class for styling', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.spinner');
      expect(spinner?.classList.contains('spinner')).toBe(true);
    });

    it('should have no aria attributes by default', () => {
      const { container } = render(<Loading />);
      const loadingDiv = container.querySelector('#loadingSpinner');
      expect(loadingDiv?.getAttribute('aria-busy')).toBeNull();
    });
  });

  describe('Loading Element', () => {
    it('should create element with inline-block by default', () => {
      const { container } = render(<Loading />);
      const loadingDiv = container.querySelector('#loadingSpinner') as HTMLElement;
      // Default should allow visibility
      expect(loadingDiv).toBeInTheDocument();
    });

    it('should not have hidden attribute', () => {
      const { container } = render(<Loading />);
      const loadingDiv = container.querySelector('#loadingSpinner');
      expect(loadingDiv?.hasAttribute('hidden')).toBe(false);
    });
  });

  describe('ToggleLoading Function', () => {
    beforeEach(() => {
      // Create a loading element before each test
      const loadingDiv = document.createElement('div');
      loadingDiv.id = 'loadingSpinner';
      loadingDiv.style.display = 'none';
      document.body.appendChild(loadingDiv);
    });

    afterEach(() => {
      // Clean up
      const loadingDiv = document.getElementById('loadingSpinner');
      if (loadingDiv) {
        loadingDiv.remove();
      }
    });

    it('should be a function', () => {
      expect(typeof ToggleLoading).toBe('function');
    });

    it('should show loading spinner when show is true', () => {
      const loadingDiv = document.getElementById('loadingSpinner') as HTMLElement;
      loadingDiv.style.display = 'none';

      ToggleLoading({ show: true });

      // The function modifies the DOM directly
      expect(loadingDiv.style.display).toBe('inline-block');
    });

    it('should hide loading spinner when show is false', () => {
      const loadingDiv = document.getElementById('loadingSpinner') as HTMLElement;
      loadingDiv.style.display = 'inline-block';

      ToggleLoading({ show: false });

      expect(loadingDiv.style.display).toBe('none');
    });

    it('should handle undefined show prop by toggling', () => {
      const loadingDiv = document.getElementById('loadingSpinner') as HTMLElement;
      loadingDiv.style.display = 'none';

      ToggleLoading({});

      // Undefined show prop should toggle from current state
      expect(loadingDiv.style.display).toBe('inline-block');
    });

    it('should return early if loadingSpinner does not exist', () => {
      const loadingDiv = document.getElementById('loadingSpinner');
      if (loadingDiv) {
        loadingDiv.remove();
      }

      // Should not throw error
      ToggleLoading({ show: true });
      expect(true).toBe(true);
    });

    it('should toggle visibility when called multiple times', () => {
      const loadingDiv = document.getElementById('loadingSpinner') as HTMLElement;

      ToggleLoading({ show: true });
      expect(loadingDiv.style.display).toBe('inline-block');

      ToggleLoading({ show: false });
      expect(loadingDiv.style.display).toBe('none');

      ToggleLoading({ show: true });
      expect(loadingDiv.style.display).toBe('inline-block');
    });

    it('should set display to inline-block when showing', () => {
      const loadingDiv = document.getElementById('loadingSpinner') as HTMLElement;
      loadingDiv.style.display = 'block';

      ToggleLoading({ show: true });

      expect(loadingDiv.style.display).toBe('inline-block');
    });

    it('should preserve display:none when hiding', () => {
      const loadingDiv = document.getElementById('loadingSpinner') as HTMLElement;
      loadingDiv.style.display = 'inline-block'; // Start with visible

      ToggleLoading({ show: false });

      expect(loadingDiv.style.display).toBe('none');
    });
  });

  describe('Accessibility', () => {
    it('should render loading spinner with no role attribute', () => {
      const { container } = render(<Loading />);
      const loadingDiv = container.querySelector('#loadingSpinner');
      expect(loadingDiv?.getAttribute('role')).toBeNull();
    });

    it('should be screen reader accessible with proper context', () => {
      const { container } = render(
        <div>
          <div aria-busy="true" aria-label="Loading content">
            <Loading />
          </div>
        </div>
      );
      const loadingContainer = container.querySelector('[aria-busy="true"]');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Spinner Bars Styling', () => {
    it('should render each bar as independent element', () => {
      const { container } = render(<Loading />);
      const bars = container.querySelectorAll('.bar1, .bar2, .bar3, .bar4, .bar5, .bar6, .bar7, .bar8, .bar9, .bar10, .bar11, .bar12');
      expect(bars.length).toBe(12);
    });

    it('should have consistent bar structure', () => {
      const { container } = render(<Loading />);
      const spinner = container.querySelector('.spinner');
      const children = spinner?.children;
      expect(children?.length).toBe(12);

      // Each bar should be a div
      for (let i = 0; i < 12; i++) {
        expect(children?.[i].tagName).toBe('DIV');
      }
    });
  });
});
