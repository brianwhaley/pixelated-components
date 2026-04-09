import React from 'react';
import { InstagramTiles } from '@/components/integrations/instagram.components';

/**
 * Instagram Graph API Integration with buildUrl
 *
 * The Instagram integration now uses buildUrl() for consistent URL construction:
 *
 * **Media Endpoint URL Construction:**
 * ```typescript
 * buildUrl({
 *   baseUrl: 'https://graph.instagram.com',
 *   pathSegments: [userId, 'media'],
 *   params: {
 *     fields: 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,username',
 *     limit: 25,
 *     access_token: token
 *   }
 * })
 * // Result: https://graph.instagram.com/{userId}/media?fields=...&limit=25&access_token=...
 * ```
 *
 * **Features:**
 * - Automatic URL encoding of comma-separated field values
 * - Support for userId='me' (current authenticated user)
 * - Configurable limit (1-100, defaults to 25)
 * - Custom field selection for flexible response structure
 * - Type-safe parameter handling for access tokens
 *
 * **Benefits:**
 * - Consistent URL construction with automatic encoding
 * - Transparent integration with smartFetch() for automatic retries
 * - Type-safe Instagram graph API endpoint formatting
 * - Easier pagination and field customization
 * - Enhanced error handling
 *
 * **Implementation Files:**
 * - URL building logic: `src/components/general/urlbuilder.ts`
 * - Media fetching: `src/components/integrations/instagram.functions.ts`
 * - UI Component: `src/components/integrations/instagram.components.tsx`
 */

export default {
	title: 'General',
	component: InstagramTiles,
	argTypes: {
		limit: { control: { type: 'number', min: 1, max: 50 } },
		rowCount: { control: { type: 'number', min: 1, max: 6 } },
		includeVideos: { control: 'boolean' },
		includeCaptions: { control: 'boolean' },
		useThumbnails: { control: 'boolean' },
		accessToken: { control: 'text' },
		userId: { control: 'text' },
	},
	args: {
		limit: 12,
		rowCount: 3,
		includeVideos: true,
		includeCaptions: false,
		useThumbnails: true,
	},
};

const Template = (args: any) => <InstagramTiles {...args} />;

export const InstagramDefault: any = Template.bind({});
InstagramDefault.storyName = 'Instagram Grid';

export const InstagramWithCaptions: any = Template.bind({});
InstagramWithCaptions.args = {
	limit: 9,
	includeCaptions: true,
};
InstagramWithCaptions.storyName = 'Instagram with Captions';
