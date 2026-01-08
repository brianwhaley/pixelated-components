import crypto from 'crypto';

/**
 * AES-256-GCM encryption/decryption utility.
 * Requires a 32-byte key (64 hex characters).
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM recommended IV length
const AUTH_TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = 'pxl:v1:';

/**
 * Encrypts a string using a hex-encoded 32-byte key.
 * Returns a prefixed string: pxl:v1:iv:authTag:encryptedContent (all hex).
 */
export function encrypt(text: string, keyHex: string): string {
	if (!keyHex) throw new Error('Encryption key is required.');
	const key = Buffer.from(keyHex, 'hex');
	if (key.length !== 32) {
		throw new Error('Encryption key must be 32 bytes (64 hex characters).');
	}

	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag().toString('hex');

	return `${ENCRYPTED_PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string using a hex-encoded 32-byte key.
 * Expects format: pxl:v1:iv:authTag:encryptedContent
 */
export function decrypt(payload: string, keyHex: string): string {
	if (!keyHex) throw new Error('Decryption key is required.');
	if (!payload.startsWith(ENCRYPTED_PREFIX)) {
		throw new Error('Payload is not in a recognized encrypted format.');
	}

	const data = payload.slice(ENCRYPTED_PREFIX.length);
	const key = Buffer.from(keyHex, 'hex');
	if (key.length !== 32) {
		throw new Error('Decryption key must be 32 bytes (64 hex characters).');
	}

	const parts = data.split(':');
	if (parts.length !== 3) {
		throw new Error('Invalid encrypted data format. Expected iv:authTag:encryptedContent');
	}

	const [ivHex, authTagHex, encryptedHex] = parts;
	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');
	const encryptedText = Buffer.from(encryptedHex, 'hex');

	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(encryptedText as any, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}

/**
 * Checks if a string is encrypted using our format.
 */
export function isEncrypted(text: string): boolean {
	return typeof text === 'string' && text.startsWith(ENCRYPTED_PREFIX);
}
