import { describe, it, expect, vi } from 'vitest';
import { getGravatarAvatarUrl, getGravatarProfile, getGravatarAccountUrl, type GravatarProfile } from '../components/integrations/gravatar.functions';

describe('Gravatar Functions', () => {
	describe('getGravatarAvatarUrl', () => {
		it('should generate valid Gravatar avatar URL with default params', () => {
			const url = getGravatarAvatarUrl('test@example.com');
			expect(url).toContain('gravatar.com/avatar/');
			expect(url).toContain('s=200');
			expect(url).toContain('d=mp');
		});

		it('should properly hash and encode email', () => {
			const url1 = getGravatarAvatarUrl('test@example.com');
			const url2 = getGravatarAvatarUrl('TEST@EXAMPLE.COM');
			expect(url1).toBe(url2);
		});

		it('should handle custom size parameter', () => {
			const url = getGravatarAvatarUrl('test@example.com', 400);
			expect(url).toContain('s=400');
		});

		it('should handle custom default image type', () => {
			const url = getGravatarAvatarUrl('test@example.com', 200, 'identicon');
			expect(url).toContain('d=identicon');
		});

		it('should handle all default image types', () => {
			const types = ['404', 'mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'] as const;
			types.forEach(type => {
				const url = getGravatarAvatarUrl('test@example.com', 200, type);
				expect(url).toContain(`d=${type}`);
			});
		});

		it('should trim whitespace from email', () => {
			const url1 = getGravatarAvatarUrl('test@example.com');
			const url2 = getGravatarAvatarUrl('  test@example.com  ');
			expect(url1).toBe(url2);
		});

		it('should handle various email formats', () => {
			const emails = ['test@example.com', 'user.name@domain.co.uk', 'first+tag@mail.com'];
			emails.forEach(email => {
				const url = getGravatarAvatarUrl(email);
				expect(url).toContain('gravatar.com/avatar/');
			});
		});
	});

	describe('getGravatarProfile', () => {
		it('should fetch profile data from Gravatar API', async () => {
			const mockProfile: any = {
				entry: [{
					hash: 'abc123',
					displayName: 'John Doe',
					profileUrl: 'https://gravatar.com/johndoe'
				}]
			};

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockProfile)
				} as Response)
			);

			const profile = await getGravatarProfile('test@example.com');
			expect(profile).toBeDefined();
			expect(profile?.displayName).toBe('John Doe');
		});

		it('should return null on non-200 response', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: false
				} as Response)
			);

			const profile = await getGravatarProfile('nonexistent@example.com');
			expect(profile).toBeNull();
		});

		it('should return null on empty entry', async () => {
			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ entry: [] })
				} as Response)
			);

			const profile = await getGravatarProfile('test@example.com');
			expect(profile).toBeNull();
		});

		it('should return null on fetch error', async () => {
			global.fetch = vi.fn(() =>
				Promise.reject(new Error('Network error'))
			);

			const profile = await getGravatarProfile('test@example.com');
			expect(profile).toBeNull();
		});

		it('should return first entry from response', async () => {
			const mockProfile: any = {
				entry: [
					{ displayName: 'First User' },
					{ displayName: 'Second User' }
				]
			};

			global.fetch = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockProfile)
				} as Response)
			);

			const profile = await getGravatarProfile('test@example.com');
			expect(profile?.displayName).toBe('First User');
		});
	});

	describe('getGravatarAccountUrl', () => {
		const mockProfile: GravatarProfile = {
			hash: 'abc123',
			requestHash: 'req123',
			profileUrl: 'https://gravatar.com/test',
			preferredUsername: 'testuser',
			thumbnailUrl: 'https://gravatar.com/avatar/abc123',
			displayName: 'Test User',
			accounts: [
				{
					domain: 'github.com',
					display: 'GitHub',
					url: 'https://github.com/testuser',
					username: 'testuser',
					verified: true,
					name: 'Test User',
					shortname: 'github'
				},
				{
					domain: 'linkedin.com',
					display: 'LinkedIn',
					url: 'https://linkedin.com/in/testuser',
					username: 'testuser',
					verified: true,
					name: 'Test User',
					shortname: 'linkedin'
				}
			]
		};

		it('should find and return account URL by shortname', () => {
			const url = getGravatarAccountUrl(mockProfile, 'github');
			expect(url).toBe('https://github.com/testuser');
		});

		it('should return undefined for non-existent shortname', () => {
			const url = getGravatarAccountUrl(mockProfile, 'twitter');
			expect(url).toBeUndefined();
		});

		it('should handle profile with no accounts', () => {
			const profile = { ...mockProfile, accounts: undefined };
			const url = getGravatarAccountUrl(profile, 'github');
			expect(url).toBeUndefined();
		});

		it('should handle empty accounts array', () => {
			const profile = { ...mockProfile, accounts: [] };
			const url = getGravatarAccountUrl(profile, 'github');
			expect(url).toBeUndefined();
		});

		it('should find multiple different accounts', () => {
			const githubUrl = getGravatarAccountUrl(mockProfile, 'github');
			const linkedinUrl = getGravatarAccountUrl(mockProfile, 'linkedin');
			
			expect(githubUrl).toBe('https://github.com/testuser');
			expect(linkedinUrl).toBe('https://linkedin.com/in/testuser');
		});
	});
});
