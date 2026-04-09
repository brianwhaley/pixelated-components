# Single Source of Truth for PropTypes and Form Generation

## The Problem
PropTypes don't include runtime metadata (`_propType`, `values`) even in development mode. The validators are just functions, so `PropTypes.oneOf(['a', 'b'])` returns a function with no attached metadata about the array values.

## The Solution: Const Arrays
Define option arrays **once** in the component file, then use them everywhere:

### 1. Component File (e.g., pixelated.callout.tsx)

```typescript
// Define option arrays as const - single source of truth
export const CALLOUT_STYLES = ['default', 'boxed', 'boxed grid', 'full', 'grid', 'overlay', 'split'] as const;
export const SHAPES = ['square', 'bevel', 'squircle', 'round'] as const;
export const LAYOUTS = ['horizontal', 'vertical'] as const;

// Generate TypeScript types from const arrays
export type CalloutStyleType = typeof CALLOUT_STYLES[number]; // 'default' | 'boxed' | ...
export type ShapeType = typeof SHAPES[number]; // 'square' | 'bevel' | ...

// Use arrays in PropTypes
Callout.propTypes = {
  style: PropTypes.oneOf([...CALLOUT_STYLES]),
  boxShape: PropTypes.oneOf([...SHAPES]),
  layout: PropTypes.oneOf([...LAYOUTS]),
  // ... other props
};

// InferProps generates the full component type
export type CalloutType = InferProps<typeof Callout.propTypes>;

// Component uses the inferred type
export function Callout(props: CalloutType) {
  // ...
}
```

### 2. Component Metadata (componentMetadata.ts)

```typescript
// Import the same const arrays
import { CALLOUT_STYLES, SHAPES, LAYOUTS } from '../../callout/pixelated.callout';

export const componentMetadata = {
  'Callout': {
    style: {
      type: 'select',
      options: CALLOUT_STYLES,  // Same array!
      default: 'default',
    },
    boxShape: {
      type: 'select',
      options: SHAPES,  // Same array!
      default: 'squircle',
    },
    // ...
  },
};
```

## Data Flow

```
const array (CALLOUT_STYLES)
    ↓
    ├→ PropTypes.oneOf([...CALLOUT_STYLES])
    │      ↓
    │      └→ InferProps → TypeScript type for component
    │
    └→ componentMetadata.options
           ↓
           └→ Form generation (FormSelect with options)
```

## Benefits

1. **Single source of truth**: Arrays defined once in component file
2. **Type safety**: TypeScript types derived from const arrays
3. **Runtime values**: Arrays exist at runtime for form generation
4. **PropTypes validation**: Runtime prop validation still works
5. **InferProps compatibility**: TypeScript types automatically generated
6. **No duplication**: Same array used everywhere

## Example: Adding a New Component

```typescript
// 1. Define arrays in component file
export const MY_OPTIONS = ['option1', 'option2'] as const;

// 2. Use in PropTypes
MyComponent.propTypes = {
  myProp: PropTypes.oneOf([...MY_OPTIONS]),
};

// 3. Use InferProps for TypeScript type
export type MyComponentType = InferProps<typeof MyComponent.propTypes>;

// 4. Import in componentMetadata.ts
import { MY_OPTIONS } from '../../path/to/MyComponent';

// 5. Add to metadata
export const componentMetadata = {
  'My Component': {
    myProp: {
      type: 'select',
      options: MY_OPTIONS,
    },
  },
};
```

## Why This Works

- **const arrays are JavaScript objects** that exist at runtime
- **`as const`** makes TypeScript treat them as readonly tuples with literal types
- **Spread operator `[...ARRAY]`** creates a new array for PropTypes
- **`typeof ARRAY[number]`** extracts the union type: `'option1' | 'option2'`
- **InferProps** reads PropTypes structure to generate TypeScript types
- **componentMetadata imports** give runtime access to the arrays for form generation

## Answer to Original Question

**Q:** "With PropTypes InferProps, all the types should already be created. Can we use those?"

**A:** Yes! This solution leverages InferProps while solving the runtime metadata problem:
- PropTypes + InferProps provide TypeScript types ✅
- Const arrays provide runtime values ✅  
- Single definition point prevents drift ✅
- No separate TypeScript type definitions needed ✅
