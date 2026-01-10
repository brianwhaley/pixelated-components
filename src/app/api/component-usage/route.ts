import { NextResponse } from 'next/server';
import { loadSitesConfig } from '@pixelated-tech/components/server';
import { discoverComponentsFromLibrary, analyzeComponentUsage } from '@pixelated-tech/components/adminserver';

// Get all components from the library (dynamic discovery)
async function getComponents() {
	return await discoverComponentsFromLibrary();
}

export async function GET() {
	try {
		const components = await getComponents();
		const sites = await loadSitesConfig();
		const siteList = sites.map(site => ({ name: site.name, localPath: site.localPath }));

		const result = await analyzeComponentUsage(components, siteList);

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error in component-usage API:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}