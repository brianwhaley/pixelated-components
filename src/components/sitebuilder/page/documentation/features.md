# PageBuilder Features

## Overview

The PageBuilder includes three major features that work together to provide a powerful visual page construction experience.

---

## Feature 1: PropTypes Introspection

### Problem

Originally, all component properties displayed as generic text inputs, requiring users to manually type values and remember valid options for each field.

### Solution

Automatically generate appropriate form fields based on component PropTypes, providing:
- Dropdowns for `oneOf` fields with autocomplete
- Number inputs with increment/decrement for numbers
- Checkboxes for booleans
- Validated inputs for strings

### Implementation: Single Source of Truth

Components export const arrays that serve multiple purposes:

```typescript
// In component file: pixelated.callout.tsx
export const CALLOUT_STYLES = ['default', 'boxed', 'grid', 'overlay', 'split'] as const;
export const SHAPES = ['square', 'bevel', 'squircle', 'round'] as const;

// Used in PropTypes
Callout.propTypes = {
  style: PropTypes.oneOf([...CALLOUT_STYLES]),
  imgShape: PropTypes.oneOf([...SHAPES]),
};

// Generates TypeScript types
export type CalloutType = InferProps<typeof Callout.propTypes>;
export type ShapeType = typeof SHAPES[number];
```

```typescript
// In componentMetadata.ts
import { CALLOUT_STYLES, SHAPES } from '../../callout/pixelated.callout';

export const componentMetadata = {
  'Callout': {
    style: { type: 'select', options: CALLOUT_STYLES, default: 'default' },
    imgShape: { type: 'select', options: SHAPES, default: 'square' },
  }
};
```

### How It Works

1. **Component Selection**: User selects a component type
2. **Form Generation**: `generateFieldJSON()` creates form structure
3. **PropTypes Analysis**: `propTypeIntrospection.ts` examines each PropType
4. **Metadata Lookup**: Checks `componentMetadata` for oneOf fields
5. **Field Creation**: Generates appropriate FormInput/FormSelect
6. **Rendering**: FormEngine displays the generated form

### PropType Mappings

| PropType | Form Field | Example |
|----------|-----------|---------|
| `PropTypes.oneOf([...])` | FormSelect (dropdown) | `style: [dropdown] default, boxed, grid...` |
| `PropTypes.number` | FormInput type="number" | `columns: [↑↓] number input` |
| `PropTypes.bool` | FormInput type="checkbox" | `disabled: [☑] checkbox` |
| `PropTypes.string` | FormInput type="text" | `title: [text input]` |
| `PropTypes.object` | FormInput with placeholder | `gridColumns: JSON object` |
| `PropTypes.array` | FormInput with placeholder | `items: Comma-separated` |
| `PropTypes.func` | Disabled input | `onClick: (not editable)` |
| `PropTypes.node` | Disabled input | `children: Add separately` |

### Benefits

- **Better UX**: Dropdowns with autocomplete instead of text inputs
- **Validation**: Only valid options can be selected
- **Type Safety**: PropTypes + TypeScript work together
- **Maintainability**: Change once in component, updates everywhere
- **Documentation**: PropTypes serve as inline documentation

### Adding New Components

1. Export const arrays for enum values
2. Use arrays in PropTypes with spread
3. Add component to componentMap
4. Add metadata to componentMetadata
5. PropTypes introspection handles the rest

**Example:**

```typescript
// 1. Export const arrays
export const BUTTON_VARIANTS = ['primary', 'secondary', 'outline'] as const;

// 2. Use in PropTypes
Button.propTypes = {
  variant: PropTypes.oneOf([...BUTTON_VARIANTS]),
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

// 3. Add to componentMap.ts
import { Button } from '../../buttons/pixelated.button';
export const componentMap = {
  // ...existing
  'Button': Button,
};

// 4. Add to componentMetadata.ts
import { BUTTON_VARIANTS } from '../../buttons/pixelated.button';
export const componentMetadata = {
  // ...existing
  'Button': {
    variant: { type: 'select', options: BUTTON_VARIANTS, default: 'primary' },
    label: { type: 'text', required: true },
  }
};
```

---

## Feature 2: Inline Editing

### Problem

Original implementation required:
- Separate ComponentTree taking up screen space
- Clicking through tree to select components
- Context switching between tree, preview, and form

### Solution

Floating action buttons that appear on hover directly in the preview:
- ✏️ **Edit** - Opens property form
- ➕ **Add Child** - For layout components only
- 🗑️ **Delete** - Removes component

### Visual Feedback

**Normal State:**
- Components render cleanly
- 2px light gray border
- 10px padding

**Hover State:**
- Blue border (#2196F3)
- Box shadow
- Slight lift animation (translateY)
- Action buttons fade in
- Pulse animation

**Selected State (when adding child):**
- Green border (#4CAF50)
- Green background tint (rgba(76, 175, 80, 0.05))
- Thicker border (3px)
- Green glow (box-shadow)
- Persists until child is added

### Edit Modes

The PageEngine component supports two modes via the `editMode` prop:

**Display Mode** (`editMode={false}` or omitted):
- Clean component rendering
- No borders or hover effects
- No action buttons
- Production-ready output

**Edit Mode** (`editMode={true}`):
- Borders and padding on all components
- Hover effects
- Floating action buttons
- Visual selection feedback

### Implementation

**CSS (pagebuilder.scss):**
```scss
.pagebuilder-component-wrapper {
  position: relative;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 5px;
  margin: 5px 0;
  transition: all 0.2s ease;

  &.selected {
    border-color: #4CAF50;
    border-width: 3px;
    background: rgba(76, 175, 80, 0.05);
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    padding: 9px; // Compensate for thicker border
  }

  &:hover {
    border-color: #2196F3;
    box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
    transform: translateY(-1px);
  }
}

.pagebuilder-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;

  .pagebuilder-component-wrapper:hover & {
    opacity: 1;
  }
}
```

**PageEngine Component:**
```typescript
function renderComponent(componentData: any, index: number, path: string) {
  // ... component rendering logic ...

  // Display mode - no wrapper
  if (!editMode) {
    return <React.Fragment key={`fragment-${index}`}>{element}</React.Fragment>;
  }

  // Edit mode - wrap with actions
  const isSelected = selectedPath === currentPath;
  return (
    <div 
      className={`pagebuilder-component-wrapper ${isSelected ? 'selected' : ''}`}
      key={`wrapper-${index}`}
    >
      {element}
      <div className="pagebuilder-actions">
        <button className="edit-btn" onClick={...}>✏️</button>
        {isLayout && <button className="child-btn" onClick={...}>➕</button>}
        <button className="delete-btn" onClick={...}>🗑️</button>
      </div>
    </div>
  );
}
```

### User Workflows

**Editing a Component:**
1. Hover over component in preview
2. Action buttons fade in
3. Click ✏️ edit button
4. Property form populates with current values
5. Modify values
6. Click "Update Component"
7. Preview updates immediately

**Adding a Child Component:**
1. Hover over layout component (PageSection, PageGridItem, etc.)
2. Click ➕ add child button
3. Component gets green highlight
4. "Adding child component" info box appears
5. Select child component type
6. Fill properties
7. Click "Add Component"
8. Child appears inside parent

**Deleting a Component:**
1. Hover over component
2. Click 🗑️ delete button
3. Component removed immediately
4. Preview updates

### Benefits

- **Intuitive**: Direct manipulation in preview
- **Space Efficient**: No separate tree panel
- **Visual Clarity**: See exactly what you're editing
- **Fast**: Click and edit without navigation
- **Contextual**: Actions only show for relevant components

---

## Feature 3: Save/Load Pages

### Problem

Pages built in PageBuilder were lost on refresh. No way to persist work or reuse page configurations.

### Solution

File-based storage system with API routes:
- Save pages as JSON files
- Load saved pages from dropdown
- Delete unwanted pages
- Files stored in `public/data/pages/`

### Architecture

**Client Side** (SaveLoadSection component):
- UI for save/load/delete operations
- Fetches list of saved pages
- Displays success/error messages
- Handles loading states

**API Routes** (Next.js):
- `/api/pagebuilder/list` - Returns array of page names
- `/api/pagebuilder/load?name=...` - Returns page JSON
- `/api/pagebuilder/save` - Saves page JSON to file
- `/api/pagebuilder/delete?name=...` - Deletes page file

**Library Functions** (pageStorage.ts):
- Core file I/O operations
- Validation
- Error handling
- Directory management

### File Structure

```
your-nextjs-project/
  public/
    data/
      pages/
        home.json
        about.json
        contact.json
  src/app/
    api/
      pagebuilder/
        list/route.ts
        load/route.ts
        save/route.ts
        delete/route.ts
```

### API Implementation

Each API route is a thin wrapper calling library functions:

```typescript
// /api/pagebuilder/save/route.ts
import { NextResponse } from 'next/server';
import { savePage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, data } = body;
  
  if (!name || !data) {
    return NextResponse.json({
      success: false,
      message: 'Name and data are required'
    }, { status: 400 });
  }
  
  const result = await savePage(name, data);
  return NextResponse.json(result);
}
```

### SaveLoadSection UI

```
┌─────────────────────────────────┐
│ Page Name: [my-landing-page   ] │
│ [💾 Save Page]  [📁 Load Page]  │
├─────────────────────────────────┤
│ Saved Pages:                    │
│ ┌─────────────────────────────┐ │
│ │ home             [🗑️]      │ │
│ │ about            [🗑️]      │ │
│ │ contact          [🗑️]      │ │
│ └─────────────────────────────┘ │
├─────────────────────────────────┤
│ ✓ Page "home" saved successfully│
└─────────────────────────────────┘
```

### User Workflows

**Saving a Page:**
1. Build page with components
2. Enter name in "Page Name" field
3. Click "💾 Save Page"
4. Success message appears
5. File created in `public/data/pages/my-page.json`
6. Page appears in saved pages list

**Loading a Page:**
1. Click "📁 Load Page"
2. Dropdown shows all saved pages
3. Click page name
4. Page JSON loads into editor
5. Preview updates with loaded components
6. Success message confirms load

**Deleting a Page:**
1. Click "📁 Load Page" to see list
2. Click 🗑️ next to page name
3. Confirmation dialog appears
4. Confirm deletion
5. File removed from disk
6. Page removed from list
7. Success message confirms deletion

### Page Name Validation

**Rules:**
- Alphanumeric characters only
- Dashes and underscores allowed
- No spaces or special characters
- 1-100 characters length
- Case sensitive

**Valid:** `home`, `about-us`, `contact_page`, `landing-2024`
**Invalid:** `my page`, `about us!`, `contact@email`, ``

### Storage Location

**Default:** `public/data/pages/`

**Why public?**
- Files accessible via HTTP
- Can import directly: `import data from '/data/pages/home.json'`
- Simple mental model
- Works with static hosting
- Easy to inspect and version control

**Configurable:** Set `PAGES_DIR` environment variable
```env
PAGES_DIR=src/app/data/pages
```

### Using Saved Pages

See [Implementation Guide](./implementation.md) for complete examples of all methods:

**Method 1: Direct Import** (fastest)
```typescript
// Load pageData from your CMS or API
<PageEngine pageData={pageData} />
```

**Method 2: Client API Call** (dynamic)
```typescript
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/pagebuilder/load?name=home')
    .then(res => res.json())
    .then(result => setData(result.data));
}, []);
<PageEngine pageData={data} />
```

**Method 3: Server Component** (SSR)
```typescript
import { loadPage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';
const result = await loadPage('home');
<PageEngine pageData={result.data} />
```

**Method 4: Dynamic Routes** (one route for all pages)
```typescript
// app/pages/[slug]/page.tsx
const result = await loadPage(params.slug);
<PageEngine pageData={result.data} />
```

### Benefits

- **Persistent**: Pages survive browser refresh
- **Reusable**: Load and edit existing pages
- **Portable**: JSON files can be version controlled
- **Flexible**: Multiple ways to use saved pages
- **Simple**: File-based, no database required

### Error Handling

All operations return structured responses:

**Success:**
```json
{
  "success": true,
  "message": "Page saved successfully",
  "data": { /* page JSON */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Page not found"
}
```

Errors display in UI with clear messaging.

---

## Feature Integration

All three features work together seamlessly:

1. **PropTypes Introspection** generates appropriate forms
2. **Inline Editing** provides intuitive editing interface
3. **Save/Load** persists work for reuse

**Example Workflow:**
1. Select Callout component
2. Form auto-generates with dropdowns (PropTypes)
3. Fill properties and add to page
4. Hover and click ✏️ to edit (Inline)
5. Click ➕ to add child component (Inline)
6. Save as "landing-page" (Save/Load)
7. Load "landing-page" later to continue editing (Save/Load)
8. Use saved page in production with PageEngine
