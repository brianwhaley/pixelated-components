import { NextResponse } from 'next/server';
import { loadSitesConfig } from '@pixelated-tech/components/server';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function GET() {
  try {
    // Use relative path from this file to the data directory
    const sitesPath = path.join(__dirname, '../../data/sites.json');
    const sites = await loadSitesConfig(sitesPath);
    return NextResponse.json(sites);
  } catch (error) {
    console.error('Error loading sites:', error);
    return NextResponse.json({ error: 'Failed to load sites' }, { status: 500 });
  }
}