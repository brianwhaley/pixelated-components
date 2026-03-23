import { describe, it, expect } from 'vitest';
import { encrypt, decrypt, isEncrypted } from '../components/config/crypto';

describe('Crypto Functions', () => {
	// Valid 32-byte hex key (64 hex characters)
	const validEncryptionKey = 'a'.repeat(64);
	const shortKey = 'short';
	const longKey = 'a'.repeat(128);

	describe('encrypt', () => {
		it('should encrypt plain text successfully', () => {
			const plaintext = 'Hello, World!';
			const encrypted = encrypt(plaintext, validEncryptionKey);

			expect(encrypted).toBeDefined();
			expect(typeof encrypted).toBe('string');
			expect(encrypted.length).toBeGreaterThan(0);
		});

		it('should produce different ciphertexts for same plaintext', () => {
			const plaintext = 'Test Message';
			const encrypted1 = encrypt(plaintext, validEncryptionKey);
			const encrypted2 = encrypt(plaintext, validEncryptionKey);

			expect(encrypted1).not.toBe(encrypted2);
		});

		it('should handle empty string encryption', () => {
			const encrypted = encrypt('', validEncryptionKey);
			expect(encrypted).toBeDefined();
			expect(typeof encrypted).toBe('string');
		});

		it('should handle long text encryption', () => {
			const longText = 'A'.repeat(10000);
			const encrypted = encrypt(longText, validEncryptionKey);

			expect(encrypted).toBeDefined();
			expect(encrypted.length).toBeGreaterThan(0);
		});

		it('should handle special characters', () => {
			const special = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
			const encrypted = encrypt(special, validEncryptionKey);

			expect(encrypted).toBeDefined();
		});

		it('should handle unicode characters', () => {
			const unicode = '你好世界🌍こんにちは';
			const encrypted = encrypt(unicode, validEncryptionKey);

			expect(encrypted).toBeDefined();
		});

		it('should handle newlines and whitespace', () => {
			const text = 'Line 1\nLine 2\n\nLine 3\t\tTabbed';
			const encrypted = encrypt(text, validEncryptionKey);

			expect(encrypted).toBeDefined();
		});

		it('should require valid key length', () => {
			expect(() => encrypt('text', shortKey)).toThrow();
		});

		it('should handle different key sizes within valid range', () => {
			// AES-256 requires 32-byte (64 hex character) keys
			const key1 = 'b'.repeat(64);
			const key2 = 'c'.repeat(64);

			const encrypted1 = encrypt('test', key1);
			const encrypted2 = encrypt('test', key2);

			expect(encrypted1).toBeDefined();
			expect(encrypted2).toBeDefined();
		});

		it('should throw on null plaintext', () => {
			expect(() => encrypt(null as any, validEncryptionKey)).toThrow();
		});

		it('should throw on null key', () => {
			expect(() => encrypt('text', null as any)).toThrow();
		});

		it('should throw on undefined plaintext', () => {
			expect(() => encrypt(undefined as any, validEncryptionKey)).toThrow();
		});

		it('should throw on undefined key', () => {
			expect(() => encrypt('text', undefined as any)).toThrow();
		});
	});

	describe('decrypt', () => {
		it('should decrypt encrypted text successfully', () => {
			const plaintext = 'Hello, World!';
			const encrypted = encrypt(plaintext, validEncryptionKey);
			const decrypted = decrypt(encrypted, validEncryptionKey);

			expect(decrypted).toBe(plaintext);
		});

		it('should decrypt empty string', () => {
			const plaintext = '';
			const encrypted = encrypt(plaintext, validEncryptionKey);
			const decrypted = decrypt(encrypted, validEncryptionKey);

			expect(decrypted).toBe(plaintext);
		});

		it('should decrypt long text', () => {
			const plaintext = 'A'.repeat(10000);
			const encrypted = encrypt(plaintext, validEncryptionKey);
			const decrypted = decrypt(encrypted, validEncryptionKey);

			expect(decrypted).toBe(plaintext);
		});

		it('should decrypt special characters', () => {
			const special = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
			const encrypted = encrypt(special, validEncryptionKey);
			const decrypted = decrypt(encrypted, validEncryptionKey);

			expect(decrypted).toBe(special);
		});

		it('should decrypt unicode characters', () => {
			const unicode = '你好世界🌍こんにちは';
			const encrypted = encrypt(unicode, validEncryptionKey);
			const decrypted = decrypt(encrypted, validEncryptionKey);

			expect(decrypted).toBe(unicode);
		});

		it('should decrypt whitespace and newlines', () => {
			const text = 'Line 1\nLine 2\n\nLine 3\t\tTabbed';
			const encrypted = encrypt(text, validEncryptionKey);
			const decrypted = decrypt(encrypted, validEncryptionKey);

			expect(decrypted).toBe(text);
		});

		it('should fail with wrong key', () => {
			const plaintext = 'Secret';
			const key1 = 'd'.repeat(64);
			const key2 = 'e'.repeat(64);

			const encrypted = encrypt(plaintext, key1);
			expect(() => decrypt(encrypted, key2)).toThrow();
		});

		it('should fail with corrupted ciphertext', () => {
			const plaintext = 'Message';
			const encrypted = encrypt(plaintext, validEncryptionKey);
			const corrupted = encrypted.slice(0, -4) + 'XXXX';

			expect(() => decrypt(corrupted, validEncryptionKey)).toThrow();
		});

		it('should handle tampered authentication tag', () => {
			const plaintext = 'Message';
			const encrypted = encrypt(plaintext, validEncryptionKey);
			const lastChar = encrypted[encrypted.length - 1];
			const tampered = encrypted.slice(0, -1) + (lastChar === 'a' ? 'b' : 'a');

			expect(() => decrypt(tampered, validEncryptionKey)).toThrow();
		});

		it('should throw on null ciphertext', () => {
			expect(() => decrypt(null as any, validEncryptionKey)).toThrow();
		});

		it('should throw on null key', () => {
			const plaintext = 'test';
			const encrypted = encrypt(plaintext, validEncryptionKey);
			expect(() => decrypt(encrypted, null as any)).toThrow();
		});

		it('should throw on undefined ciphertext', () => {
			expect(() => decrypt(undefined as any, validEncryptionKey)).toThrow();
		});

		it('should throw on undefined key', () => {
			const plaintext = 'test';
			const encrypted = encrypt(plaintext, validEncryptionKey);
			expect(() => decrypt(encrypted, undefined as any)).toThrow();
		});

		it('should throw on empty ciphertext', () => {
			expect(() => decrypt('', validEncryptionKey)).toThrow();
		});

		it('should throw on invalid format ciphertext', () => {
			expect(() => decrypt('invalid-base64!@#$', validEncryptionKey)).toThrow();
		});

		it('should throw on too short ciphertext', () => {
			expect(() => decrypt('short', validEncryptionKey)).toThrow();
		});
	});

	describe('isEncrypted', () => {
		it('should return true for encrypted text', () => {
			const plaintext = 'Secret Message';
			const encrypted = encrypt(plaintext, validEncryptionKey);
			expect(isEncrypted(encrypted)).toBe(true);
		});

		it('should return false for plain text', () => {
			expect(isEncrypted('Hello, World')).toBe(false);
		});

		it('should return false for empty string', () => {
			expect(isEncrypted('')).toBe(false);
		});

		it('should return false for special characters', () => {
			expect(isEncrypted('!@#$%^&*()')).toBe(false);
		});

		it('should return false for random base64', () => {
			expect(isEncrypted('aGVsbG8gd29ybGQ=')).toBe(false);
		});

		it('should return false for null', () => {
			expect(isEncrypted(null as any)).toBe(false);
		});

		it('should return false for undefined', () => {
			expect(isEncrypted(undefined as any)).toBe(false);
		});

		it('should return false for numbers', () => {
			expect(isEncrypted(12345 as any)).toBe(false);
		});

		it('should return false for objects', () => {
			expect(isEncrypted({} as any)).toBe(false);
		});

		it('should return true for multiple different encrypted texts', () => {
			const text1 = encrypt('Text 1', validEncryptionKey);
			const text2 = encrypt('Text 2', validEncryptionKey);

			expect(isEncrypted(text1)).toBe(true);
			expect(isEncrypted(text2)).toBe(true);
		});

		it('should distinguish encrypted from partial patterns', () => {
			const encrypted = encrypt('Message', validEncryptionKey);
			const partial = encrypted.slice(0, Math.floor(encrypted.length / 2));

			expect(isEncrypted(encrypted)).toBe(true);
			expect(isEncrypted(partial)).toBe(false);
		});
	});

	describe('Round-trip encryption', () => {
		it('should encrypt and decrypt identical pairs', () => {
			const testCases = [
				'Simple text',
				'Text with numbers 12345',
				'Special!@#$%^&*()',
				'🔐 Unicode 中文 العربية',
				'Multi\nLine\nText',
				'Very long text ' + 'a'.repeat(1000),
				'Tabs\t\there'
			];

			testCases.forEach((plaintext) => {
				const encrypted = encrypt(plaintext, validEncryptionKey);
				const decrypted = decrypt(encrypted, validEncryptionKey);
				expect(decrypted).toBe(plaintext);
			});
		});

		it('should maintain state across multiple operations', () => {
			const messages = ['msg1', 'msg2', 'msg3'];
			const encrypted = messages.map((msg) => encrypt(msg, validEncryptionKey));

			encrypted.forEach((enc, i) => {
				const decrypted = decrypt(enc, validEncryptionKey);
				expect(decrypted).toBe(messages[i]);
			});
		});
	});
});
