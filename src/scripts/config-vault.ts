#!/usr/bin/env npx tsx
import fs from 'fs';
import path from 'path';
import { encrypt, decrypt, isEncrypted } from '../components/config/crypto';

/**
 * CLI Tool for encrypting/decrypting pixelated.config.json
 * Usage: 
 *   npx tsx src/scripts/config-vault.js encrypt <filePath> <key>
 *   npx tsx src/scripts/config-vault.js decrypt <filePath> <key>
 *
 * Behavior changes:
 *  - `encrypt` writes to `<file>.enc` (does not overwrite the plain file)
 *  - `decrypt` writes atomically to the plain filename (when given a `.enc` file it writes to the base name)
 */

const [,, command, targetPath, argKey] = process.argv;
let key = argKey || process.env.PIXELATED_CONFIG_KEY;

// If key is still missing, try to load it from .env.local
if (!key) {
	const envPath = path.join(process.cwd(), '.env.local');
	if (fs.existsSync(envPath)) {
		const envContent = fs.readFileSync(envPath, 'utf8');
		const match = envContent.match(/^PIXELATED_CONFIG_KEY=(.*)$/m);
		if (match && match[1]) {
			key = match[1].trim();
		}
	}
}

if (!command || !targetPath || !key) {
	console.log('Usage:');
	console.log('  encrypt <filePath> [key] - Encrypts the file and writes `<filePath>.enc`');
	console.log('  decrypt <filePath> [key] - Decrypts the file and writes the plaintext file (atomic write)');
	console.log('\nNote: Key can be passed as argument or via PIXELATED_CONFIG_KEY env var.');
	process.exit(1);
}

const fullPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(process.cwd(), targetPath);

if (!fs.existsSync(fullPath)) {
	console.error(`File not found: ${fullPath}`);
	process.exit(1);
}

const atomicWrite = (destPath: string, data: string) => {
	const dir = path.dirname(destPath);
	const base = path.basename(destPath);
	const tmp = path.join(dir, `.${base}.tmp`);
	fs.writeFileSync(tmp, data, 'utf8');
	fs.renameSync(tmp, destPath);
};

try {
	if (command === 'encrypt') {
		const content = fs.readFileSync(fullPath, 'utf8');
		if (isEncrypted(content)) {
			console.log('File is already encrypted. No action taken.');
			process.exit(0);
		}
		const encrypted = encrypt(content, key);
		const encPath = fullPath.endsWith('.enc') ? fullPath : `${fullPath}.enc`;
		atomicWrite(encPath, encrypted);
		console.log(`Successfully encrypted ${targetPath} -> ${path.basename(encPath)}`);
	} else if (command === 'decrypt') {
		const content = fs.readFileSync(fullPath, 'utf8');
		if (!isEncrypted(content)) {
			console.log('File is not encrypted. No action taken.');
			process.exit(0);
		}
		const decrypted = decrypt(content, key);
		// Destination: if input ends with .enc, strip it; otherwise overwrite the provided path
		const destPath = fullPath.endsWith('.enc') ? fullPath.slice(0, -4) : fullPath;
		atomicWrite(destPath, decrypted);
		console.log(`Successfully decrypted ${path.basename(fullPath)} -> ${path.basename(destPath)}`);
	} else {
		console.error(`Unknown command: ${command}`);
		process.exit(1);
	}
} catch (err: any) {
	console.error(`Operation failed: ${err.message}`);
	process.exit(1);
}
