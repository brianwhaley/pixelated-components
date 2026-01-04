import { NextRequest, NextResponse } from 'next/server';
import { migrateContentType, type ContentfulCredentials } from '@pixelated-tech/components';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sourceSpaceId,
      sourceAccessToken,
      sourceEnvironment,
      targetSpaceId,
      targetAccessToken,
      targetEnvironment,
      contentTypeId
    } = body;

    if (!sourceSpaceId || !sourceAccessToken || !targetSpaceId || !targetAccessToken || !contentTypeId) {
      return NextResponse.json(
        { success: false, error: 'All credentials and content type ID are required' },
        { status: 400 }
      );
    }

    const sourceCredentials: ContentfulCredentials = {
      spaceId: sourceSpaceId,
      accessToken: sourceAccessToken,
      environment: sourceEnvironment || 'master'
    };

    const targetCredentials: ContentfulCredentials = {
      spaceId: targetSpaceId,
      accessToken: targetAccessToken,
      environment: targetEnvironment || 'master'
    };

    const result = await migrateContentType(sourceCredentials, targetCredentials, contentTypeId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Contentful migration error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}