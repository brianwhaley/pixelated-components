import React, { useEffect, useState } from 'react';
import { GravatarCard, type GravatarCardType } from '@/components/general/gravatar.components';
import { getGravatarProfile, type GravatarProfile } from '@/components/general/gravatar.functions';

// Wrapper to handle async data fetching for the story
const GravatarStoryWrapper = (args: GravatarCardType & { email?: string }) => {
	const { email, ...componentProps } = args;
	const [fetchedProfile, setFetchedProfile] = useState<GravatarProfile | null>(null);
	const [loading, setLoading] = useState(!!email);

	useEffect(() => {
		if (email) {
			setLoading(true);
			getGravatarProfile(email).then((data) => {
				setFetchedProfile(data);
				setLoading(false);
			});
		} else {
			setFetchedProfile(null);
			setLoading(false);
		}
	}, [email]);

	if (loading) return <div style={{ padding: 16 }}>Loading profile for {email}...</div>;

	return <GravatarCard profile={fetchedProfile} {...componentProps} />;
};

export default {
	title: 'CMS',
	component: GravatarCard,
	argTypes: {
		layout: {
			control: 'radio',
			options: ['horizontal', 'vertical'],
			description: 'Layout orientation of the card',
		},
		direction: {
			control: 'radio',
			options: ['left', 'right'],
			description: 'Position of the photo (only for horizontal layout)',
			if: { arg: 'layout', eq: 'horizontal' },
		},
		avatarSize: {
			control: { type: 'range', min: 40, max: 300, step: 10 },
			description: 'Size of the avatar image in pixels',
		},
		compact: {
			control: 'boolean',
			description: 'Whether to use the compact variant',
		},
		displayName: { control: 'text' },
		job_title: { control: 'text' },
		company: { control: 'text' },
		currentLocation: { control: 'text' },
		aboutMe: { control: 'text' },
		// Custom arg for the wrapper
		email: {
			control: 'text',
			description: 'Email to fetch Gravatar profile for (clearing this uses manual data)',
			table: { category: 'Data Fetching' },
		},
	},
};

export const Gravatar_Playground = (args: any) => <GravatarStoryWrapper {...args} />;
Gravatar_Playground.args = {
	email: 'brian@pixelated.tech',
	layout: 'horizontal',
	direction: 'left',
	avatarSize: 120,
	compact: false,
};

export const Gravatar_ManualData = (args: any) => <GravatarStoryWrapper {...args} />;
Gravatar_ManualData.args = {
	email: '',
	displayName: 'Brian Whaley',
	job_title: 'Founder & Designer',
	company: 'PixelVivid',
	currentLocation: 'Denville, NJ',
	aboutMe: 'Building beautiful web experiences for over a decade.',
	socialLinks: {
		github: 'https://github.com/btwhaley',
		linkedin: 'https://linkedin.com/in/brianwhaley',
		website: 'https://pixelvivid.com',
	},
	layout: 'horizontal',
	direction: 'left',
	avatarSize: 120,
};

