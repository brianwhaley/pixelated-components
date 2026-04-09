import React, { useEffect, useState } from 'react';
import { StyleGuideUI } from '@/components/general/styleguide';

const meta = {
  title: 'General/Style Guide',
} as const;
export default meta;

const Template = (args: { siteName?: string }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // set example CSS vars so the story reliably shows fonts
    document.documentElement.style.setProperty('--header-font', '"Playfair Display", serif');
    document.documentElement.style.setProperty('--body-font', '"Roboto", system-ui, -apple-system');
    setReady(true);
  }, []);

  const routes = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about', routes: [{ name: 'Team', path: '/team' }] },
  ];

  if (!ready) return <div>Initializing...</div>;
  return <StyleGuideUI routes={routes} />;
};

export const Default = { render: (args: any) => <Template {...args} /> };
