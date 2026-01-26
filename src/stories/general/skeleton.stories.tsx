import React from 'react';
import { within } from '@testing-library/dom';
import { Skeleton } from '@/components/general/skeleton';

export default {
  title: 'General/Skeleton',
  component: Skeleton,
};

export const Default = () => <Skeleton lines={3} />;
Default.storyName = 'default (text)';

export const Variants = () => (
  <div style={{ display: 'flex', gap: 16 }}>
    <Skeleton variant="avatar" />
    <Skeleton variant="rect" width="200px" height={120} />
    <Skeleton lines={4} width="80%" />
  </div>
);
Variants.storyName = 'variants';

// This story *mimics* an unresolved/pending async route but does NOT hang the
// Storybook test runner — it simply renders the suspended state and then
// asserts the skeleton is present (DOM-only assertion). This reproduces the
// app /slow infinite-hang scenario deterministically for plays/tests.
export const InfiniteHang = () => {
  function SlowPage() {
    const [pending] = React.useState(true);
    // Simulate a pending load (never-resolving promise) by keeping `pending`
    // true; the UI shows Skeleton while pending.
    return (
      <div>
        {pending ? (
          <div data-testid="suspended">
            <Skeleton lines={3} />
          </div>
        ) : (
          <div>Loaded</div>
        )}
      </div>
    );
  }
  return <SlowPage />;
};

InfiniteHang.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const suspended = await canvas.getByTestId('suspended');
  expect(suspended).toBeInTheDocument();
  // ensure at least one skeleton-line exists
  const lines = canvasElement.querySelectorAll('.skeleton-line');
  expect(lines.length).toBeGreaterThanOrEqual(1);
};
