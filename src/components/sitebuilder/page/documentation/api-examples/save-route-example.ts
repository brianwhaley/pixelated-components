import { NextResponse } from 'next/server';
// Choose ONE of these imports:

// Option 1: File-based storage
import { savePage } from '../../lib/pageStorageLocal';

// Option 2: Contentful storage
// import { savePage } from '@pixelated-tech/components/server';
// import type { ContentfulConfig } from '@pixelated-tech/components/server';

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

		// ===== OPTION 1: File-based storage =====
		const result = await savePage(name, data);
		
		// ===== OPTION 2: Contentful storage =====
		// ===== OPTION 2: Contentful storage (recommended when using the unified PIXELATED config) =====
		// The app reads the unified config on the server via `getFullPixelatedConfig()` which
		// sources values from `src/app/config/pixelated.config.json` and uses `PIXELATED_CONFIG_KEY` for decryption.
		// Example (server-side):
		// import { getFullPixelatedConfig } from '@pixelated-tech/components/server';
		// const cfg = getFullPixelatedConfig();
		// const contentfulConfig = cfg.contentful;
		// const result = await savePage(name, data, contentfulConfig);

		return NextResponse.json(result);
	} catch (error) {
		return NextResponse.json({
			success: false,
			message: `Invalid request: ${error}`
		}, { status: 400 });
	}
}
