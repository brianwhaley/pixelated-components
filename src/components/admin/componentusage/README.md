# Component Registry System

A modular, extensible system for managing and discovering components dynamically.

## Overview

This system provides a clean abstraction for component discovery that can work with either runtime discovery or build-time generation, without changing how components are used throughout the application.

## Architecture

### Core Components

1. **ComponentRegistry Interface** - Defines the contract for component management
2. **RuntimeComponentRegistry** - Implementation that discovers components at runtime
3. **ComponentRegistryFactory** - Factory for creating registry instances
4. **useComponentRegistry Hook** - React hook for easy access in components

### Key Benefits

- **Modular**: Easy to swap implementations (runtime ↔ build-time)
- **Extensible**: Add new component types without code changes
- **Type Safe**: Full TypeScript support
- **Testable**: Mock registry for testing
- **Performance Aware**: Designed for both runtime and build-time optimization

## Usage

### Basic Usage

```typescript
import { useComponentRegistry } from './admin/useComponentRegistry';

function MyComponent() {
  const { componentMap, isLoading } = useComponentRegistry();

  if (isLoading) return <div>Loading...</div>;

  return (
    <select>
      {Object.keys(componentMap).map(name => (
        <option key={name} value={name}>{name}</option>
      ))}
    </select>
  );
}
```

### Advanced Usage

```typescript
function ComponentEditor() {
  const {
    componentMap,
    isLayoutComponent,
    getComponentMetadata,
    getComponentsByCategory
  } = useComponentRegistry();

  const layoutComponents = getComponentsByCategory('layout');

  return (
    <div>
      {Object.entries(componentMap).map(([name, Component]) => (
        <div key={name}>
          <Component />
          {isLayoutComponent(name) && <span>Can have children</span>}
        </div>
      ))}
    </div>
  );
}
```

## Implementation Strategies

### Current: Runtime Discovery
- Components registered manually in `RuntimeComponentRegistry`
- Discovered at application startup
- Good for development and small component sets

### Future: Build-Time Generation
- Script scans component files during build
- Generates static registry file
- Better performance for production

### Migration Path

1. **Phase 1**: Use runtime discovery (current implementation)
2. **Phase 2**: Create build script that generates registry
3. **Phase 3**: Switch factory to use generated registry
4. **Phase 4**: Remove runtime discovery code

## Adding New Components

### For Runtime Registry

```typescript
// In RuntimeComponentRegistry.ts
this.registerComponent(
  'MyNewComponent',
  () => import('../path/to/MyNewComponent').then(m => m.MyNewComponent),
  {
    canHaveChildren: false,
    category: 'content',
    description: 'A new component for...'
  }
);
```

### For Build-Time Registry

Add component to the build script's scan paths, and it will be automatically included.

## Testing

```typescript
import { resetComponentRegistry, setComponentRegistry } from './ComponentRegistryFactory';

describe('ComponentRegistry', () => {
  beforeEach(() => {
    resetComponentRegistry();
  });

  it('should discover components', () => {
    const mockRegistry = { /* mock implementation */ };
    setComponentRegistry(mockRegistry);
    // Test with mock registry
  });
});
```

## Future Enhancements

- Component metadata (icons, descriptions, examples)
- Category-based organization
- Search and filtering
- Component usage analytics
- A/B testing component variants
- Plugin system for third-party components