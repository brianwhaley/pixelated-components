import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import SidePanel from '../components/general/sidepanel';

describe('SidePanel Component', () => {
  const mockOnClose = vi.fn();
  const mockOnToggle = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnToggle.mockClear();
    // Clear any existing portal roots
    const existing = document.getElementById('sidepanel-portal-root');
    if (existing) {
      existing.remove();
    }
  });

  afterEach(() => {
    const root = document.getElementById('sidepanel-portal-root');
    if (root) {
      root.remove();
    }
  });

  describe('Basic Rendering', () => {
    it('should not render content when isOpen is false', () => {
      const { container } = render(
        <SidePanel isOpen={false} onClose={mockOnClose}>
          <div data-testid="test-content">Test Content</div>
        </SidePanel>
      );
      expect(container.querySelector('[data-testid="test-content"]')).not.toBeInTheDocument();
    });

    it('should render children when isOpen is true', () => {
      const { container } = render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          <div data-testid="test-content">Test Content</div>
        </SidePanel>
      );
      // Portal elements are rendered in document.body
      expect(document.querySelector('[data-testid="test-content"]')).toBeInTheDocument();
    });

    it('should render sidepanel div with role="dialog"', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    it('should render in portal root element', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.getElementById('sidepanel-portal-root')).toBeInTheDocument();
    });

    it('should set aria-modal to true', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      const dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should set aria-hidden based on isOpen prop', () => {
      const { rerender } = render(
        <SidePanel isOpen={false} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      let dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-hidden', 'true');

      rerender(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      dialog = document.querySelector('[role="dialog"]');
      expect(dialog).toHaveAttribute('aria-hidden', 'false');
    });
  });

  describe('Position Props', () => {
    it('should render with left position by default', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      const wrapper = document.querySelector('.sidepanel-wrapper');
      expect(wrapper).toHaveAttribute('data-position', 'left');
    });

    it('should render with right position when specified', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} position="right">
          Content
        </SidePanel>
      );
      const wrapper = document.querySelector('.sidepanel-wrapper');
      expect(wrapper).toHaveAttribute('data-position', 'right');
    });

    it('should update position when prop changes', () => {
      const { rerender } = render(
        <SidePanel isOpen={true} onClose={mockOnClose} position="left">
          Content
        </SidePanel>
      );
      let wrapper = document.querySelector('.sidepanel-wrapper');
      expect(wrapper).toHaveAttribute('data-position', 'left');

      rerender(
        <SidePanel isOpen={true} onClose={mockOnClose} position="right">
          Content
        </SidePanel>
      );
      wrapper = document.querySelector('.sidepanel-wrapper');
      expect(wrapper).toHaveAttribute('data-position', 'right');
    });
  });

  describe('Width Customization', () => {
    it('should apply default width', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      const wrapper = document.querySelector('.sidepanel-wrapper') as HTMLElement;
      expect(wrapper?.style.getPropertyValue('--panel-width')).toBe('300px');
    });

    it('should apply custom width', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} width="500px">
          Content
        </SidePanel>
      );
      const wrapper = document.querySelector('.sidepanel-wrapper') as HTMLElement;
      expect(wrapper?.style.getPropertyValue('--panel-width')).toBe('500px');
    });

    it('should support percentage width', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} width="40%">
          Content
        </SidePanel>
      );
      const wrapper = document.querySelector('.sidepanel-wrapper') as HTMLElement;
      expect(wrapper?.style.getPropertyValue('--panel-width')).toBe('40%');
    });
  });

  describe('Overlay Behavior', () => {
    it('should render overlay by default', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.querySelector('.sidepanel-overlay')).toBeInTheDocument();
    });

    it('should not render overlay when showOverlay is false', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showOverlay={false}>
          Content
        </SidePanel>
      );
      expect(document.querySelector('.sidepanel-overlay')).not.toBeInTheDocument();
    });

    it('should call onClose when overlay is clicked', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showOverlay={true}>
          Content
        </SidePanel>
      );
      const overlay = document.querySelector('.sidepanel-overlay') as HTMLElement;
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should have aria-hidden on overlay', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showOverlay={true}>
          Content
        </SidePanel>
      );
      const overlay = document.querySelector('.sidepanel-overlay');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });

    it('should set overlay data-state based on isOpen', () => {
      const { rerender } = render(
        <SidePanel isOpen={false} onClose={mockOnClose} showOverlay={true}>
          Content
        </SidePanel>
      );
      let overlay = document.querySelector('.sidepanel-overlay');
      expect(overlay).toHaveAttribute('data-state', 'closed');

      rerender(
        <SidePanel isOpen={true} onClose={mockOnClose} showOverlay={true}>
          Content
        </SidePanel>
      );
      overlay = document.querySelector('.sidepanel-overlay');
      expect(overlay).toHaveAttribute('data-state', 'open');
    });
  });

  describe('Tab Functionality', () => {
    it('should not render tab by default', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.querySelector('.sidepanel-fixed-tab')).not.toBeInTheDocument();
    });

    it('should render tab when showTab is true', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={true}>
          Content
        </SidePanel>
      );
      expect(document.querySelector('.sidepanel-fixed-tab')).toBeInTheDocument();
    });

    it('should render tab with icon when provided', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={true} tabIcon="📌">
          Content
        </SidePanel>
      );
      const tab = document.querySelector('.sidepanel-fixed-tab');
      expect(tab?.textContent).toContain('📌');
    });

    it('should render tab with label when provided', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={true} tabLabel="Menu">
          Content
        </SidePanel>
      );
      expect(document.querySelector('.sidepanel-tab-label')).toHaveTextContent('Menu');
    });

    it('should call onToggle when tab is clicked', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} onToggle={mockOnToggle} showTab={true}>
          Content
        </SidePanel>
      );
      const tab = document.querySelector('.sidepanel-fixed-tab') as HTMLElement;
      fireEvent.click(tab);
      expect(mockOnToggle).toHaveBeenCalled();
    });

    it('should have correct aria-label on tab when panel is open', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} onToggle={mockOnToggle} showTab={true}>
          Content
        </SidePanel>
      );
      const tab = document.querySelector('.sidepanel-fixed-tab');
      expect(tab).toHaveAttribute('aria-label', 'Close panel');
    });

    it('should have correct aria-label on tab when panel is closed', () => {
      render(
        <SidePanel isOpen={false} onClose={mockOnClose} onToggle={mockOnToggle} showTab={true}>
          Content
        </SidePanel>
      );
      const tab = document.querySelector('.sidepanel-fixed-tab');
      expect(tab).toHaveAttribute('aria-label', 'Open panel');
    });

    it('should set data-has-tab attribute on wrapper', () => {
      const { rerender } = render(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={false}>
          Content
        </SidePanel>
      );
      let wrapper = document.querySelector('.sidepanel-wrapper');
      expect(wrapper).toHaveAttribute('data-has-tab', 'false');

      rerender(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={true}>
          Content
        </SidePanel>
      );
      wrapper = document.querySelector('.sidepanel-wrapper');
      expect(wrapper).toHaveAttribute('data-has-tab', 'true');
    });
  });

  describe('Keyboard Interaction', () => {
    it('should call onClose when Escape key is pressed and panel is open', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not call onClose when Escape key is pressed and panel is closed', () => {
      render(
        <SidePanel isOpen={false} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose when other keys are pressed', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Overflow', () => {
    it('should hide body overflow when panel is open', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body overflow when panel is closed', () => {
      const { rerender } = render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <SidePanel isOpen={false} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body overflow on unmount', () => {
      const { unmount } = render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.body.style.overflow).toBe('hidden');
      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Click Outside Behavior', () => {
    it('should not close on click outside when showOverlay is true', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showOverlay={true}>
          <div data-testid="panel-content">Content</div>
        </SidePanel>
      );
      const portal = document.querySelector('.sidepanel-portal') as HTMLElement;
      fireEvent.mouseDown(portal);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should close on click outside panel when showOverlay is false', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showOverlay={false}>
          <div data-testid="panel-content">Content</div>
        </SidePanel>
      );
      const portal = document.querySelector('.sidepanel-portal') as HTMLElement;
      fireEvent.mouseDown(portal);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside panel when showOverlay is false', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showOverlay={false}>
          <div data-testid="panel-content">Content</div>
        </SidePanel>
      );
      const content = document.querySelector('.sidepanel-content') as HTMLElement;
      fireEvent.mouseDown(content);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className to sidepanel', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} className="custom-class">
          Content
        </SidePanel>
      );
      const sidepanel = document.querySelector('.sidepanel');
      expect(sidepanel).toHaveClass('custom-class');
    });

    it('should apply both sidepanel and custom class', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} className="dark-theme">
          Content
        </SidePanel>
      );
      const sidepanel = document.querySelector('.sidepanel');
      expect(sidepanel).toHaveClass('sidepanel');
      expect(sidepanel).toHaveClass('dark-theme');
    });
  });

  describe('State Transitions', () => {
    it('should update wrapper state when isOpen changes', () => {
      const { rerender } = render(
        <SidePanel isOpen={false} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      let wrapper = document.querySelector('.sidepanel-wrapper');
      expect(wrapper).toHaveAttribute('data-state', 'closed');

      rerender(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      wrapper = document.querySelector('.sidepanel-wrapper');
      expect(wrapper).toHaveAttribute('data-state', 'open');
    });
  });

  describe('Content Rendering', () => {
    it('should render text content', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Hello World
        </SidePanel>
      );
      expect(document.querySelector('.sidepanel-content')).toHaveTextContent('Hello World');
    });

    it('should render complex content', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          <div>
            <h2>Title</h2>
            <p>Paragraph</p>
            <button>Button</button>
          </div>
        </SidePanel>
      );
      const content = document.querySelector('.sidepanel-content');
      expect(content?.querySelector('h2')).toHaveTextContent('Title');
      expect(content?.querySelector('p')).toHaveTextContent('Paragraph');
      expect(content?.querySelector('button')).toHaveTextContent('Button');
    });

    it('should update content when children change', () => {
      const { rerender } = render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Original
        </SidePanel>
      );
      expect(document.querySelector('.sidepanel-content')).toHaveTextContent('Original');

      rerender(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Updated
        </SidePanel>
      );
      expect(document.querySelector('.sidepanel-content')).toHaveTextContent('Updated');
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple sidepanels using same portal root', () => {
      const { container: container1 } = render(
        <SidePanel isOpen={true} onClose={vi.fn()}>
          Panel 1
        </SidePanel>
      );
      const { container: container2 } = render(
        <SidePanel isOpen={true} onClose={vi.fn()}>
          Panel 2
        </SidePanel>
      );

      const dialogs = document.querySelectorAll('[role="dialog"]');
      expect(dialogs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Portal Mounting', () => {
    it('should return null before mounting', () => {
      const { container } = render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      // Wait for mounting to complete
      expect(container.firstChild).toBeNull();
    });

    it('should create portal root if it does not exist', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Content
        </SidePanel>
      );
      expect(document.getElementById('sidepanel-portal-root')).toBeInTheDocument();
    });

    it('should reuse existing portal root', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Panel 1
        </SidePanel>
      );
      const firstRoot = document.getElementById('sidepanel-portal-root');

      render(
        <SidePanel isOpen={true} onClose={mockOnClose}>
          Panel 2
        </SidePanel>
      );
      const secondRoot = document.getElementById('sidepanel-portal-root');

      expect(firstRoot).toBe(secondRoot);
    });
  });

  describe('Tab Icon and Label Combinations', () => {
    it('should render both icon and label', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={true} tabIcon="🔧" tabLabel="Settings">
          Content
        </SidePanel>
      );
      const tab = document.querySelector('.sidepanel-fixed-tab');
      expect(tab?.querySelector('.sidepanel-tab-icon')).toBeInTheDocument();
      expect(tab?.querySelector('.sidepanel-tab-label')).toBeInTheDocument();
    });

    it('should render only icon when label is not provided', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={true} tabIcon="📝">
          Content
        </SidePanel>
      );
      const tab = document.querySelector('.sidepanel-fixed-tab');
      expect(tab?.querySelector('.sidepanel-tab-icon')).toBeInTheDocument();
      expect(tab?.querySelector('.sidepanel-tab-label')).not.toBeInTheDocument();
    });

    it('should render only label when icon is not provided', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={true} tabLabel="Help">
          Content
        </SidePanel>
      );
      const tab = document.querySelector('.sidepanel-fixed-tab');
      expect(tab?.querySelector('.sidepanel-tab-icon')).not.toBeInTheDocument();
      expect(tab?.querySelector('.sidepanel-tab-label')).toBeInTheDocument();
    });

    it('should render neither icon nor label when neither is provided', () => {
      render(
        <SidePanel isOpen={true} onClose={mockOnClose} showTab={true}>
          Content
        </SidePanel>
      );
      const tab = document.querySelector('.sidepanel-fixed-tab');
      expect(tab?.querySelector('.sidepanel-tab-icon')).not.toBeInTheDocument();
      expect(tab?.querySelector('.sidepanel-tab-label')).not.toBeInTheDocument();
    });
  });
});
