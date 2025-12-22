'use client';

import { FormBuilder, PageSection } from '@pixelated-tech/components';

export default function FormBuilderPage() {
  return (
    <PageSection maxWidth="1024px" columns={1}>
      <div>
        <h1>Form Builder</h1>
        <FormBuilder />
      </div>
    </PageSection>
  );
}