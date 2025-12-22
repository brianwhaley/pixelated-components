'use client';

import { PageBuilderUI, PageSection } from '@pixelated-tech/components';

export default function PageBuilderPage() {
  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div>
        <h1>Page Builder</h1>
        <PageBuilderUI />
      </div>
    </PageSection>
  );
}