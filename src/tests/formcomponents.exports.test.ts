import { describe, it, expect } from 'vitest';
import * as FC from '@/components/sitebuilder/form/formcomponents';
import visualForm from '@/components/sitebuilder/config/visualdesignform.json';
import { COMPONENTS as ENGINE_COMPONENTS } from '@/components/sitebuilder/form/formengine';

describe('Form components exports', () => {
  it('all components referenced by visualdesignform are exported (either via formcomponents or formengine component map)', () => {
    const missing: string[] = [];
    for (const f of visualForm.fields) {
      const name = f.component;
      if (!(name in FC) && !(name in ENGINE_COMPONENTS)) missing.push(name);
    }
    if (missing.length > 0) {
      throw new Error('Missing components: ' + missing.join(', '));
    }
    expect(missing.length).toBe(0);
  });
});
