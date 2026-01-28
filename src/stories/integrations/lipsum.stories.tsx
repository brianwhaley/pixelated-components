import React, { useEffect, useState } from 'react';
import { getLipsum } from '@/components/integrations/lipsum';

export default {
  title: 'Integrations/Lipsum',
  component: null,
  argTypes: {
    LipsumTypeId: { control: { type: 'radio' }, options: ['Paragraph', 'Word', 'Char'] },
    Amount: { control: 'number' },
    StartWithLoremIpsum: { control: 'boolean' },
  },
};

const Example: React.FC<{ LipsumTypeId: string; Amount: number; StartWithLoremIpsum?: boolean }> = ({ LipsumTypeId, Amount, StartWithLoremIpsum }) => {
  const [items, setItems] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setItems(null);
    setError(null);
    (async () => {
      try {
        const result = await getLipsum({ LipsumTypeId: LipsumTypeId as any, Amount, StartWithLoremIpsum: !!StartWithLoremIpsum });
        if (mounted) setItems(result);
      } catch (err: any) {
        if (mounted) setError(err?.message ?? 'Failed');
      }
    })();
    return () => { mounted = false };
  }, [LipsumTypeId, Amount, StartWithLoremIpsum]);

  if (error) return <div>Error: {error}</div>;
  if (!items) return <div>Loading…</div>;
  return (
    <div>
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
};

export const Playground = {
  render: (args: any) => (
    <div style={{ maxWidth: 680, margin: '1rem auto' }}>
      <Example {...args} />
    </div>
  ),
  args: { LipsumTypeId: 'Paragraph', Amount: 3, StartWithLoremIpsum: true },
  parameters: {
    docs: {
      source: { type: 'dynamic' },
      description: {
        story: 'Fetches generated Lorem from https://www.lipsum.com via the site proxy. Use controls to change type and amount.'
      }
    }
  }
};
