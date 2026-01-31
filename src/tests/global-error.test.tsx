import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test/test-utils';
import { GlobalErrorUI } from '../components/general/global-error';

describe('GlobalError', () => {
  it('renders message and calls reset when Try again clicked', async () => {
    const reset = vi.fn();
    const err = new Error('boom');
    const { container } = render(<GlobalErrorUI error={err} reset={reset} siteInfo={{ email: 'a@x.com' }} />);
    expect(container.querySelector('.ge-title')?.textContent).toMatch(/something went wrong/i);
    const btn = container.querySelector('.ge-btn-primary') as HTMLButtonElement;
    await userEvent.click(btn);
    expect(reset).toHaveBeenCalled();
  });

  it('shows details when toggled', async () => {
    const err = new Error('detail');
    const { container } = render(<GlobalErrorUI error={err} />);
    const toggle = container.querySelector('.ge-toggle') as HTMLButtonElement;
    expect(container.querySelector('[data-testid="error-details"]')).toBeNull();
    const user = userEvent.setup();
    await user.click(toggle);
    expect(container.querySelector('[data-testid="error-details"]')).toBeInTheDocument();
  });

  it('uses email when provided and shows unavailable when none provided', () => {
    const { container: c1 } = render(<GlobalErrorUI error={new Error('x')} siteInfo={{ email: 'a@x.com' }} />);
    expect(c1.querySelector('.ge-link')?.getAttribute('href')).toBe('mailto:a@x.com');

    const { container: c2 } = render(<GlobalErrorUI error={new Error('x')} siteInfo={{}} />);
    expect(c2.querySelector('.ge-unavailable')).toBeInTheDocument();
  });

  it('includes correct a11y attributes (role, aria-live) and forwards className', async () => {
    const { container } = render(<GlobalErrorUI error={new Error('boom')} className="my-app" />);
    const root = container.querySelector('.global-error');
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass('my-app');

    const alert = container.querySelector('[role="alert"]');
    expect(alert).toBeInTheDocument();
    expect(alert?.getAttribute('aria-live')).toBe('polite');

    const toggle = container.querySelector('.ge-toggle') as HTMLButtonElement;
    const user = userEvent.setup();
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await user.click(toggle);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    const details = container.querySelector('[data-testid="error-details"]');
    expect(details).toHaveTextContent('boom');
  });
});
