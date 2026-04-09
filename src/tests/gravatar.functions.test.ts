import { describe, it, expect, vi } from 'vitest';
import { getGravatarAvatarUrl, getGravatarProfile, getGravatarAccountUrl, type GravatarProfile } from '../components/integrations/gravatar.functions';
import { buildUrl } from '../components/general/urlbuilder';

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

	describe('buildUrl URL Construction for Gravatar APIs', () => {
		describe('Avatar URL building', () => {
			it('should construct gravatar avatar URL with buildUrl (Section 1)', () => {
				const email = 'test@example.com';
				const hash = '8f0cbb7375d6bba2e9a3e9b5c5c5c5c5'; // MD5 of lowercased email

				const avatarUrl = buildUrl({
					baseUrl: 'https://gravatar.com/avatar/' + hash,
					params: {
						s: 200,
						d: 'mp'
					}
				});

				expect(avatarUrl).toContain('gravatar.com/avatar');
				expect(avatarUrl).toContain(hash);
				expect(avatarUrl).toContain('s=200');
				expect(avatarUrl).toContain('d=mp');
			});

			it('should handle different avatar sizes with buildUrl (Section 2)', () => {
				const hash = 'abc123';
				
				const size200 = buildUrl({
					baseUrl: 'https://gravatar.com/avatar/' + hash,
					params: { s: 200, d: 'mp' }
				});
				
				const size400 = buildUrl({
					baseUrl: 'https://gravatar.com/avatar/' + hash,
					params: { s: 400, d: 'mp' }
				});

				expect(size200).toContain('s=200');
				expect(size400).toContain('s=400');
			});
		});

		describe('Profile URL building', () => {
			it('should construct gravatar profile URL with buildUrl (Section 3)', () => {
				const hash = 'abc123';

				const profileUrl = buildUrl({
					baseUrl: 'https://gravatar.com/' + hash,
					params: {
						format: 'json'
					}
				});

				expect(profileUrl).toContain('gravatar.com');
				expect(profileUrl).toContain(hash);
				expect(profileUrl).toContain('format=json');
			});

			it('should construct JSON profile URL correctly (Section 4)', () => {
				const hash = 'test-hash-123';

				const jsonUrl = buildUrl({
					baseUrl: 'https://gravatar.com/' + hash,
					params: {
						format: 'json'
					}
				});

				expect(jsonUrl).toContain('gravatar.com/' + hash);
				expect(jsonUrl).toContain('format=json');
			});

			it('should handle gravatar profile with different parameters', () => {
				const hash = 'user-hash';
				
				const url1 = buildUrl({
					baseUrl: 'https://gravatar.com/' + hash,
					params: { format: 'json', callback: 'myCallback' }
				});
				
				const url2 = buildUrl({
					baseUrl: 'https://gravatar.com/' + hash,
					params: { format: 'xml' }
				});

				expect(url1).toContain('format=json');
				expect(url1).toContain('callback=myCallback');
				expect(url2).toContain('format=xml');
			});
		});
	});
});
