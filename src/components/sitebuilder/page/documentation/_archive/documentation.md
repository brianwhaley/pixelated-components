# PageBuilder V2 - Technical Documentation

## Overview

This document provides technical details for the refactored PageBuilder V2, which features:

1. **Modular Architecture** - Clean separation of concerns across 11 files
2. **Nested Component Support** - Layout components can contain other components
3. **PropTypes Introspection** - Automatic form field generation based on component PropTypes

## Architecture

### File Organization

```
pagebuilder-v2/
├── page.tsx (17 lines)
│   └─> Imports and renders PageBuilderUI
│
└── pagebuilder/
    ├── lib/                           # Pure utility functions (no React)
    │   ├── types.ts                   # TypeScript interfaces
    │   ├── componentMap.ts            # Component registry
    │   ├── propTypeIntrospection.ts   # PropTypes → form fields
    │   └── componentGeneration.ts     # Form data extraction
    │
    ├── components/                     # React components
    │   ├── PageEngine.tsx             # Preview renderer
    │   ├── ComponentTree.tsx          # Tree viewer
    │   ├── ComponentSelector.tsx      # Type selection
    │   ├── ComponentPropertiesForm.tsx # Form display
    │   └── PageBuilderUI.tsx          # Main orchestrator
    │
    └── usePageBuilder.ts              # State management hook
```

### Module Responsibilities

| Module | Purpose | Dependencies |
|--------|---------|-------------|
| `lib/types.ts` | TypeScript interfaces | None |
| `lib/componentMap.ts` | Component registry | Component library |
| `lib/propTypeIntrospection.ts` | PropTypes analysis | types.ts |
| `lib/componentGeneration.ts` | Form/component creation | types.ts, componentMap, propTypeIntrospection |
| `usePageBuilder.ts` | State management | lib/componentGeneration, lib/types |
| `components/PageEngine.tsx` | Render preview | lib/componentMap |
| `components/ComponentTree.tsx` | Display hierarchy | lib/componentMap |
| `components/ComponentSelector.tsx` | Select component | lib/componentMap, lib/componentGeneration |
| `components/ComponentPropertiesForm.tsx` | Display form | FormEngine |
| `components/PageBuilderUI.tsx` | Compose UI | All components, usePageBuilder |
| `page.tsx` | Entry point | PageBuilderUI |

## 1. Nested Component Support

### The Problem
Previously, the page builder could only add components at the root level. Layout components (Grid Section, Flex Section, etc.) couldn't contain other components, limiting their usefulness.

### The Solution
Components now have a `children` array, and layout components can be selected as "parent containers" for other components.

### Data Structure Change

**Before:**
```json
{
  "components": [
    { "component": "Callout", "props": {...} },
    { "component": "Grid Section", "props": {...} }
  ]
}
```

**After (with nesting):**
```json
{
  "components": [
    {
      "component": "Grid Section",
      "props": { "columns": 3, "gap": "2rem" },
      "children": [
        { "component": "Callout", "props": {...}, "children": [] },
        { "component": "Callout", "props": {...}, "children": [] },
        { "component": "Callout", "props": {...}, "children": [] }
      ]
    }
  ]
}
```

### Implementation Details

#### Type Definitions (`lib/types.ts`)

```typescript
export interface ComponentData {
  component: string;        // Component name (e.g., "Grid Section")
  props: Record<string, any>;  // Component properties
  children?: ComponentData[];  // Child components
  path?: string;           // Unique path identifier
}

export interface PageData {
  components: ComponentData[];
}

export interface EditMode {
  path: string;
  component: ComponentData;
}

export interface PropTypeInfo {
  type: string;
  options?: string[] | Record<string, any>;
  isRequired?: boolean;
  elementType?: any;
}
```

#### Key Functions by Module

**1. Component Path Tracking** (`lib/componentGeneration.ts`)
```typescript
// Each component gets a unique path for tracking position in tree
export function generateComponentObject(event: Event): { 
  component: ComponentData; 
  parentPath: string | undefined;
} {
  // ... extract form data ...
  
  newComponent.path = parentPath 
    ? `${parentPath}.children[${Date.now()}]` 
    : `root[${Date.now()}]`;
  
  return { component: newComponent, parentPath };
}
```

**2. Recursive Rendering** (`components/PageEngine.tsx`)
```typescript
export function PageEngine(props: PageEngineType) {
  function renderComponent(componentData: any, index: number): React.JSX.Element {
    const componentType = componentMap[componentData.component];
    
    // Recursively render children if they exist
    let children = null;
    if (componentData.children && componentData.children.length > 0) {
      children = componentData.children.map((child, childIndex) => 
        renderComponent(child, childIndex)
      );
    }
    
    // Create element with or without children
    if (children) {
      return React.createElement(componentType, componentProps, children);
    }
    return React.createElement(componentType, componentProps);
  }
  
  // Map over root components
  return <>{pageComponents.map((component, index) => 
    renderComponent(component, index)
  )}</>;
}
```

**3. Component Tree Viewer** (`components/ComponentTree.tsx`)
Shows hierarchical structure with visual indicators:
- Layout components have 📦 icon
- Selected component highlighted green
- Editing component highlighted orange
- Child count displayed for containers
- Edit button (blue) for all components
- Child button (green) for layout components only

### User Workflow

1. **Add a layout component** (e.g., Grid Section)
   - Select "Grid Section" from dropdown
   - Configure columns, gap, padding, etc.
   - Click "Add Grid Section"

2. **Select the layout component** in the tree viewer
   - Click on the component in the tree
   - It will highlight in green
   - Path is tracked for nesting

3. **Add child components**
   - Component selector now shows "Adding child to: [parent]"
   - Select a child component (e.g., Callout)
   - Configure its properties
   - Click "Add Callout"
   - Child is added inside the parent

4. **Continue nesting**
   - Children can also be layout components
   - Supports infinite nesting depth
   - Tree view shows entire hierarchy

### Example: Creating a 3-Column Card Grid

```
1. Add Grid Section (columns: 3)
2. Select Grid Section in tree
3. Add Callout #1 → added as child
4. Add Callout #2 → added as child  
5. Add Callout #3 → added as child

Result:
Grid Section
├── Callout #1
├── Callout #2
└── Callout #3
```

---

## 2. PropTypes Introspection

### The Problem
The old page builder generated only text inputs for all properties, regardless of the actual property type. For example, Callout's `style` prop accepts specific values like 'boxed', 'grid', 'overlay', but the form showed a plain text box.

### The Solution
Analyze PropTypes at runtime to generate appropriate form fields:
- `PropTypes.oneOf([...])` → Dropdown/datalist with options
- `PropTypes.number` → Number input
- `PropTypes.bool` → Checkbox
- `PropTypes.shape({...})` → JSON text input with hints
- `PropTypes.string` → Text input

### PropType Analysis Function (`lib/propTypeIntrospection.ts`)

**IMPORTANT:** PropTypes has inverted logic!
- Optional types like `PropTypes.string` HAVE the `.isRequired` property
- Required types like `PropTypes.string.isRequired` do NOT have it

```typescript
export function getPropTypeInfo(propType: any): PropTypeInfo {
  if (!propType) return { type: 'text', isRequired: false };

  // PropTypes logic is inverted - required types DON'T have .isRequired
  const isRequired = !('isRequired' in propType);
  const basePropType = propType;
  
  // Check for oneOf (enum/select)
  if (basePropType._propType === 'oneOf' || 
      (basePropType.type && basePropType.type._propType === 'oneOf')) {
    const values = basePropType.values || basePropType.type?.values || [];
    return { 
      type: 'select', 
      options: values,
      isRequired 
    };
  }
  
  // Check for shape (object)
  if (basePropType._propType === 'shape') {
    return { type: 'object', isRequired };
  }
  
  // Check basic types
  switch (basePropType.name) {
    case 'number':
      return { type: 'number', isRequired };
    case 'bool':
      return { type: 'checkbox', isRequired };
    case 'string':
    default:
      return { type: 'text', isRequired };
  }
}
```

### Form Field Generation

```typescript
function generateFormFieldFromPropType(
  propName: string, 
  propType: any
): FormField {
  const propInfo = getPropTypeInfo(propType);
  
  switch (propInfo.type) {
    case 'select':
      return {
        component: 'FormInput',
        props: {
          label: propName,
          type: 'text',
          list: `${propName}-options`,
          listItems: propInfo.options.join(', '),
        }
      };
      
    case 'number':
      return {
        component: 'FormInput',
        props: {
          label: propName,
          type: 'number',
        }
      };
      
    case 'checkbox':
      return {
        component: 'FormInput',
        props: {
          label: propName,
          type: 'checkbox',
        }
      };
      
    // ... other cases
  }
}
```

### Example: Callout Component

**PropTypes Definition:**
```typescript
Callout.propTypes = {
  style: PropTypes.oneOf(['default', 'boxed', 'boxed grid', 'full', 'grid', 'overlay', 'split']),
  layout: PropTypes.oneOf(['horizontal', 'vertical']),
  direction: PropTypes.oneOf(['left', 'right']),
  gridColumns: PropTypes.shape({
    left: PropTypes.number,
    right: PropTypes.number
  }),
  url: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  content: PropTypes.string,
};
```

**Generated Form Fields:**

| Property | PropType | Form Field Generated |
|----------|----------|---------------------|
| style | oneOf([...]) | Text input with datalist: "default, boxed, boxed grid, full, grid, overlay, split" |
| layout | oneOf([...]) | Text input with datalist: "horizontal, vertical" |
| direction | oneOf([...]) | Text input with datalist: "left, right" |
| gridColumns | shape({...}) | Text input with placeholder: "JSON object: {"left": 1, "right": 2}" |
| url | string | Text input |
| title | string | Text input |
| subtitle | string | Text input |
| content | string | Text input |

### Benefits

1. **Better UX** - Users see valid options instead of guessing
2. **Type Safety** - Prevents invalid values from being entered
3. **Self-Documenting** - Form reveals component API
4. **Automatic** - No manual form configuration needed
5. **Maintainable** - PropTypes are single source of truth

### Supported PropTypes

| PropType | Field Type | Notes |
|----------|-----------|-------|
| `PropTypes.string` | text input | Basic text field |
| `PropTypes.number` | number input | Numeric keyboard on mobile |
| `PropTypes.bool` | checkbox | True/false toggle |
| `PropTypes.oneOf([...])` | text + datalist | Dropdown-like suggestions |
| `PropTypes.shape({...})` | text input | Expects JSON string |
| `PropTypes.arrayOf(...)` | text input | Comma-separated values |
| `PropTypes.node` | disabled | Cannot edit in builder |
| `PropTypes.func` | disabled | Cannot edit in builder |
| `PropTypes.object` | text input | Generic JSON input |

### Value Parsing

When the form is submitted, values are automatically parsed:

```typescript
// Number inputs → parsed as floats
if (thisProp.type === 'number') {
  value = parseFloat(value) || value;
}

// Checkbox inputs → parsed as booleans
if (thisProp.type === 'checkbox') {
  value = thisProp.checked;
}

// JSON strings → parsed as objects
if (value.startsWith('{')) {
  try {
    value = JSON.parse(value);
  } catch (e) {
    // Keep as string if invalid
  }
}
```

---

## Complete Implementation Guide

### Step 1: Update Component Map

Add layout components to the component map:

```typescript
const componentMap = {
  "Page Header": PageTitleHeader,
  "Page Section Header": PageSectionHeader,
  "Callout": Callout,
  "Section Container": SectionContainer,
  "Grid Section": GridSection,
  "Flex Section": FlexSection,
  "Grid Item": PageGridItem,
  "Flex Item": PageFlexItem,
};

const layoutComponents = [
  'Section Container', 
  'Grid Section', 
  'Flex Section', 
  'Grid Item', 
  'Flex Item'
];
```

### Step 2: Update ComponentSelector

Add parentPath prop for nested components:

```typescript
ComponentSelector.propTypes = {
  setEditableComponent: PropTypes.func.isRequired,
  parentPath: PropTypes.string,
};
```

### Step 3: Update generateFieldJSON

Use PropTypes introspection:

```typescript
function generateFieldJSON(component: string) {
  const form = { fields: [] };
  
  // Component type field
  form.fields.push({ /* ... */ });
  
  // Parent path (if nesting)
  if (parentPath) {
    form.fields.push({
      component: 'FormInput',
      props: {
        name: '__parentPath',
        type: 'hidden',
        value: parentPath
      }
    });
  }
  
  // Introspect PropTypes
  const propTypes = componentMap[component].propTypes;
  for (const prop in propTypes) {
    if (prop === 'children') continue;
    const field = generateFormFieldFromPropType(prop, propTypes[prop]);
    form.fields.push(field);
  }
  
  // Submit button
  form.fields.push({ /* ... */ });
  
  return form;
}
```

### Step 4: Update PageEngine

Make it recursive:

```typescript
function renderComponent(componentData: any, index: number): React.JSX.Element {
  const componentType = componentMap[componentData.component];
  const componentProps = { ...componentData.props };
  
  // Recursively render children
  let children = null;
  if (componentData.children?.length > 0) {
    children = componentData.children.map((child, idx) => 
      renderComponent(child, idx)
    );
  }
  
  componentProps.key = generateKey();
  
  return children 
    ? React.createElement(componentType, componentProps, children)
    : React.createElement(componentType, componentProps);
}
```

### Step 5: Add Component Tree Viewer

Visual hierarchy display:

```typescript
function ComponentTree({ components, onSelectComponent, selectedPath }) {
  function renderTreeNode(component, index, path) {
    const currentPath = `${path}[${index}]`;
    const isSelected = currentPath === selectedPath;
    const hasChildren = component.children?.length > 0;
    
    return (
      <div style={{ marginLeft: '20px' }}>
        <div 
          onClick={() => onSelectComponent(component, currentPath)}
          style={{ 
            background: isSelected ? '#4CAF50' : '#f5f5f5',
            cursor: 'pointer',
          }}
        >
          {component.component}
          {hasChildren && ` (${component.children.length} children)`}
        </div>
        
        {hasChildren && (
          <div>
            {component.children.map((child, idx) => 
              renderTreeNode(child, idx, `${currentPath}.children`)
            )}
          </div>
        )}
      </div>
    );
  }
  
  return <div>{components.map((c, i) => renderTreeNode(c, i, 'root'))}</div>;
}
```

### Step 6: Update Main PageBuilder

Add state for selected component:

```typescript
const [selectedComponent, setSelectedComponent] = useState(null);
const [selectedPath, setSelectedPath] = useState('');

function handleSelectComponent(component, path) {
  setSelectedComponent(component);
  setSelectedPath(path);
}

return (
  <ComponentSelector 
    setEditableComponent={setEditableComponent}
    parentPath={selectedPath}
  />
  
  <ComponentTree 
    components={pageJSON.components}
    onSelectComponent={handleSelectComponent}
    selectedPath={selectedPath}
  />
);
```

---

## Advanced Use Cases

### Deeply Nested Layouts

```json
{
  "component": "Grid Section",
  "props": { "columns": 2 },
  "children": [
    {
      "component": "Flex Section",
      "props": { "direction": "column" },
      "children": [
        { "component": "Page Header", "props": {...} },
        { "component": "Callout", "props": {...} }
      ]
    },
    {
      "component": "Grid Item",
      "props": { "columnSpan": 1 },
      "children": [
        { "component": "Callout", "props": {...} }
      ]
    }
  ]
}
```

### Complex PropTypes

For more complex PropTypes like arrayOf with specific shapes:

```typescript
PropTypes.arrayOf(
  PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.number
  })
)
```

You can extend `getPropTypeInfo` to handle these cases and generate JSON schema documentation in the placeholder text.

---

## Testing the Enhanced Page Builder

1. **Test PropTypes Introspection**
   - Select "Callout" component
   - Verify `style` field shows datalist with: default, boxed, grid, etc.
   - Verify `layout` field shows: horizontal, vertical
   - Type a value and see autocomplete suggestions

2. **Test Nested Components**
   - Add a Grid Section (columns: 3)
   - Click on Grid Section in tree (it highlights)
   - Notice "Adding child to: root[xxx]" message
   - Add 3 Callout components
   - See them appear under Grid Section in tree
   - Verify preview shows 3 callouts in a grid

3. **Test Deep Nesting**
   - Create: Grid Section → Flex Section → Callouts
   - Verify tree shows proper hierarchy
   - Verify preview renders correctly

4. **Test JSON Structure**
   - Check Page JSON shows nested `children` arrays
   - Verify paths are unique
   - Confirm structure matches tree view

---

## Future Enhancements

1. **Drag & Drop** - Reorder components in tree
2. **Copy/Paste** - Duplicate component subtrees
3. **Templates** - Save common patterns
4. **Import/Export** - Share page configurations
5. **Undo/Redo** - Edit history
6. **Visual Editor** - Direct manipulation in preview
7. **PropTypes Documentation** - Show descriptions from JSDoc comments
8. **Validation** - Real-time PropTypes validation
9. **Default Values** - Pre-populate from defaultProps

---

## API Reference

### ComponentSelector Props

| Prop | Type | Description |
|------|------|-------------|
| setEditableComponent | func | Callback to set form fields |
| parentPath | string | Path of parent for nesting (optional) |

### PageEngine Props

| Prop | Type | Description |
|------|------|-------------|
| pageData | object | Page configuration with components array |

### ComponentTree Props

| Prop | Type | Description |
|------|------|-------------|
| components | array | Array of component nodes |
| onSelectComponent | func | Callback when component selected |
| selectedPath | string | Currently selected component path |

---

## Troubleshooting

**Q: PropTypes not generating correct fields**
A: Ensure component has `Component.propTypes = {...}` defined before it's added to componentMap.

**Q: Children not appearing in preview**
A: Check that PageEngine's renderComponent recursively processes children array.

**Q: Can't add children to layout component**
A: Verify component is in `layoutComponents` array and has been selected in tree.

**Q: Path tracking errors**
A: Ensure each component gets unique path with timestamp: `root[${Date.now()}]`

**Q: Form values not parsing correctly**
A: Check generateComponentObject handles type conversions (number, boolean, JSON).
