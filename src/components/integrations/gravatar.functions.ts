// Gravatar integration functions
// Fetch avatar and profile data from Gravatar API

import md5 from 'md5';
import { smartFetch } from '../foundation/smartfetch';
import { buildUrl } from '../foundation/urlbuilder';

export type GravatarAccount = {
	domain: string;
	display: string;
	url: string;
	iconUrl?: string;
	username: string;
	verified: boolean;
	name: string;
	shortname: string;
};

export type GravatarProfile = {
	hash: string;
	requestHash: string;
	profileUrl: string;
	preferredUsername: string;
	thumbnailUrl: string;
	displayName: string;
	pronouns?: string;
	aboutMe?: string;
	currentLocation?: string;
	job_title?: string;
	company?: string;
	accounts?: GravatarAccount[];
	emails?: Array<{ primary: string; value: string }>;
};

export type GravatarResponse = {
	entry: GravatarProfile[];
};

/**
 * Generate MD5 hash of email for Gravatar lookups (works in browser and Node.js)
 * @param email - Email address
 * @returns MD5 hash (lowercase, trimmed)
 */
function getGravatarHash(email: string): string {
	return md5(email.trim().toLowerCase());
}

/**
 * Get Gravatar avatar URL from email
 * @param email - Email address
 * @param size - Image size in pixels (default 200)
 * @param defaultImage - Default image type: 404, mp (mystery person), identicon, monsterid, wavatar, retro, blank
 * @returns Gravatar avatar URL
 */
export function getGravatarAvatarUrl(
	email: string,
	size = 200,
	defaultImage: '404' | 'mp' | 'identicon' | 'monsterid' | 'wavatar' | 'retro' | 'blank' = 'mp'
): string {
	const hash = getGravatarHash(email);
	return buildUrl({
		baseUrl: 'https://www.gravatar.com',
		pathSegments: ['avatar', hash],
		params: { s: size, d: defaultImage },
	});
}

/**
 * Fetch full Gravatar profile data
 * @param email - Email address
 * @returns Promise of Gravatar profile or null if not found
 */
export async function getGravatarProfile(email: string): Promise<GravatarProfile | null> {
	const hash = getGravatarHash(email);
	const url = buildUrl({
		baseUrl: 'https://en.gravatar.com',
		pathSegments: [hash + '.json'],
	});

	try {
		const data: GravatarResponse = await smartFetch(url, { });

		if (!data.entry || data.entry.length === 0) return null;
		return data.entry[0];
	} catch (error) {
		// Silently fail on CORS or network errors - Gravatar is optional
		// CORS errors are expected in some environments and don't indicate user data issues
		return null;
	}
}

/**
 * Extract social account URL by shortname
 * @param profile - Gravatar profile
 * @param shortname - Account shortname (e.g., 'github', 'linkedin', 'twitter')
 * @returns URL or undefined if not found
 */
export function getGravatarAccountUrl(profile: GravatarProfile, shortname: string): string | undefined {
	return profile.accounts?.find((acc) => acc.shortname === shortname)?.url;
}


