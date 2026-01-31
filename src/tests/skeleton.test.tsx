import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '../test/test-utils';
import { Skeleton } from '../components/general/skeleton';

describe('Skeleton', () => {
  it('renders text lines by default', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelectorAll('.skeleton-line').length).toBeGreaterThan(0);
  });

  it('renders avatar variant', () => {
    const { container } = render(<Skeleton variant="avatar" />);
    expect(container.querySelector('.skeleton-avatar')).toBeInTheDocument();
  });

  it('renders rect variant with provided height', () => {
    const { container } = render(<Skeleton variant="rect" height={200} />);
    const el = container.querySelector('.skeleton-rect') as HTMLElement | null;
    expect(el).toBeInTheDocument();
    expect(el?.style.height).toBe('200px');
  });

  it('respects animated=false', () => {
    const { container } = render(<Skeleton animated={false} />);
    expect(container.querySelector('.skeleton--animated')).toBeNull();
  });

  it('applies width percent when width is a number', () => {
    const { container } = render(<Skeleton lines={2} width={50} />);
    const el = container.querySelector('.skeleton-line') as HTMLElement | null;
    expect(el?.style.width).toBe('50%');
  });

  it('is aria-hidden for accessibility', () => {
    const { container } = render(<Skeleton />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
