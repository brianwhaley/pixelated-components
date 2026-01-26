import React from 'react';
import { within } from '@testing-library/dom';
import SkeletonLoading from '@/components/general/skeleton-loading';

export default { title: 'General/SkeletonLoading', component: SkeletonLoading };

export const Default = () => <SkeletonLoading />;

export const InfiniteHang = () => {
  function SlowPage() {
    const [pending] = React.useState(true);
    return <div>{pending ? <div data-testid="suspended"><SkeletonLoading /></div> : <div>Loaded</div>}</div>;
  }
  return <SlowPage />;
};

InfiniteHang.play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const canvas = within(canvasElement);
  const suspended = await canvas.getByTestId('suspended');
  expect(suspended).toBeInTheDocument();
  const lines = canvasElement.querySelectorAll('.skeleton-line');
  expect(lines.length).toBeGreaterThanOrEqual(1);
};
