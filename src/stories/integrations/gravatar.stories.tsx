import React, { useEffect, useState } from 'react';
import { GravatarCard, type GravatarCardType } from '@/components/integrations/gravatar.components';
import { getGravatarProfile, type GravatarProfile } from '@/components/integrations/gravatar.functions';

/**
 * Gravatar API Integration with buildUrl
 *
 * The Gravatar integration now uses buildUrl() for consistent URL construction:
 *
 * **Avatar URL Construction:**
 * ```typescript
 * buildUrl({
 *   baseUrl: 'https://www.gravatar.com',
 *   pathSegments: ['avatar', hash],
 *   params: { s: size, d: defaultImage }
 * })
 * // Result: https://www.gravatar.com/avatar/{hash}?s=200&d=mp
 * ```
 *
 * **Profile JSON URL Construction:**
 * ```typescript
 * buildUrl({
 *   baseUrl: 'https://en.gravatar.com',
 *   pathSegments: [hash, 'json']
 * })
 * // Result: https://en.gravatar.com/{hash}/json
 * ```
 *
 * **Benefits:**
 * - Automatic URL parameter encoding (e.g., special characters in hashes)
 * - Consistent path segment joining with `/` separators
 * - Type-safe parameter handling
 * - Transparent integration with smartFetch() for retries and caching
 * - Enhanced error handling with domain context
 * - Timeout protection (30s default)
 * - Debug logging support
 *
 * **Implementation Files:**
 * - URL building logic: `src/components/general/urlbuilder.ts`
 * - Avatar/Profile functions: `src/components/integrations/gravatar.functions.ts`
 * - UI Component: `src/components/integrations/gravatar.components.tsx`
 */
const GravatarStoryWrapper = (args: GravatarCardType & { email?: string; debug?: boolean }) => {
	const { email, debug, ...componentProps } = args;
	const [fetchedProfile, setFetchedProfile] = useState<GravatarProfile | null>(null);
	const [loading, setLoading] = useState(!!email);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (email) {
			setLoading(true);
			setError(null);
			getGravatarProfile(email)
				.then((data) => {
					setFetchedProfile(data);
					setLoading(false);
				})
				.catch((err) => {
					setError(err instanceof Error ? err.message : 'Failed to fetch profile');
					setLoading(false);
				});
		} else {
			setFetchedProfile(null);
			setLoading(false);
			setError(null);
		}
	}, [email]);

	if (loading) return <div style={{ padding: 16 }}>Loading profile for {email}...</div>;

	if (error) {
		return (
			<div style={{ padding: 16, color: '#d32f2f', fontFamily: 'monospace', fontSize: 12 }}>
				<strong>Error loading profile:</strong>
				<br />
				{error}
				<br />
				<small>smartFetch automatically retried with exponential backoff before failing</small>
			</div>
		);
	}

	return <GravatarCard profile={fetchedProfile} {...componentProps} />;
};

export default {
	title: 'Integrations/Gravatar',
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

