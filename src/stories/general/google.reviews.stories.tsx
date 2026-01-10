import React from 'react';
import { GoogleReviewsCard } from '@/components/general/google.reviews.components';

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
