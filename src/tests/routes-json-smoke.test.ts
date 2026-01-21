import { describe, it, expect } from 'vitest';
import myRoutes from '@/data/routes.json';
import { flattenRoutes } from '../components/general/sitemap';

describe('routes.json — integration smoke', () => {
  it('uses canonical siteInfo from src/data/routes.json', () => {
    expect(myRoutes.siteInfo?.name).toBe('Pixelated Technologies');
  });

  it('exposes visualdesign tokens (primary-color)', () => {
    expect(myRoutes.visualdesign).toBeTruthy();
    const primary = myRoutes.visualdesign?.['primary-color'];
    expect(primary).toBeTruthy();
    expect(primary?.value).toBe('#336699');
  });

  it('flattenRoutes(routes) contains the Buzzword Bingo route', () => {
    const flat = flattenRoutes(myRoutes.routes || []);
    expect(Array.isArray(flat)).toBe(true);
    expect(flat.some((r: any) => String(r.path) === '/buzzwordbingo')).toBe(true);
  });
});
