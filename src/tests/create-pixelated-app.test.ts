import { describe, it, expect } from 'vitest';
import { loadManifest, findTemplateForSlug } from '../scripts/create-pixelated-app-template-mapper.js';
import { addRouteEntry } from '../scripts/create-pixelated-app.js';
import path from 'path';

describe('create-pixelated-app template mapping', () => {
  it('finds the Services template by alias', async () => {
    const manifest = await loadManifest(path.resolve(__dirname, '..', 'scripts'));
    expect(manifest).toBeTruthy();
    const tmpl = findTemplateForSlug(manifest, 'services');
    expect(tmpl).toBeTruthy();
    expect(tmpl.name).toBe('Services');
  });

  it('fuzzy matches contact-us to Contact template', async () => {
    const manifest = await loadManifest(path.resolve(__dirname, '..', 'scripts'));
    const tmpl = findTemplateForSlug(manifest, 'contact-us');
    expect(tmpl).toBeTruthy();
    expect(tmpl.name).toBe('Contact');
  });
});

describe('route management', () => {
  it('adds a services route when missing and prevents duplicates', () => {
    const routesJson = {
      routes: [
        { name: 'Home', path: '/', title: 'Test - Home', description: '', keywords: '' },
        { name: 'Contact', path: '/contact', title: 'Test - Contact', description: '', keywords: '' }
      ]
    };

    const added = addRouteEntry(routesJson, 'services', 'Services', 'Test');
    expect(added).toBe(true);
    expect(routesJson.routes.some(r => r.path === '/services')).toBe(true);

    // Trying again should not add a duplicate
    const addedAgain = addRouteEntry(routesJson, 'services', 'Services', 'Test');
    expect(addedAgain).toBe(false);

    // Check the title formatting
    const svc = routesJson.routes.find(r => r.path === '/services');
    expect(svc).toBeDefined();
    expect(svc!.title).toBe('Test - Services');
    expect(svc!.name).toBe('Services');
  });
});
