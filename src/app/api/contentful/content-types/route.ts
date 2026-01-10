import { NextRequest, NextResponse } from 'next/server';
import { getContentTypes, type ContentfulCredentials } from '@pixelated-tech/components';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { spaceId, accessToken, environment } = body;

		if (!spaceId || !accessToken) {
			return NextResponse.json(
				{ success: false, error: 'Space ID and access token are required' },
				{ status: 400 }
			);
		}

		const credentials: ContentfulCredentials = {
			spaceId,
			accessToken,
			environment: environment || 'master'
		};

		const contentTypes = await getContentTypes(credentials);

		return NextResponse.json({
			success: true,
			data: contentTypes
		});
	} catch (error) {
		console.error('Contentful content types error:', error);
		return NextResponse.json(
			{ success: false, error: (error as Error).message },
			{ status: 500 }
		);
	}
}