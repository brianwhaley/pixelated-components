# PageBuilder Implementation Guide

Complete setup guide for integrating PageBuilder into your Next.js project.

---

## Prerequisites

- Next.js 13+ with App Router
- TypeScript configured
- Node.js 18+

---

## Installation

```bash
npm install @pixelated-tech/components
```

---

## Step 1: Create PageBuilder Page

Create a page to host the PageBuilder UI.

**File:** `src/app/pagebuilder/page.tsx`

```typescript
import { PageBuilderUI } from '@pixelated-tech/components';
import '@pixelated-tech/components/pagebuilder/components/pagebuilder.scss';

export default function PageBuilderPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Page Builder</h1>
      <PageBuilderUI />
    </div>
  );
}
```

**Test:** Visit `http://localhost:3000/pagebuilder`

---

## Step 2: Create Storage Directory

Create directory for saved pages:

```bash
mkdir -p public/data/pages
touch public/data/pages/.gitkeep
```

**Why public/?**
- Accessible via HTTP and imports
- Next.js serves files from public/ statically
- Simplifies both client-side and server-side loading

---

## Step 3: Create API Routes

Create API endpoints for save/load functionality.

### List Pages API

**File:** `src/app/api/pagebuilder/list/route.ts`

```typescript
import { listPages } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';
import { NextResponse } from 'next/server';

export async function GET() {
  const result = await listPages();
  return NextResponse.json(result);
}
```

### Load Page API

**File:** `src/app/api/pagebuilder/load/route.ts`

```typescript
import { loadPage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  
  if (!name) {
    return NextResponse.json(
      { success: false, message: 'Page name is required' },
      { status: 400 }
    );
  }
  
  const result = await loadPage(name);
  return NextResponse.json(result);
}
```

### Save Page API

**File:** `src/app/api/pagebuilder/save/route.ts`

```typescript
import { savePage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, data } = body;
  
  if (!name || !data) {
    return NextResponse.json(
      { success: false, message: 'Name and data are required' },
      { status: 400 }
    );
  }
  
  const result = await savePage(name, data);
  return NextResponse.json(result);
}
```

### Delete Page API

**File:** `src/app/api/pagebuilder/delete/route.ts`

```typescript
import { deletePage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  
  if (!name) {
    return NextResponse.json(
      { success: false, message: 'Page name is required' },
      { status: 400 }
    );
  }
  
  const result = await deletePage(name);
  return NextResponse.json(result);
}
```

---

## Step 4: Test Save/Load

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open PageBuilder:**
   Visit `http://localhost:3000/pagebuilder`

3. **Add components:**
   - Select a component (e.g., Callout)
   - Fill in properties
   - Click "Add Component"

4. **Save page:**
   - Enter a name (e.g., "test-page")
   - Click "Save Page"
   - Verify file created: `public/data/pages/test-page.json`

5. **Load page:**
   - Refresh browser
   - Click "Load" button
   - Select "test-page" from dropdown
   - Verify components restored

---

## Step 5: Render Saved Pages

Choose one of four methods to render saved pages in your app.

### Method 1: Direct Import (Build-time)

Best for: Static pages that rarely change.

**File:** `src/app/page.tsx`

```typescript
import { PageEngine } from '@pixelated-tech/components';

export default function HomePage() {
  // Load pageData from your CMS or API
  return <PageEngine pageData={pageData} />;
}
```

**Pros:** Fast, type-safe, works with SSG  
**Cons:** Requires rebuild to update content

---

### Method 2: Client-Side API Call (Runtime)

Best for: Dynamic content, preview mode.

**File:** `src/app/page.tsx`

```typescript
'use client';

import { PageEngine } from '@pixelated-tech/components';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pagebuilder/load?name=home')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setPageData(result.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!pageData) return <div>Page not found</div>;

  return <PageEngine pageData={pageData} />;
}
```

**Pros:** Dynamic, no rebuild needed  
**Cons:** Client-side loading, flash of loading state

---

### Method 3: Server Component (SSR)

Best for: SEO-critical pages with dynamic content.

**File:** `src/app/page.tsx`

```typescript
import { PageEngine } from '@pixelated-tech/components';
import { loadPage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export default async function HomePage() {
  const result = await loadPage('home');
  
  if (!result.success || !result.data) {
    return <div>Page not found</div>;
  }

  return <PageEngine pageData={result.data} />;
}
```

**Pros:** SEO-friendly, server-rendered, no loading state  
**Cons:** Slightly slower initial response (file I/O on each request)

---

### Method 4: Dynamic Routes with Static Generation

Best for: Multiple pages with same template, optimized performance.

**File:** `src/app/[slug]/page.tsx`

```typescript
import { PageEngine } from '@pixelated-tech/components';
import { loadPage, listPages } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

// Generate static params at build time
export async function generateStaticParams() {
  const result = await listPages();
  
  if (!result.success) return [];
  
  return result.pages.map(page => ({
    slug: page,
  }));
}

// Render page
export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const result = await loadPage(params.slug);
  
  if (!result.success || !result.data) {
    return <div>Page not found</div>;
  }

  return <PageEngine pageData={result.data} />;
}
```

**Pros:** Best performance (static), SEO-friendly, scales to many pages  
**Cons:** Requires rebuild when pages added/removed

**Usage:**
- Save pages in PageBuilder: `home`, `about`, `contact`
- Pages auto-generated: `/home`, `/about`, `/contact`
- Rebuild to add new routes

---

## Method Comparison

| Method | Performance | SEO | Dynamic | Build Required |
|--------|-------------|-----|---------|----------------|
| Direct Import | ⭐⭐⭐⭐⭐ | ✅ | ❌ | Yes |
| Client API | ⭐⭐⭐ | ❌ | ✅ | No |
| Server Component | ⭐⭐⭐⭐ | ✅ | ✅ | No |
| Dynamic Routes + SSG | ⭐⭐⭐⭐⭐ | ✅ | ⚠️ | Yes (for new routes) |

**Recommendation:**
- **Production sites:** Method 4 (Dynamic Routes + SSG)
- **CMS-style apps:** Method 3 (Server Component)
- **Preview/staging:** Method 2 (Client API)

---

## Adding New Components

### Step 1: Create Component with PropTypes

**File:** `src/components/mycomponent/MyComponent.tsx`

```typescript
import React from 'react';
import PropTypes from 'prop-types';

// Define options array (exported for componentMetadata)
export const MY_VARIANT_OPTIONS = ['default', 'highlighted', 'minimal'];

export interface MyComponentProps {
  title: string;
  description?: string;
  variant?: typeof MY_VARIANT_OPTIONS[number];
  count?: number;
}

export function MyComponent({ 
  title, 
  description, 
  variant = 'default',
  count = 0 
}: MyComponentProps) {
  return (
    <div className={`my-component my-component--${variant}`}>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {count > 0 && <span>Count: {count}</span>}
    </div>
  );
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  variant: PropTypes.oneOf(MY_VARIANT_OPTIONS),
  count: PropTypes.number,
};
```

### Step 2: Register in componentMap

**File:** `pixelated-components/src/components/pagebuilder/lib/componentMap.ts`

```typescript
import { MyComponent } from '../../mycomponent/MyComponent';

export const componentMap = {
  // ...existing components
  'MyComponent': MyComponent,
};

// If component accepts children:
export const layoutComponents = [
  'PageSection',
  // ...existing
  'MyComponent',  // Add if it accepts children
];
```

### Step 3: Add to componentMetadata

**File:** `pixelated-components/src/components/pagebuilder/lib/componentMetadata.ts`

```typescript
import { MY_VARIANT_OPTIONS } from '../../mycomponent/MyComponent';

export const componentMetadata = {
  // ...existing components
  'MyComponent': {
    variant: { type: 'select', options: MY_VARIANT_OPTIONS },
    description: { type: 'text' },
    count: { type: 'number' },
  }
};
```

### Step 4: Build and Test

```bash
cd pixelated-components
npm run build

cd ../your-next-app
npm install @pixelated-tech/components@latest
npm run dev
```

**Test in PageBuilder:**
1. Open PageBuilder
2. Select "MyComponent" from dropdown
3. Fill in properties
4. Add to page
5. Save and render

---

## Configuration

### Custom Storage Location

Set environment variable:

**File:** `.env.local`

```env
PAGES_DIR=src/app/data/pages
```

**Options:**
- `public/data/pages` (default) - Public access
- `src/app/data/pages` - Private, server-only
- `data/pages` - Project root

**Note:** Update API routes to match your storage location.

---

## Troubleshooting

### "Page name is required" Error

**Cause:** Empty page name in save/load  
**Fix:** Enter valid name (alphanumeric, dash, underscore only)

### Components Not Appearing

**Cause:** Not registered in componentMap  
**Fix:** Add component to `lib/componentMap.ts`

### Properties Not Editable

**Cause:** Missing componentMetadata entry  
**Fix:** Add metadata to `lib/componentMetadata.ts`

### Save/Load Not Working

**Causes:**
1. API routes not created
2. Storage directory doesn't exist
3. File permissions issue

**Fixes:**
1. Create all 4 API routes (list, load, save, delete)
2. Create `public/data/pages/` directory
3. Check directory permissions: `chmod 755 public/data/pages`

### Type Errors with PageData

**Cause:** TypeScript can't find types  
**Fix:** Ensure proper import:
```typescript
import type { PageData } from '@pixelated-tech/components/pagebuilder/lib/types';
```

### Build Errors in pixelated-components

**Cause:** Missing dependencies or TypeScript errors  
**Fix:**
```bash
cd pixelated-components
npm install
npm run build
```

### Changes Not Reflecting

**Cause:** Using cached version  
**Fix:**
```bash
# In pixelated-components
npm version patch
npm run build

# In your app
npm install @pixelated-tech/components@latest
```

---

## Best Practices

### 1. Version Control

Add to `.gitignore`:
```
public/data/pages/*.json
!public/data/pages/.gitkeep
```

Commit `.gitkeep`, ignore page files (unless you want them in repo).

### 2. Page Naming

Use descriptive, URL-friendly names:
- ✅ `home`, `about-us`, `contact_form`
- ❌ `My Page!`, `test123`, `new page`

### 3. Component Organization

Group related components:
```
src/components/
├── content/
│   ├── Hero.tsx
│   ├── Callout.tsx
│   └── TextBlock.tsx
├── layout/
│   ├── PageSection.tsx
│   ├── PageGridItem.tsx
│   └── PageFlexItem.tsx
└── interactive/
    ├── ContactForm.tsx
    └── Newsletter.tsx
```

### 4. PropTypes Pattern

Always define options arrays:
```typescript
export const MY_OPTIONS = ['option1', 'option2'];

MyComponent.propTypes = {
  variant: PropTypes.oneOf(MY_OPTIONS),
};
```

This enables proper select fields in PageBuilder.

### 5. Error Boundaries

Wrap PageEngine in error boundary:
```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return <div>Error loading page: {error.message}</div>;
}

export default function Page() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PageEngine pageData={pageData} />
    </ErrorBoundary>
  );
}
```

---

## Next Steps

1. **Explore Features:** Review `features.md` for PropTypes introspection and inline editing
2. **Understand Architecture:** Read `architecture.md` for technical details
3. **Reference APIs:** Check `api-reference.md` when integrating components
4. **Add Components:** Follow guide above to extend with custom components

---

## Support

For issues or questions:
- Check documentation in `/src/components/pagebuilder/documentation/`
- Review component PropTypes for available properties
- Inspect browser console for API errors
- Verify file permissions on storage directory

---

## Example: Complete Setup

**Full working example:**

```typescript
// src/app/pagebuilder/page.tsx
import { PageBuilderUI } from '@pixelated-tech/components';
import '@pixelated-tech/components/pagebuilder/components/pagebuilder.scss';

export default function PageBuilderPage() {
  return <PageBuilderUI />;
}
```

```typescript
// src/app/page.tsx (Server Component)
import { PageEngine } from '@pixelated-tech/components';
import { loadPage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export default async function HomePage() {
  const result = await loadPage('home');
  
  if (!result.success) {
    return <div>Welcome! Create your home page in PageBuilder.</div>;
  }

  return <PageEngine pageData={result.data} />;
}
```

```typescript
// src/app/api/pagebuilder/save/route.ts
import { savePage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, data } = await request.json();
  if (!name || !data) {
    return NextResponse.json(
      { success: false, message: 'Name and data required' },
      { status: 400 }
    );
  }
  const result = await savePage(name, data);
  return NextResponse.json(result);
}
```

**Directory structure:**
```
your-next-app/
├── public/
│   └── data/
│       └── pages/
│           ├── .gitkeep
│           └── home.json (generated)
├── src/
│   └── app/
│       ├── page.tsx (renders home.json)
│       ├── pagebuilder/
│       │   └── page.tsx (PageBuilder UI)
│       └── api/
│           └── pagebuilder/
│               ├── list/route.ts
│               ├── load/route.ts
│               ├── save/route.ts
│               └── delete/route.ts
└── package.json
```

**Test flow:**
1. Visit `/pagebuilder`
2. Add Callout component
3. Save as "home"
4. Visit `/` to see rendered page
5. Edit in `/pagebuilder` and save
6. Refresh `/` to see updates

---

Complete! Your PageBuilder is ready to use.
