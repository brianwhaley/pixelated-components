# PageBuilder Save/Load Implementation

## Overview

The PageBuilder now supports saving and loading page configurations as JSON files. This document outlines the implementation steps and usage patterns.

---

## Architecture

### Library Functions (pixelated-components)
Core file operations are implemented in `lib/pageStorage.ts` within the pixelated-components package. These functions handle all file system operations.

### API Routes (Next.js Projects)
Each Next.js project implements thin API route wrappers that call the library functions. This keeps the logic centralized while allowing project-specific configuration.

### Storage Location
**Default:** `public/data/pages/`

**Rationale:**
- Files are accessible via HTTP
- Simple mental model for non-sensitive UI configuration data
- Supports direct import and fetch patterns
- Works with static hosting
- Easy to inspect and version control

**Configuration:** Override via environment variable:
```env
PAGES_DIR=public/data/pages
```

---

## Implementation Steps

### Step 1: pixelated-components Package

#### 1.1 Create Type Definitions

**File:** `src/components/pagebuilder/lib/pageStorageTypes.ts`

```typescript
export interface SavePageRequest {
  name: string;
  data: PageData;
}

export interface SavePageResponse {
  success: boolean;
  message: string;
  filename?: string;
}

export interface LoadPageResponse {
  success: boolean;
  data?: PageData;
  message?: string;
}

export interface ListPagesResponse {
  success: boolean;
  pages: string[];
  message?: string;
}

export interface DeletePageResponse {
  success: boolean;
  message: string;
}
```

#### 1.2 Create Storage Library

**File:** `src/components/pagebuilder/lib/pageStorage.ts`

```typescript
import fs from 'fs';
import path from 'path';
import type { PageData } from './types';
import type {
  SavePageResponse,
  LoadPageResponse,
  ListPagesResponse,
  DeletePageResponse
} from './pageStorageTypes';

const PAGES_DIR = process.env.PAGES_DIR || 'public/data/pages';

/**
 * Get absolute path to pages directory
 */
function getPagesDir(): string {
  return path.join(process.cwd(), PAGES_DIR);
}

/**
 * Ensure pages directory exists
 */
function ensurePagesDir(): void {
  const dir = getPagesDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Validate page name (alphanumeric, dashes, underscores only)
 */
export function validatePageName(name: string): boolean {
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(name) && name.length > 0 && name.length <= 100;
}

/**
 * List all saved pages
 */
export async function listPages(): Promise<ListPagesResponse> {
  try {
    ensurePagesDir();
    const dir = getPagesDir();
    const files = fs.readdirSync(dir);
    const jsonFiles = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
    
    return {
      success: true,
      pages: jsonFiles.sort()
    };
  } catch (error) {
    return {
      success: false,
      pages: [],
      message: `Failed to list pages: ${error}`
    };
  }
}

/**
 * Load a page by name
 */
export async function loadPage(name: string): Promise<LoadPageResponse> {
  try {
    if (!validatePageName(name)) {
      return {
        success: false,
        message: 'Invalid page name. Use only letters, numbers, dashes, and underscores.'
      };
    }

    const dir = getPagesDir();
    const filepath = path.join(dir, `${name}.json`);
    
    if (!fs.existsSync(filepath)) {
      return {
        success: false,
        message: `Page "${name}" not found.`
      };
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    const data = JSON.parse(content) as PageData;

    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to load page: ${error}`
    };
  }
}

/**
 * Save a page
 */
export async function savePage(name: string, data: PageData): Promise<SavePageResponse> {
  try {
    if (!validatePageName(name)) {
      return {
        success: false,
        message: 'Invalid page name. Use only letters, numbers, dashes, and underscores.'
      };
    }

    ensurePagesDir();
    const dir = getPagesDir();
    const filepath = path.join(dir, `${name}.json`);
    
    // Write file with pretty formatting
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');

    return {
      success: true,
      message: `Page "${name}" saved successfully.`,
      filename: `${name}.json`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to save page: ${error}`
    };
  }
}

/**
 * Delete a page
 */
export async function deletePage(name: string): Promise<DeletePageResponse> {
  try {
    if (!validatePageName(name)) {
      return {
        success: false,
        message: 'Invalid page name.'
      };
    }

    const dir = getPagesDir();
    const filepath = path.join(dir, `${name}.json`);
    
    if (!fs.existsSync(filepath)) {
      return {
        success: false,
        message: `Page "${name}" not found.`
      };
    }

    fs.unlinkSync(filepath);

    return {
      success: true,
      message: `Page "${name}" deleted successfully.`
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete page: ${error}`
    };
  }
}
```

#### 1.3 Create SaveLoadSection Component

**File:** `src/components/pagebuilder/components/SaveLoadSection.tsx`

```tsx
"use client";

import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import type { PageData } from '../lib/types';

SaveLoadSection.propTypes = {
  pageData: PropTypes.object.isRequired,
  onLoad: PropTypes.func.isRequired,
};

type SaveLoadSectionProps = InferProps<typeof SaveLoadSection.propTypes>;

export function SaveLoadSection({ pageData, onLoad }: SaveLoadSectionProps) {
  const [pageName, setPageName] = useState('');
  const [savedPages, setSavedPages] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadList, setShowLoadList] = useState(false);

  // Fetch list of saved pages on mount
  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const response = await fetch('/api/pagebuilder/list');
      const result = await response.json();
      if (result.success) {
        setSavedPages(result.pages);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    }
  }

  async function handleSave() {
    if (!pageName.trim()) {
      setMessage('Please enter a page name');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/pagebuilder/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pageName, data: pageData })
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✓ ${result.message}`);
        fetchPages(); // Refresh list
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`✗ ${result.message}`);
      }
    } catch (error) {
      setMessage(`✗ Failed to save: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLoad(name: string) {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/pagebuilder/load?name=${encodeURIComponent(name)}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        onLoad(result.data);
        setPageName(name);
        setShowLoadList(false);
        setMessage(`✓ Loaded "${name}"`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`✗ ${result.message}`);
      }
    } catch (error) {
      setMessage(`✗ Failed to load: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(name: string) {
    if (!confirm(`Delete page "${name}"? This cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/pagebuilder/delete?name=${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage(`✓ ${result.message}`);
        fetchPages(); // Refresh list
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`✗ ${result.message}`);
      }
    } catch (error) {
      setMessage(`✗ Failed to delete: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '4px' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <label htmlFor="page-name" style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.25rem' }}>
          Page Name:
        </label>
        <input
          id="page-name"
          type="text"
          value={pageName}
          onChange={(e) => setPageName(e.target.value)}
          placeholder="my-landing-page"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button
          onClick={handleSave}
          disabled={isLoading || !pageName.trim()}
          className="button"
          style={{
            flex: 1,
            background: '#4CAF50',
            color: 'white',
            opacity: isLoading || !pageName.trim() ? 0.5 : 1
          }}
        >
          💾 Save Page
        </button>
        <button
          onClick={() => setShowLoadList(!showLoadList)}
          disabled={isLoading}
          className="button"
          style={{
            flex: 1,
            background: '#2196F3',
            color: 'white',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          📁 {showLoadList ? 'Hide' : 'Load Page'}
        </button>
      </div>

      {showLoadList && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          border: '1px solid #ddd',
          borderRadius: '4px',
          background: 'white',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {savedPages.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No saved pages</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {savedPages.map(page => (
                <li key={page} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee'
                }}>
                  <button
                    onClick={() => handleLoad(page)}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#2196F3',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      fontSize: '1rem'
                    }}
                  >
                    {page}
                  </button>
                  <button
                    onClick={() => handleDelete(page)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {message && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          borderRadius: '4px',
          background: message.startsWith('✓') ? '#d4edda' : '#f8d7da',
          color: message.startsWith('✓') ? '#155724' : '#721c24',
          fontSize: '0.875rem'
        }}>
          {message}
        </div>
      )}
    </div>
  );
}
```

#### 1.4 Update PageBuilderUI

**File:** `src/components/pagebuilder/components/PageBuilderUI.tsx`

Add to imports:
```typescript
import { SaveLoadSection } from './SaveLoadSection';
```

Add to component:
```typescript
// Add handler for loading saved pages
function handleLoadPage(data: PageData) {
  setPageJSON(data);
  setEditableComponent({});
  setSelectedPath('');
  setEditMode(null);
}
```

Add SaveLoadSection to JSX (place after PageSectionHeader in left column):
```tsx
<PageSectionHeader title="Component Editor" />
<SaveLoadSection 
  pageData={pageJSON}
  onLoad={handleLoadPage}
/>
<ComponentSelector .../>
```

#### 1.5 Export from Package

**File:** `src/components/pagebuilder/lib/index.ts` (create if doesn't exist)

```typescript
export * from './pageStorage';
export * from './pageStorageTypes';
```

---

### Step 2: Next.js Project Setup

For each Next.js project (brianwhaley, pixelated, palmetto-epoxy):

#### 2.1 Create Data Directory

```bash
mkdir -p public/data/pages
```

Add `.gitkeep` file:
```bash
touch public/data/pages/.gitkeep
```

#### 2.2 Create API Routes

**File:** `src/app/api/pagebuilder/list/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { listPages } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export async function GET() {
  const result = await listPages();
  return NextResponse.json(result);
}
```

**File:** `src/app/api/pagebuilder/load/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { loadPage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({
      success: false,
      message: 'Page name is required'
    }, { status: 400 });
  }

  const result = await loadPage(name);
  return NextResponse.json(result);
}
```

**File:** `src/app/api/pagebuilder/save/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { savePage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Invalid request: ${error}`
    }, { status: 400 });
  }
}
```

**File:** `src/app/api/pagebuilder/delete/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { deletePage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({
      success: false,
      message: 'Page name is required'
    }, { status: 400 });
  }

  const result = await deletePage(name);
  return NextResponse.json(result);
}
```

#### 2.3 Environment Configuration (Optional)

**File:** `.env.local`

```env
# Override default pages directory if needed
PAGES_DIR=public/data/pages
```

---

### Step 3: Update Package and Deploy

#### 3.1 Build pixelated-components

```bash
cd pixelated-components
npm run build
npm version patch
```

#### 3.2 Update Next.js Projects

```bash
cd ../brianwhaley  # or pixelated, palmetto-epoxy
npm install @pixelated-tech/components@latest
```

#### 3.3 Test

1. Run dev server: `npm run dev`
2. Navigate to PageBuilder page
3. Create a page with components
4. Enter page name and click "Save Page"
5. Verify file created in `public/data/pages/`
6. Click "Load Page" to see saved pages
7. Test loading and deleting pages

---

## Usage Examples

### In PageBuilder UI

```typescript
// User workflow:
// 1. Build page with components
// 2. Enter name: "landing-page"
// 3. Click "Save Page"
// 4. File saved to: public/data/pages/landing-page.json
// 5. Click "Load Page" to see all saved pages
// 6. Click page name to load
// 7. Click 🗑️ to delete
```

### Using Saved Pages in PageEngine

#### Option 1: Direct Import (Build-time, Fastest)

```typescript
// src/app/landing/page.tsx
import { PageEngine } from '@pixelated-tech/components';

export default function LandingPage() {
  // Load pageData from your CMS or API
  return <PageEngine pageData={pageData} />;
}
```

**Pros:**
- Fastest (no API call)
- Works with static export
- Data bundled at build time

**Cons:**
- Must rebuild to change page
- Can't switch pages dynamically

---

#### Option 2: Client-side API Call (Runtime, Dynamic)

```typescript
// src/app/landing/page.tsx
"use client";

import { PageEngine } from '@pixelated-tech/components';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    fetch('/api/pagebuilder/load?name=landing-page')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setPageData(result.data);
        }
      });
  }, []);

  if (!pageData) return <div>Loading...</div>;

  return <PageEngine pageData={pageData} />;
}
```

**Pros:**
- Dynamic page switching
- Can change without rebuild
- Can use page name from URL params

**Cons:**
- Requires running server
- Extra HTTP request
- Loading state needed

---

#### Option 3: Server Component (Next.js 13+, Best of Both)

```typescript
// src/app/landing/page.tsx
import { PageEngine } from '@pixelated-tech/components';
import { loadPage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export default async function LandingPage() {
  const result = await loadPage('landing-page');
  
  if (!result.success || !result.data) {
    return <div>Page not found</div>;
  }

  return <PageEngine pageData={result.data} />;
}
```

**Pros:**
- Server-side rendering
- No client API call
- Still dynamic
- SEO friendly

**Cons:**
- Requires server (can't use static export)
- Must use Next.js 13+ App Router

---

#### Option 4: Dynamic Route with URL Parameter

```typescript
// src/app/pages/[slug]/page.tsx
import { PageEngine } from '@pixelated-tech/components';
import { loadPage } from '@pixelated-tech/components/pagebuilder/lib/pageStorage';

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const result = await loadPage(params.slug);
  
  if (!result.success || !result.data) {
    return <div>Page not found</div>;
  }

  return <PageEngine pageData={result.data} />;
}

// Generate static params at build time
export async function generateStaticParams() {
  const { listPages } = await import('@pixelated-tech/components/pagebuilder/lib/pageStorage');
  const result = await listPages();
  
  return result.pages.map((page) => ({
    slug: page,
  }));
}
```

**Pros:**
- One route handles all pages
- Can generate static pages at build time
- SEO friendly
- URL-based page selection

**Cons:**
- Requires build step for new pages
- More complex setup

---

## File Structure After Implementation

```
pixelated-components/
  src/components/pagebuilder/
    lib/
      pageStorage.ts              ← Core functions
      pageStorageTypes.ts         ← Types
      index.ts                    ← Exports
    components/
      SaveLoadSection.tsx         ← Save/Load UI
      PageBuilderUI.tsx           ← Updated with SaveLoadSection

brianwhaley/ (and other Next.js projects)
  public/
    data/
      pages/
        .gitkeep
        landing-page.json         ← Saved pages
        about.json
        contact.json
  src/app/
    api/
      pagebuilder/
        list/route.ts             ← API wrapper
        load/route.ts             ← API wrapper
        save/route.ts             ← API wrapper
        delete/route.ts           ← API wrapper
```

---

## Testing Checklist

- [ ] Can save a new page
- [ ] Can load an existing page
- [ ] Can delete a page
- [ ] Can list all pages
- [ ] Invalid page names are rejected
- [ ] Overwriting shows confirmation
- [ ] Error messages display correctly
- [ ] Success messages display correctly
- [ ] Files appear in `public/data/pages/`
- [ ] Can use saved pages with PageEngine (all 3 methods)

---

## Future Enhancements

- Add page metadata (created date, modified date, description)
- Add thumbnail preview generation
- Add duplicate/clone page functionality
- Add export all pages as ZIP
- Add import pages from ZIP
- Add search/filter for saved pages
- Add categories/tags for organization
