import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
	try {
		// Resolve axe-core from node_modules
		const axePath = path.join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js');
		const src = await fs.readFile(axePath, 'utf8');

		return new NextResponse(src, {
			headers: {
				'Content-Type': 'application/javascript; charset=utf-8',
				'Cache-Control': 'public, max-age=86400',
			},
		});
	} catch (error) {
		console.error('Failed to serve axe-core bundle:', error);
		return new NextResponse('/* axe-core not available */', { status: 500, headers: { 'Content-Type': 'application/javascript' } });
	}
}
