import { NextRequest, NextResponse } from 'next/server';
import { validateContentfulCredentials, type ContentfulCredentials } from '@pixelated-tech/components';

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

		const result = await validateContentfulCredentials(credentials);

		return NextResponse.json({
			success: result.valid,
			error: result.error
		});
	} catch (error) {
		console.error('Contentful validation error:', error);
		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 }
		);
	}
}