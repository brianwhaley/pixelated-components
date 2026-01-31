import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { SkeletonLoading } from '../components/general/skeleton-loading';

describe('SkeletonLoading (composite)', () => {
  it('renders the hero and card skeletons', () => {
    const { container } = render(<SkeletonLoading cardCount={3} heroHeight={120} />);
    expect(container.querySelector('#hero-loading')).toBeInTheDocument();
    const cards = container.querySelectorAll('#cards-loading .card-article');
    expect(cards.length).toBe(3);
    const lines = container.querySelectorAll('.skeleton-line');
    expect(lines.length).toBeGreaterThanOrEqual(1);
  });

  it('respects props and accessibility', () => {
    const { container } = render(<SkeletonLoading heroHeight={88} cardCount={1} />);
    const hero = container.querySelector('#hero-loading .skeleton-rect') as HTMLElement | null;
    expect(hero).toBeInTheDocument();
    expect(hero?.style.height).toBe('88px');
    expect(container.querySelector('.visually-hidden')?.getAttribute('role')).toBe('status');
  });
});
