# Implementation Guide: PageBuilder V2

## Architecture Overview

PageBuilder V2 uses a **modular architecture** with clear separation of concerns:

```
pagebuilder/
├── lib/                    # Pure utility functions (no React)
├── components/             # React components
├── usePageBuilder.ts       # State management hook
└── documentation/          # This folder
```

## File Structure and Responsibilities

### Entry Point
**`page.tsx`** (17 lines)
```typescript
import React from "react";
import { PageBuilderUI } from './pagebuilder/components/PageBuilderUI';

export default function PageBuilder() {
	return <PageBuilderUI />;
}
```

### Lib Utilities (Pure Functions)

#### `lib/types.ts`
TypeScript interfaces for type safety across the application.

#### `lib/componentMap.ts`
Component registry and helper functions.

```typescript
export const componentMap = {
  "Page Header": PageTitleHeader,
  "Grid Section": GridSection,
  // ... more components
};

export const layoutComponents = [
  'Section Container',
  'Grid Section',
  // ... layout components that can have children
];

export function isLayoutComponent(componentName: string): boolean;
export function getComponentType(componentName: string);
```

#### `lib/propTypeIntrospection.ts`
PropTypes analysis and form field generation.

**Key Functions:**

```typescript
/**
 * Analyzes PropTypes to determine form field type
 * 
 * IMPORTANT: PropTypes logic is inverted!
 * - Optional: PropTypes.string (HAS .isRequired property)
 * - Required: PropTypes.string.isRequired (NO .isRequired property)
 */
export function getPropTypeInfo(propType: any): PropTypeInfo {
  if (!propType) return { type: 'text', isRequired: false };

  // Inverted logic: required types DON'T have .isRequired
  const isRequired = !('isRequired' in propType);
  
  // Check for oneOf (enum/dropdown)
  if (basePropType._propType === 'oneOf') {
    return { 
      type: 'select', 
      options: basePropType.values,
      isRequired 
    };
  }
  
  // Check for basic types
  switch (basePropType.name) {
    case 'number': return { type: 'number', isRequired };
    case 'bool': return { type: 'checkbox', isRequired };
    case 'object': return { type: 'json', isRequired };
    default: return { type: 'text', isRequired };
  }
}

/**
 * Generates form field configuration based on PropType
 */
export function generateFormFieldFromPropType(
  propName: string, 
  propType: any,
  value?: any
): FormField {
  const propInfo = getPropTypeInfo(propType);
  
  const baseProps: any = {
    label: propName,
    name: propName,
    id: propName,
  };
  
  // Only add required when actually required
  // HTML treats ANY value for required as required, even "false"
  if (propInfo.isRequired) {
    baseProps.required = 'required';
  }
  
  // Add defaultValue for edit mode
  if (value !== undefined && value !== null && value !== '') {
    baseProps.defaultValue = value;
  }

  switch (propInfo.type) {
    case 'select':
      return {
        component: 'FormInput',
        props: {
          ...baseProps,
          type: 'text',
          list: `${propName}-options`,
          listItems: propInfo.options?.join(', ') || '',
        }
      };

    case 'number':
      return {
        component: 'FormInput',
        props: {
          ...baseProps,
          type: 'number',
        }
      };

    case 'checkbox':
      return {
				component: 'FormInput',
				props: {
					...baseProps,
					type: 'checkbox',
				}
			};

		case 'json':
			return {
				component: 'FormInput',
				props: {
					...baseProps,
					type: 'text',
					placeholder: 'JSON: {"key": "value"}',
				}
			};

		case 'children':
			return {
				component: 'FormInput',
				props: {
					...baseProps,
					type: 'text',
					placeholder: 'Children not editable',
					disabled: true,
				}
			};

		case 'function':
			return {
				component: 'FormInput',
				props: {
					...baseProps,
					type: 'text',
					placeholder: 'Function (not editable)',
					disabled: true,
				}
			};

		default:
			return {
				component: 'FormInput',
				props: {
					...baseProps,
					type: 'text',
				}
			};
	}
}
```

### Modify generateFieldJSON

Replace the existing loop that adds fields:

**OLD CODE:**
```typescript
// ADD FIELDS FOR EACH PROP IN THE COMPONENT'S PROP TYPES
for (const prop in componentMap[component as keyof typeof componentMap].propTypes) {
	const field: { [key: string]: any } = {};
	field.component = 'FormInput';
	const props: { [key: string]: any } = {};
	props.label = prop;
	props.name = prop;
	props.id = prop;
	props.type = 'text';  // Always text!
	field.props = props;
	form.fields[form.fields.length] = field;
}
```

**NEW CODE:**
```typescript
// ADD FIELDS FOR EACH PROP - USE PROPTYPES INTROSPECTION
const componentPropTypes = componentMap[component as keyof typeof componentMap].propTypes;
if (componentPropTypes) {
	for (const prop in componentPropTypes) {
		// Skip children prop - handle separately if needed
		if (prop === 'children') continue;
		
		const propType = componentPropTypes[prop];
		const field = generateFormFieldFromPropType(prop, propType);
		form.fields.push(field);
	}
}
```

### Update generateComponentObject

Add value parsing for non-text types:

**ADD THIS CODE** in the loop where you process form values:

```typescript
for (const prop in target) {
	const thisProp = (target as any)[prop];
	if (thisProp && thisProp.value && (thisProp.value !== Object(thisProp.value))) { 
		let value = thisProp.value;
		
		// Parse numbers
		if (thisProp.type === 'number') {
			value = parseFloat(value) || value;
		}
		
		// Parse checkboxes
		if (thisProp.type === 'checkbox') {
			value = thisProp.checked;
		}
		
		// Try to parse JSON objects
		if (thisProp.name !== 'type' && typeof value === 'string' && value.startsWith('{')) {
			try {
				value = JSON.parse(value);
			} catch (e) {
				// Keep as string if not valid JSON
			}
		}
		
		props[thisProp.name] = value;
	}
}
```

### Testing Enhancement 1

1. Select "Callout" component
2. Look at the form fields:
   - `style` should show datalist with options: "default, boxed, grid, overlay, split"
   - `layout` should show: "horizontal, vertical"
   - `direction` should show: "left, right"
3. Start typing in a field - you should see autocomplete suggestions
4. Add a component with a `oneOf` value and verify it works

---

## Enhancement 2: Nested Components

### Goal
Allow layout components to contain other components as children.

### Step 1: Import Layout Components

Add to top of file:

```typescript
import { 
	SectionContainer, 
	GridSection, 
	FlexSection, 
	PageGridItem, 
	PageFlexItem 
} from '@/app/elements/layout/pixelated.layout';
```

### Step 2: Update componentMap

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

// Track which components can have children
const layoutComponents = [
	'Section Container', 
	'Grid Section', 
	'Flex Section', 
	'Grid Item', 
	'Flex Item'
];
```

### Step 3: Update ComponentSelector Props

```typescript
ComponentSelector.propTypes = {
	setEditableComponent: PropTypes.func.isRequired,
	parentPath: PropTypes.string,  // ADD THIS
};
```

### Step 4: Update generateFieldJSON

Add hidden field for parent path (add this after the type field):

```typescript
function generateFieldJSON(component: string) {
	const form: { fields: { [key: string]: any }[] } = { fields: [] };
	
	// Type field
	form.fields[0] = { /* ... existing code ... */ };
	
	// ADD THIS: Parent path for nesting
	if (props.parentPath) {
		form.fields.push({
			component: 'FormInput',
			props: {
				name: '__parentPath',
				id: '__parentPath',
				type: 'hidden',
				value: props.parentPath
			}
		});
	}
	
	// Rest of fields...
}
```

### Step 5: Update ComponentSelector Render

Show indicator when adding to parent:

```typescript
return (
	<>
		{props.parentPath && (
			<div style={{ 
				padding: '0.5rem', 
				background: '#e3f2fd', 
				marginBottom: '1rem',
				borderRadius: '4px'
			}}>
				Adding child to: <strong>{props.parentPath}</strong>
			</div>
		)}
		<FormEngine 
			formData={generateTypeField()}
			onSubmitHandler={(event) => { handlePhaseOneSubmit(event); }} 
			name="build" 
			id="build" 
			method="post" 
		/>
	</>
);
```

### Step 6: Update generateComponentObject

Add children array and path tracking:

```typescript
function generateComponentObject(event: Event) {
	const props: { [key: string]: any } = {};
	const target = event.target as HTMLFormElement;
	
	// ... existing form value processing ...
	
	// Extract and remove parent path
	const parentPath = props.__parentPath;
	delete props.__parentPath;
	
	const newComponent: any = {
		component: props.type,
		props: props,
		children: [] // ADD THIS
	};
	
	// ADD THIS: Path for tracking
	newComponent.path = parentPath 
		? `${parentPath}.children[${Date.now()}]` 
		: `root[${Date.now()}]`;
	
	return { component: newComponent, parentPath };  // Return both
}
```

### Step 7: Update handleAddNewComponent

Handle nesting logic:

```typescript
function handleAddNewComponent(event: Event) {
	const { component: newComponent, parentPath } = generateComponentObject(event);
	
	const components = JSON.parse(JSON.stringify(pageJSON.components));
	
	if (!parentPath) {
		// Add to root level
		components.push(newComponent);
	} else {
		// Find parent and add to its children
		const pathParts = parentPath.split(/[\[\].]/).filter(Boolean);
		let current: any = { components };
		
		for (let i = 0; i < pathParts.length; i++) {
			const part = pathParts[i];
			if (part === 'root') {
				current = current.components;
			} else if (part === 'children') {
				continue;
			} else {
				const idx = parseInt(part);
				if (!isNaN(idx)) {
					current = current[idx];
				}
			}
		}
		
		if (current && Array.isArray(current.children)) {
			current.children.push(newComponent);
		}
	}
	
	setPageJSON({ components });
	setEditableComponent({});
}
```

### Step 8: Make PageEngine Recursive

Replace the PageEngine rendering logic:

```typescript
export function PageEngine(props: PageEngineType) {
	// Recursive render function
	function renderComponent(componentData: any, index: number): React.JSX.Element {
		const componentName: string = componentData.component;
		const componentProps: any = { ...componentData.props };
		delete componentProps.type;
		
		const componentType = (componentMap as Record<string, React.ElementType>)[componentName];
		
		if (!componentType) {
			return <div key={index}>Unknown: {componentName}</div>;
		}
		
		// Recursively render children
		let children = null;
		if (componentData.children && componentData.children.length > 0) {
			children = componentData.children.map((child: any, childIndex: number) => 
				renderComponent(child, childIndex)
			);
		}
		
		componentProps.key = generateKey();
		
		if (children) {
			return React.createElement(componentType, componentProps, children);
		}
		
		return React.createElement(componentType, componentProps);
	}

	const components: React.JSX.Element[] = [];
	const pageComponents = props?.pageData?.components;
	
	if (pageComponents) {
		pageComponents.forEach((component: any, index: number) => {
			components.push(renderComponent(component, index));
		});
	}
	
	return <>{components}</>;
}
```

### Step 9: Add Component Tree Viewer

Add this new component before PageBuilder:

```typescript
ComponentTree.propTypes = {
	components: PropTypes.array.isRequired,
	onSelectComponent: PropTypes.func.isRequired,
	selectedPath: PropTypes.string,
};

type ComponentTreeProps = InferProps<typeof ComponentTree.propTypes>;

function ComponentTree({ components, onSelectComponent, selectedPath }: ComponentTreeProps) {
	function renderTreeNode(component: any, index: number, path: string) {
		const isLayout = layoutComponents.includes(component.component);
		const currentPath = `${path}[${index}]`;
		const isSelected = currentPath === selectedPath;
		const hasChildren = component.children && component.children.length > 0;
		
		return (
			<div key={currentPath} style={{ marginLeft: path === 'root' ? 0 : '20px' }}>
				<div 
					onClick={() => onSelectComponent(component, currentPath)}
					style={{
						padding: '0.5rem',
						margin: '0.25rem 0',
						background: isSelected ? '#4CAF50' : isLayout ? '#e3f2fd' : '#f5f5f5',
						color: isSelected ? 'white' : 'black',
						cursor: 'pointer',
						borderRadius: '4px',
						border: isLayout ? '2px solid #2196F3' : '1px solid #ddd',
					}}
				>
					<strong>{component.component}</strong>
					{hasChildren && ` (${component.children.length} children)`}
					{isLayout && ' 📦'}
				</div>
				
				{hasChildren && (
					<div>
						{component.children.map((child: any, childIndex: number) => 
							renderTreeNode(child, childIndex, `${currentPath}.children`)
						)}
					</div>
				)}
			</div>
		);
	}
	
	return (
		<div>
			{components.map((component, index) => 
				renderTreeNode(component, index, 'root')
			)}
		</div>
	);
}
```

### Step 10: Update PageBuilder State

Add state for selected component:

```typescript
export default function PageBuilder() {
	const [pageJSON, setPageJSON] = useState({ components: [] });
	const [editableComponent, setEditableComponent] = useState({});
	const [selectedComponent, setSelectedComponent] = useState<any>(null);  // ADD
	const [selectedPath, setSelectedPath] = useState<string>('');  // ADD
	
	// ... existing handleAddNewComponent ...
	
	// ADD THIS:
	function handleSelectComponent(component: any, path: string) {
		setSelectedComponent(component);
		setSelectedPath(path);
	}
	
	// ... rest of component
}
```

### Step 11: Update PageBuilder Render

Add tree viewer and pass selectedPath:

```typescript
return ( 
	<>
		<div className="row-2col">
			<div className="grid-item">
				<PageSectionHeader title="Component Selector" />
				<ComponentSelector 
					setEditableComponent={setEditableComponent}
					parentPath={selectedPath || undefined}  // PASS selectedPath
				/>
				
				<PageSectionHeader title="Component Properties" />
				<FormEngine 
					name="field_props" 
					id="field_props"
					onSubmitHandler={handleAddNewComponent}
					formData={editableComponent} 
				/>
			</div>

			<div className="grid-item">
				{/* ADD THIS SECTION */}
				<PageSectionHeader title="Component Tree" />
				{pageJSON.components.length > 0 ? (
					<ComponentTree 
						components={pageJSON.components}
						onSelectComponent={handleSelectComponent}
						selectedPath={selectedPath}
					/>
				) : (
					<p style={{ color: '#666', fontStyle: 'italic' }}>
						No components yet. Add a component to get started.
					</p>
				)}
				
				<PageSectionHeader title="Page JSON" />
				<pre>{JSON.stringify(pageJSON, null, 2)}</pre>
			</div>

			<div className="grid-s1-e3">
				<PageSectionHeader title="Preview" />
				<section id="preview-section">
					<div className="section-container">
						<PageEngine pageData={pageJSON} />
					</div>
				</section>
			</div>
		</div>
	</> 
);
```

### Testing Enhancement 2

1. **Add a Grid Section**
   - Select "Grid Section"
   - Set columns to 3, gap to "2rem"
   - Click "Add Grid Section"
   - See it appear in Component Tree with 📦 icon

2. **Select the Grid Section**
   - Click on "Grid Section" in the tree
   - It should highlight green
   - Component Selector should show "Adding child to: root[xxx]"

3. **Add Children**
   - Select "Callout"
   - Fill in callout properties
   - Click "Add Callout"
   - See it appear under Grid Section in tree
   - Repeat 2 more times for 3 total callouts

4. **Verify**
   - Check JSON shows nested structure with children arrays
   - Preview should show 3 callouts in a grid layout

---

## Complete Working Example

Here's what the final workflow looks like:

1. User adds Grid Section (3 columns)
2. User clicks Grid Section in tree (selects it as parent)
3. User adds Callout #1 → goes into Grid Section
4. User adds Callout #2 → goes into Grid Section
5. User adds Callout #3 → goes into Grid Section

**Resulting JSON:**
```json
{
  "components": [
    {
      "component": "Grid Section",
      "props": {
        "columns": 3,
        "gap": "2rem",
        "padding": "3rem 0"
      },
      "children": [
        {
          "component": "Callout",
          "props": {
            "title": "Feature 1",
            "style": "boxed"
          },
          "children": []
        },
        {
          "component": "Callout",
          "props": {
            "title": "Feature 2",
            "style": "boxed"
          },
          "children": []
        },
        {
          "component": "Callout",
          "props": {
            "title": "Feature 3",
            "style": "boxed"
          },
          "children": []
        }
      ]
    }
  ]
}
```

**Renders as:**
```
┌────────────────────────────────────────────┐
│          Grid Section (3 columns)          │
│                                            │
│  ┌───────┐    ┌───────┐    ┌───────┐     │
│  │Feature│    │Feature│    │Feature│     │
│  │   1   │    │   2   │    │   3   │     │
│  └───────┘    └───────┘    └───────┘     │
└────────────────────────────────────────────┘
```

---

## Summary

These two enhancements make your page builder significantly more powerful:

**PropTypes Introspection:**
- ✅ Dropdowns for enum values (oneOf)
- ✅ Number inputs for numeric props
- ✅ Checkboxes for booleans
- ✅ Appropriate placeholders for complex types
- ✅ Self-documenting component APIs

**Nested Components:**
- ✅ Layout components can contain children
- ✅ Visual tree hierarchy
- ✅ Infinite nesting depth
- ✅ Click-to-select parent containers
- ✅ Complex page structures possible

Both enhancements work together seamlessly and can be implemented incrementally!
