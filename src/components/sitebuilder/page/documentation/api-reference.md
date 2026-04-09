# PageBuilder API Reference

## Components

### PageBuilderUI

Main orchestrator component that composes all PageBuilder functionality.

**Import:**
```typescript
import { PageBuilderUI } from '@pixelated-tech/components';
```

**Usage:**
```typescript
export default function PageBuilderPage() {
  return <PageBuilderUI />;
}
```

**Props:** None (uses internal `usePageBuilder` hook)

---

### PageEngine

Renders components from JSON with optional edit UI.

**Import:**
```typescript
import { PageEngine } from '@pixelated-tech/components';
```

**Props:**
```typescript
interface PageEngineProps {
  pageData: PageData;              // Required: Page structure
  editMode?: boolean;               // Optional: Show edit UI (default: false)
  selectedPath?: string;            // Optional: Highlight selected component
  onEditComponent?: (component, path) => void;    // Optional: Edit handler
  onSelectComponent?: (component, path) => void;  // Optional: Select handler
  onDeleteComponent?: (path) => void;             // Optional: Delete handler
}
```

**Usage:**
```typescript
// Display mode (production)
<PageEngine pageData={pageData} />

// Edit mode (PageBuilder)
<PageEngine 
  pageData={pageData}
  editMode={true}
  selectedPath={selectedPath}
  onEditComponent={handleEdit}
  onSelectComponent={handleSelect}
  onDeleteComponent={handleDelete}
/>
```

---

### SaveLoadSection

UI for saving, loading, and deleting pages.

**Import:**
```typescript
import { SaveLoadSection } from '@pixelated-tech/components/pagebuilder/components/SaveLoadSection';
```

**Props:**
```typescript
interface SaveLoadSectionProps {
  pageData: PageData;              // Required: Current page data
  onLoad: (data: PageData) => void; // Required: Load handler
}
```

**Usage:**
```typescript
<SaveLoadSection 
  pageData={pageJSON}
  onLoad={handleLoadPage}
/>
```

---

## Hooks

### usePageBuilder

State management hook for PageBuilder functionality.

**Import:**
```typescript
import { usePageBuilder } from '@pixelated-tech/components/pagebuilder/usePageBuilder';
```

**Returns:**
```typescript
{
  // State
  pageJSON: PageData;
  editableComponent: any;
  selectedPath: string;
  editMode: EditMode | null;
  
  // Setters
  setPageJSON: (data: PageData) => void;
  setEditableComponent: (component: any) => void;
  setSelectedPath: (path: string) => void;
  setEditMode: (mode: EditMode | null) => void;
  
  // Handlers
  handleAddNewComponent: (event: Event) => void;
  handleSelectComponent: (component: ComponentData, path: string) => void;
  handleEditComponent: (component: ComponentData, path: string) => void;
  clearSelection: () => void;
  cancelEdit: () => void;
  handleDeleteComponent: (path: string) => void;
}
```

**Usage:**
```typescript
function MyPageBuilder() {
  const {
    pageJSON,
    setPageJSON,
    handleAddNewComponent,
    // ...other values
  } = usePageBuilder();
  
  // Use state and handlers
}
```

---

## Library Functions

### Storage Functions

**Import:**
```typescript
import { 
  listPages, 
  loadPage, 
  savePage, 
  deletePage,
  validatePageName 
} from '@pixelated-tech/components/pagebuilder/lib/pageStorage';
```

#### `listPages()`
Returns array of saved page names.

```typescript
async function listPages(): Promise<ListPagesResponse>

// Response
interface ListPagesResponse {
  success: boolean;
  pages: string[];
  message?: string;
}

// Usage
const result = await listPages();
if (result.success) {
  console.log(result.pages); // ['home', 'about', 'contact']
}
```

#### `loadPage(name)`
Loads page JSON from file.

```typescript
async function loadPage(name: string): Promise<LoadPageResponse>

// Response
interface LoadPageResponse {
  success: boolean;
  data?: PageData;
  message?: string;
}

// Usage
const result = await loadPage('home');
if (result.success) {
  console.log(result.data); // PageData object
}
```

#### `savePage(name, data)`
Saves page JSON to file.

```typescript
async function savePage(name: string, data: PageData): Promise<SavePageResponse>

// Response
interface SavePageResponse {
  success: boolean;
  message: string;
  filename?: string;
}

// Usage
const result = await savePage('home', pageData);
if (result.success) {
  console.log(result.message); // "Page saved successfully"
}
```

#### `deletePage(name)`
Deletes page file.

```typescript
async function deletePage(name: string): Promise<DeletePageResponse>

// Response
interface DeletePageResponse {
  success: boolean;
  message: string;
}

// Usage
const result = await deletePage('home');
if (result.success) {
  console.log(result.message); // "Page deleted successfully"
}
```

#### `validatePageName(name)`
Validates page name format.

```typescript
function validatePageName(name: string): boolean

// Usage
if (validatePageName('my-page')) {
  // Valid: alphanumeric, dash, underscore
}
```

---

## Types

### PageData

```typescript
interface PageData {
  components: ComponentData[];
}
```

### ComponentData

```typescript
interface ComponentData {
  component: string;              // Component name (e.g., "Callout")
  props: Record<string, any>;     // Component properties
  children?: ComponentData[];     // Optional nested components
}
```

### EditMode

```typescript
interface EditMode {
  path: string;                   // Component path (e.g., "root[0].children[1]")
  component: ComponentData;       // Component data
}
```

### PropTypeInfo

```typescript
interface PropTypeInfo {
  type: 'text' | 'number' | 'checkbox' | 'select' | 'json' | 'array' | 'function' | 'children';
  options?: string[];             // For select type
  isRequired: boolean;
}
```

### FormField

```typescript
interface FormField {
  component: string;              // Form component name (e.g., "FormInput")
  props: Record<string, any>;     // Form field props
}
```

---

## Environment Variables

### PAGES_DIR

Storage location for saved pages.

**Default:** `public/data/pages`

**Usage:**
```env
# .env.local
PAGES_DIR=public/data/pages
```

**Alternative locations:**
- `src/app/data/pages` - Not publicly accessible
- `data/pages` - Project root
- Any custom path

---

## CSS Classes

### PageBuilder Styles

Import in your component:
```typescript
import '@pixelated-tech/components/pagebuilder/components/pagebuilder.scss';
```

**Available classes:**
- `.pagebuilder-component-wrapper` - Component container with border/padding
- `.pagebuilder-component-wrapper.selected` - Selected component (green highlight)
- `.pagebuilder-component-wrapper:hover` - Hover state (blue highlight)
- `.pagebuilder-actions` - Floating action button container
- `.edit-btn` - Edit button (blue)
- `.child-btn` - Add child button (green)
- `.delete-btn` - Delete button (red)

---

## API Routes (Next.js)

### Endpoints

**Base path:** `/api/pagebuilder/`

#### GET `/api/pagebuilder/list`
Lists all saved pages.

**Response:**
```typescript
{
  success: boolean;
  pages: string[];
  message?: string;
}
```

#### GET `/api/pagebuilder/load?name={pageName}`
Loads a specific page.

**Query params:**
- `name` - Page name (required)

**Response:**
```typescript
{
  success: boolean;
  data?: PageData;
  message?: string;
}
```

#### POST `/api/pagebuilder/save`
Saves a page.

**Body:**
```typescript
{
  name: string;
  data: PageData;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  filename?: string;
}
```

#### DELETE `/api/pagebuilder/delete?name={pageName}`
Deletes a page.

**Query params:**
- `name` - Page name (required)

**Response:**
```typescript
{
  success: boolean;
  message: string;
}
```

---

## Component Registry

### Adding New Components

**1. Import component:**
```typescript
// lib/componentMap.ts
import { MyComponent } from '../../mycomponent/MyComponent';
```

**2. Add to componentMap:**
```typescript
export const componentMap = {
  // ...existing
  'MyComponent': MyComponent,
};
```

**3. If container, add to layoutComponents:**
```typescript
export const layoutComponents = [
  'PageSection',
  'PageGridItem',
  'PageFlexItem',
  'MyComponent',  // If it accepts children
];
```

**4. Add metadata:**
```typescript
// lib/componentMetadata.ts
import { MY_OPTIONS } from '../../mycomponent/MyComponent';

export const componentMetadata = {
  'MyComponent': {
    variant: { type: 'select', options: MY_OPTIONS },
    title: { type: 'text' },
    count: { type: 'number' },
  }
};
```

---

## Error Handling

All API responses follow consistent format:

**Success:**
```typescript
{
  success: true,
  ...data
}
```

**Error:**
```typescript
{
  success: false,
  message: "Error description"
}
```

**Client-side checking:**
```typescript
const result = await fetch('/api/pagebuilder/load?name=home');
const json = await result.json();

if (json.success) {
  // Handle success
} else {
  // Handle error with json.message
}
```
