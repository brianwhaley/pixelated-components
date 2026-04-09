# PageBuilder V2 - Architecture Guide

## Overview

PageBuilder V2 is a complete refactor featuring modular architecture with clean separation of concerns. The 778-line monolithic file has been split into 11 focused modules.

## Directory Structure

```
pagebuilder-v2/
├── page.tsx (17 lines)                    # Entry point
└── pagebuilder/
    ├── lib/                               # Pure utility functions
    │   ├── types.ts                       # TypeScript interfaces
    │   ├── componentMap.ts                # Component registry
    │   ├── propTypeIntrospection.ts       # PropTypes → form fields
    │   └── componentGeneration.ts         # Form data extraction
    ├── components/                         # React components
    │   ├── PageEngine.tsx                 # Preview renderer
    │   ├── ComponentTree.tsx              # Hierarchical tree viewer
    │   ├── ComponentSelector.tsx          # Component type selector
    │   ├── ComponentPropertiesForm.tsx    # Form wrapper
    │   └── PageBuilderUI.tsx              # Main orchestrator
    ├── usePageBuilder.ts                  # State management hook
    └── documentation/                      # Documentation files
        ├── README.md                      # Feature summary
        ├── architecture.md                # This file
        ├── documentation.md               # Technical details
        ├── implementation-guide.md        # Legacy guide
        └── visual-guide.md                # UI screenshots
```

## Module Dependency Graph

```
page.tsx
  └─> PageBuilderUI
        ├─> usePageBuilder
        │     └─> lib/componentGeneration
        │           ├─> lib/types
        │           ├─> lib/componentMap
        │           └─> lib/propTypeIntrospection
        │                 └─> lib/types
        ├─> ComponentSelector
        │     ├─> lib/componentMap
        │     └─> lib/componentGeneration
        ├─> ComponentPropertiesForm
        ├─> ComponentTree
        │     └─> lib/componentMap
        └─> PageEngine
              └─> lib/componentMap
```

## Module Descriptions

### Entry Point

#### `page.tsx` (17 lines)
Minimal Next.js page component.

```typescript
import { PageBuilderUI } from './pagebuilder/components/PageBuilderUI';

export default function PageBuilder() {
  return <PageBuilderUI />;
}
```

### Lib Modules (Pure Functions)

#### `lib/types.ts`
TypeScript interfaces providing type safety across the application.

**Key Types:**
- `ComponentData` - Component structure with props, children, path
- `PageData` - Root page structure
- `EditMode` - Edit state structure
- `PropTypeInfo` - PropTypes analysis result
- `FormField` - Form field configuration
- `FormData` - Complete form structure

#### `lib/componentMap.ts`
Central registry of available components.

**Exports:**
- `componentMap` - Object mapping names to component types
- `layoutComponents` - Array of components that can have children
- `componentTypes` - Comma-separated string of all component names
- `isLayoutComponent()` - Helper to check if component supports children
- `getComponentType()` - Helper to get component from registry

**To add new components:**
1. Import the component
2. Add to `componentMap` object
3. If it's a container, add to `layoutComponents` array

#### `lib/propTypeIntrospection.ts`
Analyzes PropTypes to generate appropriate form fields.

**Key Functions:**
- `getPropTypeInfo(propType)` - Analyzes PropType structure
  - Returns: `{ type, options, isRequired, elementType }`
  - Handles: oneOf, shape, arrayOf, basic types
  - **Important:** PropTypes has inverted logic for isRequired!
- `generateFormFieldFromPropType(propName, propType, value)` - Creates form field config
  - Returns: `{ component, props }`
  - Generates: select, number, checkbox, text, etc.

**PropTypes Logic:**
```typescript
// INVERTED LOGIC!
const isRequired = !('isRequired' in propType);

// Optional: PropTypes.string (HAS .isRequired property)
// Required: PropTypes.string.isRequired (NO .isRequired property)
```

**Supported PropTypes:**
| PropType | Generated Field | Notes |
|----------|-----------------|-------|
| `oneOf([...])` | Text with datalist | Dropdown suggestions |
| `number` | Number input | With ↑↓ controls |
| `bool` | Checkbox | ☑ / ☐ |
| `shape({...})` | Text input | JSON placeholder |
| `arrayOf(...)` | Text input | Comma-separated |
| `string` | Text input | Standard |
| `func` | Disabled text | Not editable |
| `node/element` | Disabled text | Use children instead |

#### `lib/componentGeneration.ts`
Handles form data extraction and component object creation.

**Key Functions:**
- `generateComponentObject(event)` - Extracts data from form submission
  - Parses JSON objects
  - Converts types (numbers, booleans)
  - Extracts parentPath
  - Creates component with children array
  - Generates unique path: `root[timestamp]` or `parent.children[timestamp]`
- `generateFieldJSON(component, existingProps, parentPath)` - Creates form configuration
  - Adds type field (disabled, shows component name)
  - Adds hidden __parentPath field if nesting
  - Introspects PropTypes for each prop
  - Adds submit button ("Add" or "Update")

### React Components

#### `components/PageEngine.tsx`
Recursively renders component tree for live preview.

**How it works:**
```typescript
function renderComponent(componentData, index) {
  // Get component type from registry
  const componentType = componentMap[componentData.component];
  
  // Recursively render children
  if (componentData.children?.length > 0) {
    children = componentData.children.map(renderComponent);
  }
  
  // Create React element dynamically
  return React.createElement(componentType, props, children);
}
```

**Features:**
- Handles nested components recursively
- Generates unique keys
- Cleans props (removes `type` field)
- Falls back to error message for unknown components

#### `components/ComponentTree.tsx`
Displays hierarchical tree with visual indicators.

**Features:**
- Indentation shows nesting depth
- Color coding:
  - Green background: selected for adding children
  - Orange background: editing mode
  - Blue border: layout component
  - Gray background: regular component
- Icons:
  - 📦 for layout components
  - Child count displayed: "(3 children)"
- Buttons:
  - ✏️ Edit (blue) - for all components
  - ➕ Child (green) - only for layout components
- Recursive rendering for nested children

#### `components/ComponentSelector.tsx`
Two-phase component selection with auto-generated forms.

**Phase 1:** Select component type
- Shows dropdown with all available components
- User selects and clicks "Select Component"

**Phase 2:** Configure properties
- Auto-generates form based on component's PropTypes
- Uses `generateFieldJSON()` from lib
- Handles edit mode (pre-populates values)
- Uses stable key tracking to prevent infinite re-renders

**Edit Mode Handling:**
```typescript
useEffect(() => {
  if (editMode?.component) {
    const editKey = `${component}-${JSON.stringify(props)}`;
    if (editKey !== lastEditMode) {
      // Generate form with existing values
      const form = generateFieldJSON(component, props, parentPath);
      setEditableComponent(form);
      setLastEditMode(editKey);
    }
  }
}, [editMode, lastEditMode]);
```

#### `components/ComponentPropertiesForm.tsx`
Simple wrapper around FormEngine.

**Purpose:**
- Shows FormEngine when form data exists
- Shows placeholder text when no component selected
- Keeps PageBuilderUI cleaner

#### `components/PageBuilderUI.tsx`
Main orchestrator composing all sub-components.

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Row 2-column layout                                     │
├────────────────────┬────────────────────┬───────────────┤
│ Component Selector │ Component Tree     │               │
│                    │ ├─ Clear Selection │               │
│ Component          │ └─ Cancel Edit     │               │
│ Properties Form    │                    │ Live Preview  │
│                    │ Page JSON (collapsible)            │
│                    │                    │               │
└────────────────────┴────────────────────┴───────────────┘
   Column 1             Column 2            Full Width
```

**Responsibilities:**
- Imports usePageBuilder hook
- Renders ComponentSelector with callbacks
- Renders ComponentPropertiesForm
- Renders action buttons (Clear/Cancel)
- Renders ComponentTree
- Renders collapsible Page JSON viewer
- Renders PageEngine for live preview

### State Management

#### `usePageBuilder.ts`
Custom hook encapsulating all state and business logic.

**State:**
- `pageJSON` - Complete page structure with components
- `editableComponent` - Current form configuration
- `selectedPath` - Path of selected component (for adding children)
- `editMode` - Current component being edited (path + component data)

**Handlers:**
- `handleAddNewComponent(event)` - Adds new or updates existing component
  - Checks if in edit mode
  - If editing: navigates to component path, preserves children, updates
  - If adding: adds to root or parent's children based on selectedPath
- `handleSelectComponent(component, path)` - Toggles component selection
  - Used for adding children to layout components
  - Highlights selected component in tree
- `handleEditComponent(component, path)` - Loads component for editing
  - Sets edit mode
  - ComponentSelector auto-generates pre-populated form
- `clearSelection()` - Clears selectedPath
- `cancelEdit()` - Exits edit mode, clears form

**Path Navigation:**
```typescript
// Splitting path: "root[0].children[1].children[2]"
const pathParts = path.split(/[.[\]]/).filter(p => p);
// Result: ['root', '0', 'children', '1', 'children', '2']

// Navigate through nested structure
let current = { components: pageJSON.components };
for (const part of pathParts) {
  if (part === 'root') current = current.components;
  else if (part === 'children') continue;
  else current = current[parseInt(part)];
}
```

## Data Flow

### Adding a New Component

```
User selects "Grid Section"
  ↓
ComponentSelector.handlePhaseOneSubmit()
  ↓
generateFieldJSON("Grid Section")
  ↓
Introspects GridSection.propTypes
  ↓
Generates form fields (columns: number, gap: text, etc.)
  ↓
FormEngine renders form
  ↓
User fills form and submits
  ↓
handleAddNewComponent(event)
  ↓
generateComponentObject(event)
  ↓
Extracts: { component: "Grid Section", props: {...}, children: [] }
  ↓
Adds to pageJSON.components
  ↓
ComponentTree re-renders showing new component
  ↓
PageEngine renders live preview
```

### Adding a Child Component

```
User clicks ➕ Child button on Grid Section
  ↓
handleSelectComponent(component, "root[0]")
  ↓
setSelectedPath("root[0]")
  ↓
ComponentSelector receives parentPath="root[0]"
  ↓
User selects "Callout"
  ↓
generateFieldJSON("Callout", undefined, "root[0]")
  ↓
Adds hidden field: <input type="hidden" name="__parentPath" value="root[0]" />
  ↓
User fills form and submits
  ↓
handleAddNewComponent(event)
  ↓
generateComponentObject(event) extracts parentPath="root[0]"
  ↓
Navigates to root[0] in tree
  ↓
Pushes new Callout to root[0].children
  ↓
ComponentTree shows Grid Section with nested Callout
  ↓
PageEngine recursively renders Grid Section → Callout
```

### Editing an Existing Component

```
User clicks ✏️ Edit on a Callout
  ↓
handleEditComponent(component, "root[1]")
  ↓
setEditMode({ path: "root[1]", component: {...} })
  ↓
ComponentSelector useEffect detects editMode change
  ↓
generateFieldJSON("Callout", existingProps)
  ↓
Form fields pre-populated with current values
  ↓
FormEngine renders with defaultValue props
  ↓
User modifies and submits
  ↓
handleAddNewComponent(event) detects editMode
  ↓
Navigates to root[1]
  ↓
Preserves children if it's a layout component
  ↓
Replaces component at root[1] with updated version
  ↓
Clears editMode
  ↓
Tree and preview update
```

## Benefits of Refactored Architecture

### Separation of Concerns
- **Lib modules** contain pure functions (easy to test)
- **Components** focus on UI and user interaction
- **Hook** manages state and business logic
- **Entry point** is minimal and clean

### Maintainability
- 778 lines → 11 focused files (~70 lines average)
- Each file has single responsibility
- Easy to locate and fix bugs
- Clear module boundaries

### Reusability
- Lib functions can be imported elsewhere
- Components can be used independently
- Hook can be extended or customized
- Component registry is centralized

### Testability
- Pure functions in lib/ are trivial to unit test
- Components can be tested in isolation
- Mock the hook for component testing
- Integration tests can use the whole UI

### Type Safety
- Centralized types in lib/types.ts
- TypeScript interfaces prevent errors
- InferProps ensures PropTypes match types
- Compiler catches type mismatches

### Extensibility
- Add new components to componentMap
- Add new PropTypes handlers
- Extend usePageBuilder hook
- Create new views using same data

## Future Enhancements

### Potential Additions
- **Save/Load** - Persist pageJSON to backend or localStorage
- **Undo/Redo** - History tracking with state snapshots
- **Drag & Drop** - Visual component arrangement
- **Component Library** - Searchable component browser
- **Templates** - Pre-built page layouts
- **Export** - Generate JSX or JSON for production use
- **Validation** - Real-time error checking
- **Theming** - Live theme switching
- **Responsive Preview** - Mobile/tablet/desktop views

### Recommended Structure for Additions
```
pagebuilder/
├── lib/
│   └── storage.ts        # Save/load logic
├── components/
│   ├── HistoryPanel.tsx  # Undo/redo UI
│   └── TemplateLibrary.tsx
├── hooks/
│   ├── usePageBuilder.ts
│   ├── useHistory.ts     # Undo/redo state
│   └── useStorage.ts     # Persistence
└── utils/
    └── export.ts         # JSX generation
```

## Troubleshooting

### Common Issues

**Form fields are disabled/locked:**
- Check that you're using uncontrolled inputs (defaultValue, not value)
- Verify FormEngine is receiving correct field configuration

**Required field detection is wrong:**
- Remember PropTypes has inverted logic!
- Check `!('isRequired' in propType)` in getPropTypeInfo

**Component not appearing in dropdown:**
- Verify it's in componentMap
- Check componentTypes string is generated

**Children not nesting:**
- Verify component is in layoutComponents array
- Check that path is being passed correctly
- Debug path navigation logic

**Edit mode not working:**
- Check editMode state structure
- Verify useEffect dependencies
- Look for infinite re-render loops

### Debugging Tips

**Enable logging:**
```typescript
// In usePageBuilder.ts
console.log('Adding component:', newComponent);
console.log('Current path:', selectedPath);
console.log('Edit mode:', editMode);
```

**Inspect pageJSON:**
```typescript
// The collapsible Page JSON viewer shows the current state
// Use browser DevTools to inspect the structure
```

**React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state
- Track re-renders with profiler

**TypeScript:**
- Check for type errors in Problems panel
- Hover over variables to see inferred types
- Use "Go to Definition" to trace data flow

## Conclusion

PageBuilder V2 demonstrates modern React best practices:
- Modular architecture with clear boundaries
- Custom hooks for state management
- Pure functions for business logic
- Type safety with TypeScript
- Component composition
- Separation of concerns

The refactored structure is production-ready, maintainable, and extensible.
