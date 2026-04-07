import React from 'react';
import { GoogleReviewsCard } from '@/components/integrations/google.reviews.components';

/**
 * INTEGRATION REFERENCE: Google APIs URL Building with buildUrl
 *
 * The Google API integrations use the buildUrl utility to construct consistent,
 * properly-formatted URLs for multiple Google service endpoints.
 *
 * EXAMPLE 1: Google Places Autocomplete API
 *
 * const url = buildUrl({
 *   baseUrl: 'https://maps.googleapis.com',
 *   pathSegments: ['maps', 'api', 'place', 'autocomplete', 'json'],
 *   params: {
 *     input: 'address query',
 *     key: apiKey,
 *     sessiontoken: sessionToken,
 *     components: 'country:us'
 *   }
 * });
 *
 * EXAMPLE 2: Google Places Details API (for reviews)
 *
 * const url = buildUrl({
 *   baseUrl: 'https://maps.googleapis.com',
 *   pathSegments: ['maps', 'api', 'place', 'details', 'json'],
 *   params: {
 *     place_id: placeId,
 *     fields: 'reviews,name,place_id,formatted_address',
 *     key: apiKey,
 *     language: 'en'
 *   }
 * });
 *
 * EXAMPLE 3: Google Places v1 API (for text search)
 *
 * const url = buildUrl({
 *   baseUrl: 'https://places.googleapis.com',
 *   pathSegments: ['v1', 'places:searchText'],
 *   params: {
 *     key: apiKey,
 *     pageToken: pageToken  // optional
 *   }
 * });
 * // Then POST with body: { textQuery: search, pageSize: 20 }
 *
 * BENEFITS:
 * - Consistent URL formatting across Google services (Maps, Places v1)
 * - Automatic parameter encoding (special characters, arrays)
 * - Centralized query parameter handling
 * - Support for pagination tokens and optional parameters
 *
 * See google.reviews.functions.ts and googleplaces.ts for implementation
 */

export default {
	title: 'General',
	component: GoogleReviewsCard,
	argTypes: {
		placeId: { control: 'text' },
		maxReviews: { control: { type: 'number', min: 1, max: 20 } },
		language: { control: 'text' },
		apiKey: { control: 'text' },
		proxyBase: { control: 'text' },
	},
	args: {
		placeId: 'ChIJPbCLBDfb0IkREeS_RNxKIbw', 
		maxReviews: 3,
		language: 'en',
	},
};

const Template = (args: any) => <GoogleReviewsCard {...args} />;

export const GoogleReviewsDefault: any = Template.bind({});
GoogleReviewsDefault.storyName = 'Google Reviews';
