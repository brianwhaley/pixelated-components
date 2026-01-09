import React from 'react';
import { GoogleReviewsCard } from '@/components/general/google.reviews.components';

export default {
	title: 'CMS/Google Reviews',
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

export const Default: any = Template.bind({});
Default.storyName = 'Standard Reviews (Config Driven)';

export const ManualOverride: any = Template.bind({});
ManualOverride.args = {
	apiKey: 'AIzaSyBJVi0O9Ir9imRgINLZbojTifatX-Z4aUs',
	proxyBase: 'https://proxy.pixelated.tech/prod/proxy?url=',
};
ManualOverride.storyName = 'Manual Props Override';
