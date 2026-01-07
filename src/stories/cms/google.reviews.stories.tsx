import React from 'react';
import { GoogleReviewsCard } from '@/components/general/google.reviews.components';

export default {
	title: 'CMS',
	component: GoogleReviewsCard,
	parameters: {
		docs: {
			description: {
				component: `
**Note:** This component requires a valid Google Maps API key with Places API enabled.

This story demonstrates the component using a proxy server to bypass CORS restrictions.
In production, you can either:
1. Use a proxy server (recommended for client-side usage)
2. Use server-side rendering
3. Configure your API key to allow your domain

Example usage with proxy:
\`\`\`tsx
<GoogleReviewsCard
  placeId="ChIJPbCLBDfb0IkREeS_RNxKIbw"
  proxyBase="https://proxy.pixelated.tech/prod/proxy?url="
  apiKey="your-google-maps-api-key"
/>
\`\`\`

Example usage without proxy (server-side only):
\`\`\`tsx
<GoogleReviewsCard
  placeId="ChIJPbCLBDfb0IkREeS_RNxKIbw"
  apiKey="your-google-maps-api-key"
/>
\`\`\`
				`,
			},
		},
	},
};

export const ReviewsByPlaceId = () => (
	<div>
		<p style={{ color: 'green', marginBottom: '1rem' }}>
			✅ Using proxy server to bypass CORS restrictions.
		</p>
		<GoogleReviewsCard
			placeId="ChIJPbCLBDfb0IkREeS_RNxKIbw"
			language="en"
			maxReviews={3}
			proxyBase="https://proxy.pixelated.tech/prod/proxy?url="
			apiKey="AIzaSyBtknq7LHzN0xb0lIN3K0CXXf0swVp6ReA"
		/>
	</div>
);
ReviewsByPlaceId.storyName = 'Google Reviews by place_id';

export const ReviewsWithoutProxy = () => (
	<div>
		<p style={{ color: 'orange', marginBottom: '1rem' }}>
			⚠️ Direct API calls (will fail in browser due to CORS).
			Use server-side rendering or a proxy for production.
		</p>
		<GoogleReviewsCard
			placeId="ChIJPbCLBDfb0IkREeS_RNxKIbw"
			language="en"
			maxReviews={3}
			apiKey="AIzaSyBtknq7LHzN0xb0lIN3K0CXXf0swVp6ReA"
		/>
	</div>
);
ReviewsWithoutProxy.storyName = 'Google Reviews (Direct API - Server Only)';
