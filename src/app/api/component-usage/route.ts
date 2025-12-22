import { promises as fs } from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import sites from '@/data/sites.json';

// Static list of components from pixelated-components library
const COMPONENT_NAMES = [
  'Accordion', 'Callout', 'CSS', 'Image', 'Loading', 'MicroInteractions', 'Modal',
  'Semantic', 'SidePanel', 'Table', 'WordPress', 'Contentful', 'PageBuilder',
  'PageEngine', 'Carousel', 'Forms', 'FormBuilder', 'FormComponents', 'FormEngine',
  'Menu', 'Tab', 'Tiles', 'ComponentPropertiesForm', 'ComponentSelector',
  'ComponentTree', 'ConfigBuilder', 'PageBuilderUI', 'SaveLoadSection',
  'NotFound', 'GoogleAnalytics', 'GoogleMap', 'GoogleSearch', 'JSONLD',
  'Manifest', 'MetaTags', 'SchemaBlogPosting', 'SchemaLocalBusiness',
  'SchemaRecipe', 'SchemaServices', 'SchemaWebsite', 'Sitemap', 'SocialCards',
  'BuzzwordBingo', 'Markdown', 'Recipe', 'Resume', 'Timeline', 'Calendly',
  'Cloudinary', 'GoogleReviews', 'Gravatar', 'HubSpot', 'Instagram', 'Flickr',
  'PayPal', 'ShoppingCart', 'EBay', 'NerdJoke', 'Yelp'
];

// Get all components from the library
async function getComponents() {
  try {
    // Return static list instead of dynamic import
    return COMPONENT_NAMES.sort();
  } catch (error) {
    console.error('Error getting components:', error);
    return [];
  }
}

// Check if a component is used in a site
async function checkComponentUsage(sitePath: string, componentName: string): Promise<boolean> {
  try {
    const files = await getAllFiles(sitePath, ['.tsx', '.ts', '.jsx', '.js']);
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      // Check for import statements - optimized patterns
      if (content.includes('@pixelated-tech/components') &&
          (content.includes(componentName) ||
           new RegExp(`import.*${componentName}.*from.*@pixelated-tech/components`).test(content))) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error checking usage for ${componentName} in ${sitePath}:`, error);
    return false;
  }
}

// Get all files recursively
async function getAllFiles(dirPath: string, extensions: string[] = []): Promise<string[]> {
  const files: string[] = [];

  async function scan(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip common non-source directories
        if (!['node_modules', '.next', '.git', 'out', 'dist', 'build', '.DS_Store'].includes(entry.name)) {
          await scan(fullPath);
        }
      } else if (entry.isFile()) {
        // Check if file has desired extension or if no extensions specified
        const ext = path.extname(entry.name);
        if (extensions.length === 0 || extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  try {
    await scan(dirPath);
  } catch {
    // Dir doesn't exist, continue
  }

  // If no source dirs found, scan the whole dir but exclude common non-source
  if (files.length === 0) {
    await scan(dirPath);
  }

  return files;
}

export async function GET(request: NextRequest) {
  try {
    const components = await getComponents();
    const siteList = sites as Array<{ name: string; localPath: string }>;

    // Build usage matrix in parallel
    const usageMatrix: { [component: string]: { [site: string]: boolean } } = {};

    // Initialize matrix
    for (const component of components) {
      usageMatrix[component] = {};
      for (const site of siteList) {
        usageMatrix[component][site.name] = false; // default
      }
    }

    // Collect all check promises
    const checkPromises = components.flatMap(component =>
      siteList.map(site =>
        checkComponentUsage(site.localPath, component).then(isUsed => ({
          component,
          siteName: site.name,
          isUsed
        }))
      )
    );

    // Run all checks in parallel
    const results = await Promise.allSettled(checkPromises);

    // Populate matrix with results
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        const { component, siteName, isUsed } = result.value;
        usageMatrix[component][siteName] = isUsed;
      } else {
        console.error('Check failed:', result.reason);
      }
    });

    return NextResponse.json({
      components,
      siteList,
      usageMatrix
    });
  } catch (error) {
    console.error('Error in component-usage API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}