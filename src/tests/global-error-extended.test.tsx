import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalErrorUI } from '../components/general/global-error';

describe('GlobalErrorUI - Extended Coverage', () => {
  const mockReset = vi.fn();

  describe('Basic Rendering', () => {
    it('should render error UI without crashing', () => {
      render(<GlobalErrorUI error={new Error('Test error')} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should display error title', () => {
      render(<GlobalErrorUI error={new Error('Test error')} />);
      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    });

    it('should display default error message', () => {
      render(<GlobalErrorUI error={new Error('Test error')} />);
      const message = screen.getByText(/we encountered an unexpected error/i);
      expect(message).toBeInTheDocument();
    });

    it('should render Try again button', () => {
      render(<GlobalErrorUI error={new Error('Test error')} reset={mockReset} />);
      const button = screen.getByRole('button', { name: /try again/i });
      expect(button).toBeInTheDocument();
    });

    it('should render Show details button', () => {
      render(<GlobalErrorUI error={new Error('Test error')} />);
      const button = screen.getByRole('button', { name: /show details/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing error prop', () => {
      render(<GlobalErrorUI />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle error with message', () => {
      const error = new Error('Custom error message');
      render(<GlobalErrorUI error={error} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle null error', () => {
      render(<GlobalErrorUI error={null} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render without reset function', () => {
      render(<GlobalErrorUI error={new Error('Test')} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Reset Callback', () => {
    it('should call reset when Try again clicked', async () => {
      const user = userEvent.setup();
      render(<GlobalErrorUI error={new Error('Test')} reset={mockReset} />);
      
      const button = screen.getByRole('button', { name: /try again/i });
      await user.click(button);
      
      expect(mockReset).toHaveBeenCalled();
    });

    it('should handle undefined reset gracefully', async () => {
      const user = userEvent.setup();
      render(<GlobalErrorUI error={new Error('Test')} />);
      
      const button = screen.getByRole('button', { name: /try again/i });
      // Should not throw
      await user.click(button);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Details Toggle', () => {
    it('should toggle details on button click', async () => {
      const user = userEvent.setup();
      const error = new Error('Test error with details');
      render(<GlobalErrorUI error={error} />);
      
      const toggleButton = screen.getByRole('button', { name: /show details/i });
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
      
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should maintain pressed state on re-toggle', async () => {
      const user = userEvent.setup();
      const error = new Error('Test error');
      render(<GlobalErrorUI error={error} />);
      
      const toggleButton = screen.getByRole('button', { name: /show details/i });
      
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('CSS and Styling', () => {
    it('should have alert role with proper attributes', () => {
      render(<GlobalErrorUI error={new Error('Test')} />);
      const alert = screen.getByRole('alert');
      
      expect(alert).toHaveAttribute('role', 'alert');
      expect(alert).toHaveClass('global-error');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <GlobalErrorUI 
          error={new Error('Test')} 
          className="custom-class"
        />
      );
      
      const alert = container.querySelector('.global-error');
      expect(alert).toHaveClass('custom-class');
    });

    it('should preserve default classes with custom className', () => {
      const { container } = render(
        <GlobalErrorUI 
          error={new Error('Test')} 
          className="custom"
        />
      );
      
      const alert = container.querySelector('.global-error');
      expect(alert).toHaveClass('global-error');
      expect(alert).toHaveClass('custom');
    });
  });

  describe('Contact Information', () => {
    it('should handle missing siteInfo gracefully', () => {
      render(<GlobalErrorUI error={new Error('Test')} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should render with empty siteInfo', () => {
      render(<GlobalErrorUI error={new Error('Test')} siteInfo={{} as any} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show contact info when available', () => {
      const siteInfo = {
        adminEmail: 'admin@example.com',
      } as any;
      
      render(
        <GlobalErrorUI 
          error={new Error('Test')} 
          siteInfo={siteInfo}
        />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<GlobalErrorUI error={new Error('Test')} />);
      const heading = screen.getByRole('heading');
      expect(heading.tagName).toBe('H1');
    });

    it('should have aria-live for alert announcement', () => {
      const { container } = render(<GlobalErrorUI error={new Error('Test')} />);
      const alert = container.querySelector('[aria-live]');
      expect(alert).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(<GlobalErrorUI error={new Error('Test')} />);
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
    });

    it('should toggle aria-pressed state', async () => {
      const user = userEvent.setup();
      render(<GlobalErrorUI error={new Error('Test')} />);
      
      const toggle = screen.getByRole('button', { name: /show details/i });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Error Object Handling', () => {
    it('should handle Error instances', () => {
      const error = new Error('Standard error');
      render(<GlobalErrorUI error={error} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle TypeError instances', () => {
      const error = new TypeError('Type error');
      render(<GlobalErrorUI error={error} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle generic objects as errors', () => {
      const error = { message: 'Generic error object' };
      render(<GlobalErrorUI error={error as any} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Re-rendering', () => {
    it('should handle prop updates', () => {
      const { rerender } = render(
        <GlobalErrorUI error={new Error('First error')} />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      
      rerender(<GlobalErrorUI error={new Error('Second error')} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should update reset callback', async () => {
      const user = userEvent.setup();
      const reset1 = vi.fn();
      const reset2 = vi.fn();
      
      const { rerender } = render(
        <GlobalErrorUI error={new Error('Test')} reset={reset1} />
      );
      
      const button = screen.getByRole('button', { name: /try again/i });
      await user.click(button);
      
      expect(reset1).toHaveBeenCalledTimes(1);
      expect(reset2).not.toHaveBeenCalled();
      
      rerender(<GlobalErrorUI error={new Error('Test')} reset={reset2} />);
      await user.click(button);
      
      expect(reset1).toHaveBeenCalledTimes(1);
      expect(reset2).toHaveBeenCalledOnce();
    });
  });

  describe('Content Structure', () => {
    it('should have all main sections', () => {
      const { container } = render(<GlobalErrorUI error={new Error('Test')} />);
      
      expect(screen.getByRole('heading')).toBeInTheDocument();
      expect(screen.getByText(/we encountered an unexpected error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should display note about repeated errors', () => {
      render(<GlobalErrorUI error={new Error('Test')} />);
      expect(screen.getByText(/if this keeps happening/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Re-renders', () => {
    it('should maintain state across multiple renders', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <GlobalErrorUI error={new Error('Error 1')} />
      );
      
      const toggleButton = screen.getByRole('button', { name: /show details/i });
      await user.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
      
      rerender(<GlobalErrorUI error={new Error('Error 2')} />);
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('should handle rapid rerenders', () => {
      const { rerender } = render(<GlobalErrorUI error={new Error('Test')} />);
      
      for (let i = 0; i < 10; i++) {
        rerender(<GlobalErrorUI error={new Error(`Error ${i}`)} />);
      }
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
