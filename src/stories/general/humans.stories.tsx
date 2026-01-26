import React, { useEffect, useState } from 'react';
import { generateHumansTxt } from '@/components/general/humanstxt';

const meta = {
  title: 'General/humans.txt',
} as const;
export default meta;

const Example = ({ siteName = 'Storybook Site' }: { siteName?: string }) => {
  const [txt, setTxt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { body } = await generateHumansTxt({
        pkg: { name: 'storybook-site', version: '0.0.0' },
        routesJson: { siteInfo: { name: siteName, url: 'https://storybook.test', author: 'Story Author' }, routes: [ { path: '/', title: 'Home' }, { path: '/about', title: 'About' } ] }
      });
      setTxt(body);
    })();
  }, [siteName]);

  return (
    <div style={{ maxWidth: 800 }}>
      <h3>Generated humans.txt</h3>
      <pre style={{ whiteSpace: 'pre-wrap', background: '#111', color: '#cfc', padding: 16, borderRadius: 6 }}>{txt ?? 'Generating...'}</pre>
    </div>
  );
};

export const Default = { render: (args: any) => <Example {...args} /> };
