# PageBuilder Architecture

## Overview

PageBuilder V2 is a modular page builder featuring clean separation of concerns. The codebase is organized into focused modules with clear responsibilities and minimal dependencies.

## Directory Structure

```
src/components/pagebuilder/
├── lib/                              # Pure utility functions (no React)
│   ├── types.ts                      # TypeScript type definitions
│   ├── componentMap.ts               # Component registry
│   ├── componentMetadata.ts          # Form field metadata
│   ├── propTypeIntrospection.ts      # PropTypes analysis
│   ├── componentGeneration.ts        # Form generation logic
│   ├── pageStorage.ts                # File I/O operations
│   ├── pageStorageTypes.ts           # Storage types
│   └── index.ts                      # Public exports
├── components/                        # React components
│   ├── PageEngine.tsx                # Component renderer (preview)
│   ├── ComponentSelector.tsx         # Component type picker
│   ├── ComponentPropertiesForm.tsx   # Property editor wrapper
│   ├── SaveLoadSection.tsx           # Save/load/delete UI
│   └── PageBuilderUI.tsx             # Main orchestrator
├── usePageBuilder.ts                 # State management hook
├── pagebuilder.scss                  # Shared styles
└── documentation/                     # Documentation files
    ├── README.md                     # Overview and quick start
    ├── architecture.md               # This file
    ├── features.md                   # Feature documentation
    ├── api-reference.md              # API documentation
    └── implementation.md             # Setup guide
```

## Module Dependency Graph

```
PageBuilderUI
├─> usePageBuilder
│     └─> componentGeneration
│           ├─> propTypeIntrospection
│           │     └─> componentMetadata
│           └─> componentMap
├─> SaveLoadSection
├─> ComponentSelector
│     ├─> componentMap
│     └─> componentGeneration
├─> ComponentPropertiesForm
└─> PageEngine
      └─> componentMap
```

## Module Descriptions

### Lib Modules (Pure Functions)

#### `lib/types.ts`
Core TypeScript interfaces providing type safety.

**Key Types:**
```typescript
interface ComponentData {
  component: string;
  props: Record<string, any>;
  children?: ComponentData[];
}

interface PageData {
  components: ComponentData[];
}

interface EditMode {
  path: string;
  component: ComponentData;
}

interface PropTypeInfo {
  type: 'text' | 'number' | 'checkbox' | 'select' | ...;
  options?: string[];
  isRequired: boolean;
}

interface FormField {
  component: string;
  props: Record<string, any>;
}
```

#### `lib/componentMap.ts`
Central registry of available components.

**Exports:**
- `componentMap` - Maps component names to React components
- `layoutComponents` - Array of components that can have children

**Example:**
```typescript
export const componentMap = {
  'Callout': Callout,
  'PageSection': PageSection,
  // ...
};

export const layoutComponents = ['PageSection', 'PageGridItem', 'PageFlexItem'];
```

**To Add New Components:**
1. Import component
2. Add to `componentMap`
3. If container, add to `layoutComponents`

#### `lib/componentMetadata.ts`
Metadata for form field generation, imports const arrays from component files.

**Structure:**
```typescript
import { CALLOUT_STYLES, SHAPES } from '../../callout/pixelated.callout';

export const componentMetadata = {
  'Callout': {
    style: { type: 'select', options: CALLOUT_STYLES, default: 'default' },
    imgShape: { type: 'select', options: SHAPES, default: 'square' },
    title: { type: 'text' },
    // ...
  },
  // ...
};
```

#### `lib/propTypeIntrospection.ts`
Analyzes PropTypes to generate form fields.

**Key Functions:**
- `getPropTypeInfo(propType, componentName, propName)` - Analyzes PropType, checks metadata
- `generateFormFieldFromPropType(propName, propType, value, componentName)` - Creates FormField

**Logic:**
1. Check `componentMetadata` first (for oneOf fields)
2. Analyze PropType structure (name, isRequired, etc.)
3. Return appropriate field type

**PropType Mappings:**
- `oneOf` + metadata → FormSelect with options
- `number` → FormInput type="number"
- `bool` → FormInput type="checkbox"
- `string` → FormInput type="text"

#### `lib/componentGeneration.ts`
Generates form data from component selection.

**Key Functions:**
- `generateFieldJSON(component, existingProps, parentPath)` - Creates complete form
- `generateComponentObject(event)` - Extracts component data from form submission

**Process:**
1. Create form structure with metadata
2. Add hidden type field
3. Add parent path (if nested)
4. Introspect PropTypes to generate fields
5. Add submit button

#### `lib/pageStorage.ts`
Server-side file I/O operations for save/load functionality.

**Key Functions:**
- `validatePageName(name)` - Validates filename (alphanumeric, dash, underscore)
- `listPages()` - Returns array of saved page names
- `loadPage(name)` - Loads page JSON from file
- `savePage(name, data)` - Writes page JSON to file
- `deletePage(name)` - Deletes page file

**Storage Location:** `public/data/pages/` (configurable via `PAGES_DIR` env var)

**Features:**
- Automatic directory creation
- Pretty JSON formatting
- Error handling with descriptive messages

#### `lib/pageStorageTypes.ts`
TypeScript interfaces for storage operations.

**Types:**
- `SavePageRequest` - Save request body
- `SavePageResponse` - Save response
- `LoadPageResponse` - Load response
- `ListPagesResponse` - List response
- `DeletePageResponse` - Delete response

### React Components

#### `components/PageBuilderUI.tsx`
Main orchestrator composing all sub-components.

**Responsibilities:**
- Renders two-column layout
- Passes state and handlers to child components
- Manages component selection, editing, and preview

**Layout:**
```
┌─────────────────┬───────────────────────┐
│ Component Editor│   Page Preview        │
├─────────────────┤                       │
│ Save/Load       │                       │
│ Component       │   PageEngine          │
│ Selector        │   (with edit UI)      │
│ Properties      │                       │
│ Form            │                       │
│ Page JSON       │                       │
└─────────────────┴───────────────────────┘
```

**Props:** None (uses `usePageBuilder` hook)

#### `components/SaveLoadSection.tsx`
UI for saving, loading, and deleting pages.

**Features:**
- Text input for page name
- Save button (calls `/api/pagebuilder/save`)
- Load button (shows dropdown of saved pages)
- Delete button per page
- Success/error messages
- Loading states

**Props:**
- `pageData` - Current page JSON
- `onLoad` - Callback when page is loaded

#### `components/ComponentSelector.tsx`
Dropdown for selecting component type.

**Features:**
- Dropdown with all available components
- Auto-generates form when component selected
- Handles edit mode (pre-populates form)
- Shows info box when adding child

**Props:**
- `setEditableComponent` - Callback to set form data
- `parentPath` - Optional path for nested components
- `editMode` - Optional edit mode state

#### `components/ComponentPropertiesForm.tsx`
Wrapper for FormEngine to display properties.

**Responsibilities:**
- Renders FormEngine with generated form data
- Shows placeholder when no component selected
- Handles form submission

**Props:**
- `editableComponent` - Form data object
- `onSubmit` - Form submission handler

#### `components/PageEngine.tsx`
Renders components from JSON with optional edit UI.

**Features:**
- Recursive component rendering
- Conditional edit mode (borders, hover, buttons)
- Floating action buttons (edit, add child, delete)
- Selected component highlighting

**Props:**
- `pageData` - Page JSON structure
- `editMode` - Boolean to show/hide edit UI
- `selectedPath` - Path to highlight selected component
- `onEditComponent` - Edit button handler
- `onSelectComponent` - Add child button handler
- `onDeleteComponent` - Delete button handler

**Edit UI Elements:**
- `.pagebuilder-component-wrapper` - Border and padding
- `.pagebuilder-actions` - Floating button container
- `.selected` - Green highlight for selected component

### State Management

#### `usePageBuilder.ts`
Custom hook managing all PageBuilder state.

**State:**
- `pageJSON` - Current page structure
- `editableComponent` - Form data for selected component
- `selectedPath` - Path to component for adding children
- `editMode` - Edit state (component + path)

**Handlers:**
- `handleAddNewComponent(event)` - Adds or updates component
- `handleSelectComponent(component, path)` - Selects component for adding child
- `handleEditComponent(component, path)` - Loads component for editing
- `handleDeleteComponent(path)` - Removes component
- `cancelEdit()` - Clears edit mode
- `clearSelection()` - Clears selected path

**Returns:**
- All state values
- All state setters (for external updates)
- All handler functions

## Data Flow

### Adding a New Component

```
1. User selects component type
   └─> ComponentSelector calls generateFieldJSON()
       └─> Creates form with PropTypes-based fields
           └─> Passes to ComponentPropertiesForm

2. User fills form and clicks "Add"
   └─> Form submits to handleAddNewComponent()
       └─> Calls generateComponentObject() to extract data
           └─> Updates pageJSON state
               └─> PageEngine re-renders with new component
```

### Editing a Component

```
1. User clicks ✏️ edit button
   └─> PageEngine calls onEditComponent(component, path)
       └─> usePageBuilder sets editMode
           └─> ComponentSelector auto-generates form with values
               └─> User edits and submits
                   └─> handleAddNewComponent() updates at path
                       └─> PageEngine re-renders
```

### Adding a Child Component

```
1. User clicks ➕ child button
   └─> PageEngine calls onSelectComponent(component, path)
       └─> usePageBuilder sets selectedPath
           └─> ComponentSelector shows "Adding child" info
               └─> Selected component gets green highlight
                   └─> User selects type and fills form
                       └─> Component added to children array
```

### Saving a Page

```
1. User enters name and clicks 💾 Save
   └─> SaveLoadSection calls /api/pagebuilder/save
       └─> API route calls pageStorage.savePage()
           └─> Writes JSON to public/data/pages/
               └─> Returns success message
                   └─> UI shows confirmation
```

## Design Principles

### 1. Separation of Concerns
- **Lib modules**: Pure functions, no React dependencies
- **Components**: UI only, delegate logic to hooks/lib
- **Hooks**: State management, no UI

### 2. Single Source of Truth
- Component files export const arrays
- PropTypes use these arrays
- componentMetadata imports these arrays
- TypeScript types generated via InferProps

### 3. Type Safety
- TypeScript interfaces for all data structures
- PropTypes for runtime validation
- InferProps for type generation

### 4. Modularity
- Small, focused modules
- Clear dependencies
- Easy to test and maintain

### 5. Extensibility
- Add components via componentMap
- Add metadata via componentMetadata
- Custom form fields via propTypeIntrospection

## Performance Considerations

- **Form generation**: Happens once per component selection
- **PropTypes introspection**: Cached in metadata
- **Component rendering**: React's virtual DOM handles efficiently
- **File I/O**: Server-side only, doesn't block client

## Future Enhancements

- **Undo/Redo**: Add history stack to usePageBuilder
- **Drag & Drop**: Implement drag-to-reorder
- **Component Preview**: Thumbnail previews in selector
- **Template Library**: Pre-built page templates
- **Export/Import**: Bulk page management
- **Versioning**: Track page version history
