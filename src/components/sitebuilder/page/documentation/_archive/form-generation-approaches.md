# Form Generation Approaches - Comparison

## Problem
We need to generate form fields from component prop definitions. The challenge is that we need:
1. Type information at runtime (to know if a field should be a select, text input, etc.)
2. For select fields, the list of valid options
3. TypeScript type safety in the codebase

## Approaches

### 1. PropTypes Only (❌ Doesn't work in production)

```tsx
Callout.propTypes = {
  style: PropTypes.oneOf(['default', 'boxed', 'full']),
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
};
```

**Problem:** PropTypes don't include metadata (`_propType`, `values`) at runtime, even in development mode. The validators are just functions with no attached metadata.

---

### 2. Separate Metadata Object (✅ Current approach)

**File: componentMetadata.ts**
```typescript
export const componentMetadata = {
  'Callout': {
    style: {
      type: 'select',
      options: ['default', 'boxed', 'full'],
      default: 'default',
    },
    layout: {
      type: 'select', 
      options: ['horizontal', 'vertical'],
      default: 'horizontal',
    },
  },
};
```

**Pros:**
- ✅ Works at runtime
- ✅ Simple to implement
- ✅ No additional dependencies
- ✅ Can keep PropTypes for validation if desired

**Cons:**
- ❌ Duplicate definitions (PropTypes + metadata + TypeScript types)
- ❌ Can get out of sync
- ❌ Manual maintenance required

---

### 3. TypeScript const arrays + metadata (✅ Better)

**File: typeMetadata.ts**
```typescript
// Define options as const arrays - these exist at runtime
export const calloutStyles = ['default', 'boxed', 'full'] as const;
export type CalloutStyle = typeof calloutStyles[number]; // TypeScript type

// Metadata references the const arrays
export const calloutFieldMetadata = {
  style: {
    type: 'select' as const,
    options: calloutStyles, // References runtime array
    default: 'default',
  },
};

// TypeScript type for component props
export type CalloutProps = {
  style?: CalloutStyle;
  layout?: 'horizontal' | 'vertical';
};
```

**Pros:**
- ✅ Options exist at runtime (const arrays)
- ✅ TypeScript type safety
- ✅ Single source of truth for options (const array)
- ✅ No additional dependencies

**Cons:**
- ❌ Still requires separate metadata object
- ❌ Types and metadata are separate (can drift)

---

### 4. Zod Schema (✅ Best long-term)

```typescript
import { z } from 'zod';

// Single schema definition
export const calloutSchema = z.object({
  style: z.enum(['default', 'boxed', 'full']).default('default').optional(),
  layout: z.enum(['horizontal', 'vertical']).default('horizontal').optional(),
  title: z.string().optional(),
});

// TypeScript type inferred from schema
export type CalloutProps = z.infer<typeof calloutSchema>;

// Component
export function Callout(props: CalloutProps) {
  const validated = calloutSchema.parse(props); // Runtime validation
  // ...
}

// Automatic form generation
function generateFormFromSchema(schema: z.ZodObject<any>) {
  const fields = [];
  for (const [key, value] of Object.entries(schema.shape)) {
    if (value instanceof z.ZodEnum) {
      fields.push({
        name: key,
        type: 'select',
        options: value._def.values, // Available at runtime!
      });
    }
    // ... handle other types
  }
  return fields;
}
```

**Pros:**
- ✅ Single source of truth (schema defines everything)
- ✅ TypeScript types automatically inferred
- ✅ Runtime validation included
- ✅ Enum values accessible at runtime
- ✅ Can auto-generate forms
- ✅ Popular library with good ecosystem

**Cons:**
- ❌ Additional dependency (zod)
- ❌ Learning curve
- ❌ Requires refactoring existing components

---

## Recommendation

**For new projects:** Use **Zod** (#4). It's the most elegant and maintainable approach.

**For existing projects (like ours):** Use the **separate metadata object** (#2) or **TypeScript const arrays** (#3). Both work well without major refactoring.

We're currently using #2 (componentMetadata.ts), which is perfectly fine for the short term. If we want to improve it, we could move to #3 (typeMetadata.ts with const arrays) to get better type safety without adding dependencies.

## Migration Path

If we want to move toward Zod eventually:

1. **Phase 1** (current): Use componentMetadata.ts
2. **Phase 2** (optional): Move to const arrays + typeMetadata.ts
3. **Phase 3** (long-term): Migrate to Zod schemas one component at a time
