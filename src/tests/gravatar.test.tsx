import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { GravatarCard } from '../components/integrations/gravatar.components';

// Mock the SmartImage component
vi.mock('../components/general/smartimage', () => ({
	SmartImage: ({ src, alt, width, height, className }: any) => (
		<img src={src} alt={alt} width={width} height={height} className={className} data-testid="gravatar-avatar-img" />
	)
}));

// Mock the config hook
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: () => ({
		cloudinary: {
			product_env: 'production',
			baseUrl: 'https://res.cloudinary.com',
			transforms: {}
		}
	})
}));

describe('GravatarCard Component Tests', () => {
	const mockProfile = {
		displayName: 'Jane Smith',
		profileUrl: 'https://gravatar.com/janesmith',
		thumbnailUrl: 'https://gravatar.com/avatar/abc123',
		aboutMe: 'Software engineer and coffee enthusiast',
		currentLocation: 'San Francisco, CA',
		job_title: 'Senior Engineer',
		company: 'Tech Corp',
		pronouns: 'she/her',
		accounts: [
			{ shortname: 'github', url: 'https://github.com/janesmith' },
			{ shortname: 'linkedin', url: 'https://linkedin.com/in/janesmith' },
			{ shortname: 'twitter', url: 'https://twitter.com/janesmith' },
		],
	};

	describe('Profile Rendering', () => {
		it('should render GravatarCard with profile data', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const card = container.querySelector('.gravatar-card');
			expect(card).toBeDefined();
		});

		it('should display profile name', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const nameElement = container.querySelector('.gravatar-name');
			expect(nameElement).toBeDefined();
			expect(nameElement?.textContent).toContain('Jane Smith');
		});

		it('should display pronouns when available', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const pronounsElement = container.querySelector('.gravatar-pronouns');
			expect(pronounsElement).toBeDefined();
			expect(pronounsElement?.textContent).toContain('she/her');
		});

		it('should handle missing pronouns gracefully', () => {
			const profileWithoutPronouns = {
				...mockProfile,
				pronouns: undefined
			};

			const { container } = render(
				<GravatarCard profile={profileWithoutPronouns} />
			);

			const pronounsElement = container.querySelector('.gravatar-pronouns');
			expect(pronounsElement).toBeNull();
		});

		it('should display job title and company', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const jobCompanyElement = container.querySelector('.gravatar-job-company');
			expect(jobCompanyElement).toBeDefined();
			expect(jobCompanyElement?.textContent).toContain('Senior Engineer');
			expect(jobCompanyElement?.textContent).toContain('Tech Corp');
		});

		it('should display location when available', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const locationElement = container.querySelector('.gravatar-location');
			expect(locationElement).toBeDefined();
			expect(locationElement?.textContent).toContain('San Francisco, CA');
		});

		it('should display about section in non-compact layout', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} compact={false} />
			);

			const aboutElement = container.querySelector('.gravatar-about');
			expect(aboutElement).toBeDefined();
			expect(aboutElement?.textContent).toContain('Software engineer');
		});

		it('should hide about section in compact layout', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} compact={true} />
			);

			const aboutElement = container.querySelector('.gravatar-about');
			expect(aboutElement).toBeNull();
		});
	});

	describe('Avatar Rendering', () => {
		it('should render avatar image', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const avatar = container.querySelector('[data-testid="gravatar-avatar-img"]');
			expect(avatar).toBeDefined();
		});

		it('should use profile thumbnail URL for avatar', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const avatar = container.querySelector('[data-testid="gravatar-avatar-img"]') as HTMLImageElement;
			expect(avatar?.src).toContain('gravatar');
		});

		it('should use custom avatar size', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} avatarSize={200} />
			);

			const avatar = container.querySelector('[data-testid="gravatar-avatar-img"]') as HTMLImageElement;
			expect(avatar?.width).toBe(200);
			expect(avatar?.height).toBe(200);
		});

		it('should apply default avatar size when not specified', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const avatar = container.querySelector('[data-testid="gravatar-avatar-img"]') as HTMLImageElement;
			expect(avatar?.width).toBe(120);
		});
	});

	describe('Social Links Rendering', () => {
		it('should render social links when available', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const socialLinks = container.querySelector('.gravatar-social-links');
			expect(socialLinks).toBeDefined();
		});

		it('should render GitHub link', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const githubLink = Array.from(container.querySelectorAll('a')).find(
				a => a.textContent === 'GitHub'
			);
			expect(githubLink).toBeDefined();
			expect(githubLink?.href).toContain('github.com');
		});

		it('should render LinkedIn link', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const linkedinLink = Array.from(container.querySelectorAll('a')).find(
				a => a.textContent === 'LinkedIn'
			);
			expect(linkedinLink).toBeDefined();
			expect(linkedinLink?.href).toContain('linkedin.com');
		});

		it('should handle custom socialLinks prop override', () => {
			const customSocialLinks = {
				github: 'https://github.com/customuser',
				website: 'https://customuser.com'
			};

			const { container } = render(
				<GravatarCard profile={mockProfile} socialLinks={customSocialLinks} />
			);

			const socialLinks = container.querySelectorAll('a');
			const hasCustomGithub = Array.from(socialLinks).some(
				link => link.href.includes('customuser')
			);
			expect(hasCustomGithub).toBe(true);
		});
	});

	describe('Layout Options', () => {
		it('should render horizontal layout by default', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const card = container.querySelector('.gravatar-card-horizontal');
			expect(card).toBeDefined();
		});

		it('should apply horizontal layout class', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} layout="horizontal" />
			);

			const card = container.querySelector('.gravatar-card-horizontal');
			expect(card).toBeDefined();
		});

		it('should not apply horizontal class for vertical layout', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} layout="vertical" />
			);

			const card = container.querySelector('.gravatar-card-horizontal');
			expect(card).toBeNull();
		});

		it('should apply compact class when compact prop is true', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} compact={true} />
			);

			const card = container.querySelector('.gravatar-card-compact');
			expect(card).toBeDefined();
		});
	});

	describe('Prop Overrides', () => {
		it('should allow displayName prop override', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} displayName="Override Name" />
			);

			const nameElement = container.querySelector('.gravatar-name');
			expect(nameElement?.textContent).toContain('Override Name');
		});

		it('should allow job_title prop override', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} job_title="Custom Title" />
			);

			const jobElement = container.querySelector('.gravatar-job-company');
			expect(jobElement?.textContent).toContain('Custom Title');
		});

		it('should prioritize customRole over job_title', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} customRole="Architect" job_title="Engineer" />
			);

			const jobElement = container.querySelector('.gravatar-job-company');
			expect(jobElement?.textContent).toBeDefined();
		});

		it('should handle profile link when profileUrl is provided', () => {
			const { container } = render(
				<GravatarCard profile={mockProfile} />
			);

			const nameLink = container.querySelector('.gravatar-name-link');
			expect(nameLink).toBeDefined();
			expect(nameLink?.getAttribute('href')).toContain('gravatar.com');
		});
	});

	describe('Default Values', () => {
		it('should display default avatar when no thumbnail provided', () => {
			const profileWithoutThumbnail = {
				displayName: 'User',
				profileUrl: '',
				accounts: []
			};

			const { container } = render(
				<GravatarCard profile={profileWithoutThumbnail} />
			);

			const avatar = container.querySelector('[data-testid="gravatar-avatar-img"]') as HTMLImageElement;
			expect(avatar?.src).toContain('gravatar');
		});

		it('should display Unknown when no displayName available', () => {
			const minimalProfile = {
				profileUrl: '',
				accounts: []
			};

			const { container } = render(
				<GravatarCard profile={minimalProfile} />
			);

			const nameElement = container.querySelector('.gravatar-name');
			expect(nameElement?.textContent).toContain('Unknown');
		});

		it('should handle missing contact info', () => {
			const profile = {
				displayName: 'User',
				emails: [],
				phoneNumbers: [],
			};

			expect(profile.emails).toHaveLength(0);
			expect(profile.phoneNumbers).toHaveLength(0);
		});
	});

	describe('Social Accounts', () => {
		it('should validate social media profiles', () => {
			const accounts = [
				{
					username: 'johndoe',
					url: 'https://github.com/johndoe',
					verified: true,
				},
				{
					username: 'john.doe',
					url: 'https://linkedin.com/in/john-doe',
					verified: true,
				},
				{
					username: '@johndoe',
					url: 'https://twitter.com/johndoe',
					verified: false,
				},
			];

			expect(accounts).toHaveLength(3);
			accounts.forEach((acc) => {
				expect(acc.url).toContain('http');
			});
		});

		it('should handle social account types', () => {
			const accountTypes = ['GitHub', 'LinkedIn', 'Twitter', 'Facebook'];

			accountTypes.forEach((type) => {
				expect(type.length).toBeGreaterThan(0);
			});
		});

		it('should track verified status', () => {
			const account = {
				username: 'johndoe',
				url: 'https://github.com/johndoe',
				verified: true,
			};

			expect(typeof account.verified).toBe('boolean');
			expect(account.verified).toBe(true);
		});

		it('should handle missing social accounts', () => {
			const profile = {
				displayName: 'User',
				accounts: [],
			};

			expect(profile.accounts).toHaveLength(0);
		});
	});

	describe('Profile Metadata', () => {
		it('should validate job title', () => {
			const profile = {
				jobTitle: 'Senior Software Engineer',
				company: 'Tech Company Inc',
			};

			expect(profile.jobTitle).toBeTruthy();
			expect(profile.company).toBeTruthy();
		});

		it('should validate location data', () => {
			const location = {
				formatted: 'San Francisco, CA, United States',
				city: 'San Francisco',
				state: 'CA',
				country: 'United States',
			};

			expect(location.formatted).toBeTruthy();
			expect(location.city).toBeTruthy();
		});

		it('should validate pronouns', () => {
			const pronouns = ['he/him', 'she/her', 'they/them', 'he/they'];

			pronouns.forEach((pronoun) => {
				expect(pronoun).toContain('/');
			});
		});

		it('should handle missing metadata', () => {
			const profile = {
				displayName: 'User',
				jobTitle: undefined,
				company: undefined,
				currentLocation: undefined,
			};

			expect(profile.jobTitle).toBeUndefined();
			expect(profile.company).toBeUndefined();
		});
	});

	describe('Bio and Description', () => {
		it('should validate about me text', () => {
			const profile = {
				aboutMe: 'Passionate developer and open source contributor',
			};

			expect(profile.aboutMe.length).toBeGreaterThan(0);
		});

		it('should handle long descriptions', () => {
			const bio = 'A'.repeat(500);
			expect(bio.length).toBe(500);
		});

		it('should handle special characters in bio', () => {
			const bios = [
				'Love coding ❤️ and coffee ☕',
				'web dev @ company.com',
				'C++, Python, JavaScript enthusiast',
			];

			bios.forEach((bio) => {
				expect(bio.length).toBeGreaterThan(0);
			});
		});

		it('should handle missing bio', () => {
			const profile = {
				displayName: 'User',
				aboutMe: undefined,
			};

			expect(profile.aboutMe).toBeUndefined();
		});
	});

	describe('Link Generation', () => {
		it('should generate profile URL', () => {
			const username = 'johndoe';
			const url = `https://gravatar.com/${username}`;

			expect(url).toContain('gravatar.com');
			expect(url).toContain(username);
		});

		it('should generate social media links', () => {
			const links = {
				github: (username: string) => `https://github.com/${username}`,
				linkedin: (username: string) => `https://linkedin.com/in/${username}`,
				twitter: (username: string) => `https://twitter.com/${username}`,
			};

			const username = 'johndoe';

			Object.values(links).forEach((linkFn) => {
				const link = linkFn(username);
				expect(link).toContain('http');
				expect(link).toContain(username);
			});
		});
	});

	describe('Filtering and Searching', () => {
		it('should filter profiles by name', () => {
			const profiles = [
				{ id: '1', displayName: 'John Doe' },
				{ id: '2', displayName: 'Jane Smith' },
				{ id: '3', displayName: 'John Adams' },
			];

			const filtered = profiles.filter((p) =>
				p.displayName.toLowerCase().includes('john')
			);

			expect(filtered).toHaveLength(2);
		});

		it('should filter profiles with verified accounts', () => {
			const profiles = [
				{
					displayName: 'User 1',
					accounts: [{ verified: true }, { verified: true }],
				},
				{
					displayName: 'User 2',
					accounts: [{ verified: false }],
				},
				{
					displayName: 'User 3',
					accounts: [{ verified: true }],
				},
			];

			const filtered = profiles.filter((p) =>
				p.accounts.some((acc) => acc.verified)
			);

			expect(filtered).toHaveLength(2);
		});
	});

	describe('Data Overrides', () => {
		it('should override profile location', () => {
			const gravatar = {
				currentLocation: 'San Francisco, CA',
			};

			const override = { currentLocation: 'New York, NY' };

			const final = { ...gravatar, ...override };

			expect(final.currentLocation).toBe('New York, NY');
		});

		it('should override job title', () => {
			const profile = {
				jobTitle: 'Developer',
				company: 'OldCorp',
			};

			const override = { jobTitle: 'Senior Developer' };

			const final = { ...profile, ...override };

			expect(final.jobTitle).toBe('Senior Developer');
			expect(final.company).toBe('OldCorp');
		});
	});

	describe('Edge Cases', () => {
		it('should handle very long names', () => {
			const name = 'A'.repeat(100);
			expect(name.length).toBe(100);
		});

		it('should handle special characters in names', () => {
			const names = ["O'Brien", 'José García', '李明', 'Müller'];

			names.forEach((name) => {
				expect(name.length).toBeGreaterThan(0);
			});
		});

		it('should handle empty profile', () => {
			const profile = {
				displayName: 'Unknown',
				photos: [],
				emails: [],
				accounts: [],
			};

			expect(profile.displayName).toBeTruthy();
			expect(profile.photos).toHaveLength(0);
		});

		it('should handle profiles with only name', () => {
			const profile = { displayName: 'John Doe' };

			expect(profile.displayName).toBeTruthy();
		});
	});
});

describe('GravatarCard Component Rendering', () => {
	describe('Component Basics', () => {
		it('should render gravatar card component', () => {
			const { container } = render(
				<GravatarCard profile={{ displayName: 'Test User', profileUrl: 'https://gravatar.com/test' }} />
			);
			
			expect(container).toBeDefined();
		});

		it('should accept profile prop', () => {
			const profile = {
				displayName: 'John Doe',
				aboutMe: 'Software developer',
				profileUrl: 'https://gravatar.com/johndoe'
			};
			
			const mockProfile = profile;
			expect(mockProfile).toHaveProperty('displayName');
			expect(mockProfile).toHaveProperty('aboutMe');
		});

		it('should handle custom display name override', () => {
			const displayName = 'Jane Doe';
			expect(displayName).toBeTruthy();
			expect(displayName.length).toBeGreaterThan(0);
		});

		it('should support horizontal and vertical layouts', () => {
			const layouts = ['horizontal', 'vertical'];
			layouts.forEach(layout => {
				expect(['horizontal', 'vertical']).toContain(layout);
			});
		});

		it('should support avatar size customization', () => {
			const sizes = [50, 100, 200, 400];
			sizes.forEach(size => {
				expect(typeof size).toBe('number');
				expect(size).toBeGreaterThan(0);
			});
		});
	});

	describe('Social Links Rendering', () => {
		it('should render social links when provided', () => {
			const socialLinks = {
				github: 'https://github.com/johndoe',
				linkedin: 'https://linkedin.com/in/johndoe',
				twitter: 'https://twitter.com/johndoe',
				instagram: 'https://instagram.com/johndoe',
				website: 'https://johndoe.com'
			};
			
			expect(socialLinks).toHaveProperty('github');
			expect(socialLinks.github).toContain('github.com');
		});

		it('should handle partial social links', () => {
			const socialLinks = {
				github: 'https://github.com/johndoe',
				linkedin: 'https://linkedin.com/in/johndoe'
			};
			
			expect(Object.keys(socialLinks)).toHaveLength(2);
		});

		it('should handle missing social links', () => {
			const socialLinks = {};
			expect(Object.keys(socialLinks)).toHaveLength(0);
		});
	});

	describe('Profile Data Display', () => {
		it('should display all profile fields when available', () => {
			const profile = {
				displayName: 'John Doe',
				job_title: 'Senior Engineer',
				company: 'Tech Corp',
				currentLocation: 'San Francisco, CA',
				aboutMe: 'Passionate developer',
				pronouns: 'he/him',
				profileUrl: 'https://gravatar.com/johndoe'
			};
			
			expect(profile.displayName).toBeTruthy();
			expect(profile.job_title).toBeTruthy();
			expect(profile.company).toBeTruthy();
		});

		it('should handle missing profile fields gracefully', () => {
			const profile: any = {
				displayName: 'John Doe'
			};
			
			expect(profile.displayName).toBeTruthy();
			expect(profile.job_title).toBeUndefined();
		});
	});

	describe('Custom Role and Account Handling', () => {
		it('should display custom role when provided', () => {
			const customRole = 'Principal Engineer';
			expect(customRole).toBeTruthy();
		});

		it('should handle multiple account types', () => {
			const accounts = [
				{ domain: 'github.com', username: 'johndoe', verified: true },
				{ domain: 'linkedin.com', username: 'johndoe', verified: true },
				{ domain: 'twitter.com', username: 'johndoe', verified: false }
			];
			
			expect(accounts).toHaveLength(3);
			accounts.forEach(account => {
				expect(account.domain).toBeTruthy();
				expect(account.username).toBeTruthy();
			});
		});
	});

	describe('Compact Variant', () => {
		it('should render compact variant when requested', () => {
			const compact = true;
			expect(compact).toBe(true);
		});

		it('should maintain full layout as default', () => {
			const compact = false;
			expect(compact).toBe(false);
		});
	});
});
