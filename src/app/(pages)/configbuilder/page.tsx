'use client';

import { ConfigBuilder, PageSection } from '@pixelated-tech/components';

export default function ConfigBuilderPage() {
  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div>
        <h1>Config Builder</h1>
        <ConfigBuilder />
      </div>
    </PageSection>
  );
}