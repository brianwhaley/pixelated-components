'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
// import { type GravatarProfile } from './gravatar.functions';
import { SmartImage } from '../general/smartimage';
import { usePixelatedConfig } from '../config/config.client';
import './gravatar.css';

/* export type GravatarCardProps = {
	// Gravatar profile data (fetched server-side)
	profile?: GravatarProfile | null;
	// Field overrides (if provided, these override profile data)
	displayName?: string;
	thumbnailUrl?: string;
	aboutMe?: string;
	currentLocation?: string;
	job_title?: string;
	company?: string;
	pronouns?: string;
	profileUrl?: string;
	// Additional custom fields not in Gravatar
	customRole?: string; // Alternative to job_title
	socialLinks?: {
		github?: string;
		linkedin?: string;
		twitter?: string;
		instagram?: string;
		website?: string;
	};
	// Layout options
	layout?: 'horizontal' | 'vertical';
	direction?: 'left' | 'right'; // photo position (for horizontal layout)
	avatarSize?: number; // in pixels
	compact?: boolean; // compact variant
}; */


/**
 * GravatarCard — Render a profile card using Gravatar profile data, with optional prop overrides.
 *
 * @param {shape} [props.profile] - Gravatar profile object (fetched server-side) including profile fields and accounts.
 * @param {string} [props.hash] - Gravatar hash for the avatar.
 * @param {string} [props.requestHash] - Optional request hash used when fetching the profile.
 * @param {string} [props.profileUrl] - Direct URL to the Gravatar profile.
 * @param {string} [props.preferredUsername] - Preferred username from the profile.
 * @param {string} [props.thumbnailUrl] - Avatar image URL.
 * @param {string} [props.displayName] - Display name to show on the card.
 * @param {string} [props.pronouns] - Display pronouns (if available).
 * @param {string} [props.aboutMe] - Short bio or about text.
 * @param {string} [props.currentLocation] - Location string for the profile.
 * @param {string} [props.job_title] - Job title from the profile.
 * @param {string} [props.company] - Company name from the profile.
 * @param {arrayOf} [props.accounts] - Array of social account objects (domain, url, username, etc.).
 * @param {arrayOf} [props.emails] - Email objects associated with the profile.
 * @param {string} [props.customRole] - Optional custom role to use instead of job_title.
 * @param {shape} [props.socialLinks] - Override object for social links (github, linkedin, twitter, instagram, website).
 * @param {oneOf} [props.layout] - Layout style: 'horizontal' or 'vertical'.
 * @param {oneOf} [props.direction] - Photo position for horizontal layout: 'left' or 'right'.
 * @param {number} [props.avatarSize] - Avatar size in pixels.
 * @param {boolean} [props.compact] - Render a compact variant of the card.
 */
GravatarCard.propTypes = {
	// Gravatar profile data (fetched server-side)
/** Gravatar profile object with common fields */
	profile: PropTypes.shape({
		/** Gravatar hash used to construct avatar URLs */
		hash: PropTypes.string,
		/** Optional request identifier used when fetching the profile */
		requestHash: PropTypes.string,
		/** Direct URL to the Gravatar profile */
		profileUrl: PropTypes.string,
		/** Preferred username from the Gravatar profile */
		preferredUsername: PropTypes.string,
		/** Avatar thumbnail URL from the profile */
		thumbnailUrl: PropTypes.string,
		/** Display name from profile */
		displayName: PropTypes.string,
		/** Pronouns string */
		pronouns: PropTypes.string,
		/** Short bio / about text */
		aboutMe: PropTypes.string,
		/** Current location string */
		currentLocation: PropTypes.string,
		/** Job title from profile */
		job_title: PropTypes.string,
		/** Company name from profile */
		company: PropTypes.string,
		/** Social accounts array */
		accounts: PropTypes.arrayOf(
			PropTypes.shape({
				/** Account domain (e.g., 'github.com') */
				domain: PropTypes.string,
				/** Display label for the account */
				display: PropTypes.string,
				/** URL for the account */
				url: PropTypes.string,
				/** Icon URL for the account */
				iconUrl: PropTypes.string,
				/** Account username */
				username: PropTypes.string,
				/** Whether the account is verified */
				verified: PropTypes.bool,
				/** Full name associated with the account */
				name: PropTypes.string,
				/** Shortname used to identify the service (e.g., 'github') */
				shortname: PropTypes.string,
			})
		),
		/** Email addresses associated with the profile */
		emails: PropTypes.arrayOf(
			PropTypes.shape({
				/** Email primary flag (if applicable) */
				primary: PropTypes.string,
				/** Email address value */
				value: PropTypes.string,
			})
		),
	}),
	// Field overrides (if provided, these override profile data)
	displayName: PropTypes.string,
	thumbnailUrl: PropTypes.string,
	aboutMe: PropTypes.string,
	currentLocation: PropTypes.string,
	job_title: PropTypes.string,
	company: PropTypes.string,
	pronouns: PropTypes.string,
	profileUrl: PropTypes.string,
	// Additional custom fields not in Gravatar
	/** Optional custom role to display instead of job_title */
	customRole: PropTypes.string, // Alternative to job_title
	/** Overrides for social links (preferred over profile accounts) */
	socialLinks: PropTypes.shape({
		/** GitHub profile URL */
		github: PropTypes.string,
		/** LinkedIn profile URL */
		linkedin: PropTypes.string,
		/** Twitter profile URL */
		twitter: PropTypes.string,
		/** Instagram profile URL */
		instagram: PropTypes.string,
		/** Personal website URL */
		website: PropTypes.string,
	}),
	// Layout options
	/** Layout style: 'horizontal' or 'vertical' */
	layout: PropTypes.oneOf(['horizontal', 'vertical']),
	/** Photo position when horizontal: 'left' or 'right' */
	direction: PropTypes.oneOf(['left', 'right']), // photo position (for horizontal layout)
	/** Avatar size in pixels */
	avatarSize: PropTypes.number, // in pixels
	/** Compact card variant */
	compact: PropTypes.bool, // compact variant
};
export type GravatarCardType = InferProps<typeof GravatarCard.propTypes>;
export function GravatarCard(props: GravatarCardType) {
	const {
		profile,
		layout = 'horizontal',
		direction = 'left',
		avatarSize = 120,
		compact = false,
	} = props;

	// Merge: prop overrides take precedence over Gravatar data
	const displayName = props.displayName ?? profile?.displayName ?? 'Unknown';
	const avatarUrl = props.thumbnailUrl ?? profile?.thumbnailUrl ?? `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=${avatarSize}&d=mp`;
	const aboutMe = props.aboutMe ?? profile?.aboutMe;
	const jobTitle = props.job_title ?? props.customRole ?? profile?.job_title;
	const company = props.company ?? profile?.company;
	const location = props.currentLocation ?? profile?.currentLocation;
	const pronouns = props.pronouns ?? profile?.pronouns;
	const profileLink = props.profileUrl ?? profile?.profileUrl;

	// Social links: props override, fallback to Gravatar accounts
	const githubUrl = props.socialLinks?.github ?? profile?.accounts?.find((a) => a && a.shortname === 'github')?.url;
	const linkedinUrl = props.socialLinks?.linkedin ?? profile?.accounts?.find((a) => a && a.shortname === 'linkedin')?.url;
	const twitterUrl = props.socialLinks?.twitter ?? profile?.accounts?.find((a) => a && a.shortname === 'twitter')?.url;
	const instagramUrl = props.socialLinks?.instagram ?? profile?.accounts?.find((a) => a && a.shortname === 'instagram')?.url;
	const websiteUrl = props.socialLinks?.website;

	const isHorizontal = layout === 'horizontal';
	const photoOnRight = direction === 'right';

	const config = usePixelatedConfig();

	const avatarElement = (
		<div className="gravatar-avatar-container">
			<SmartImage
				src={avatarUrl}
				alt={displayName}
				title={displayName}
				width={avatarSize ?? 120}
				height={avatarSize ?? 120}
				quality={100}
				className="gravatar-avatar"
				cloudinaryEnv={config?.cloudinary?.product_env}
				cloudinaryDomain={config?.cloudinary?.baseUrl}
				cloudinaryTransforms={config?.cloudinary?.transforms}
			/>
		</div>
	);

	const contentElement = (
		<div className="gravatar-content">
			<div className="gravatar-header">
				<h3 className="gravatar-name">
					{profileLink ? (
						<a href={profileLink} target="_blank" rel="noopener noreferrer" className="gravatar-name-link">
							{displayName}
						</a>
					) : (
						displayName
					)}
				</h3>
				{pronouns && <span className="gravatar-pronouns">({pronouns})</span>}
			</div>

			{(jobTitle || company) && (
				<div className="gravatar-job-company">
					{jobTitle && <strong>{jobTitle}</strong>}
					{jobTitle && company && <span> at </span>}
					{company && <span>{company}</span>}
				</div>
			)}

			{location && (
				<div className="gravatar-location">
					📍 {location}
				</div>
			)}

			{aboutMe && !compact && (
				<p className="gravatar-about">
					{aboutMe}
				</p>
			)}

			{(githubUrl || linkedinUrl || twitterUrl || instagramUrl || websiteUrl) && (
				<div className="gravatar-social-links">
					{githubUrl && (
						<a href={githubUrl} target="_blank" rel="noopener noreferrer" className="gravatar-social-link">
							GitHub
						</a>
					)}
					{linkedinUrl && (
						<a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="gravatar-social-link gravatar-social-link-linkedin">
							LinkedIn
						</a>
					)}
					{twitterUrl && (
						<a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="gravatar-social-link gravatar-social-link-twitter">
							X
						</a>
					)}
					{instagramUrl && (
						<a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="gravatar-social-link gravatar-social-link-instagram">
							Instagram
						</a>
					)}
					{websiteUrl && (
						<a href={websiteUrl} target="_blank" rel="noopener noreferrer" className="gravatar-social-link gravatar-social-link-website">
							Website
						</a>
					)}
				</div>
			)}
		</div>
	);

	return (
		<div
			className={`gravatar-card ${isHorizontal ? 'gravatar-card-horizontal' : ''} ${compact ? 'gravatar-card-compact' : ''}`}
		>
			{isHorizontal && photoOnRight ? (
				<>
					{contentElement}
					{avatarElement}
				</>
			) : (
				<>
					{avatarElement}
					{contentElement}
				</>
			)}
		</div>
	);
}
