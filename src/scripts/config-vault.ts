#!/usr/bin/env npx tsx
import fs from 'fs';
import path from 'path';
import { encrypt, decrypt, isEncrypted } from '../components/config/crypto';

/**
 * CLI Tool for encrypting/decrypting pixelated.config.json
 * Usage: 
 *   npx tsx src/scripts/config-vault.js encrypt <filePath> <key>
 *   npx tsx src/scripts/config-vault.js decrypt <filePath> <key>
 */

const [,, command, targetPath, key] = process.argv;

if (!command || !targetPath || !key) {
	console.log('Usage:');
	console.log('  encrypt <filePath> <key> - Encrypts the file in place');
	console.log('  decrypt <filePath> <key> - Decrypts the file in place');
	process.exit(1);
}

const fullPath = path.isAbsolute(targetPath) ? targetPath : path.resolve(process.cwd(), targetPath);

if (!fs.existsSync(fullPath)) {
	console.error(`File not found: ${fullPath}`);
	process.exit(1);
}

const content = fs.readFileSync(fullPath, 'utf8');

try {
	if (command === 'encrypt') {
		if (isEncrypted(content)) {
			console.log('File is already encrypted.');
			process.exit(0);
		}
		const encrypted = encrypt(content, key);
		fs.writeFileSync(fullPath, encrypted, 'utf8');
		console.log(`Successfully encrypted ${targetPath}`);
	} else if (command === 'decrypt') {
		if (!isEncrypted(content)) {
			console.log('File is not encrypted.');
			process.exit(0);
		}
		const decrypted = decrypt(content, key);
		fs.writeFileSync(fullPath, decrypted, 'utf8');
		console.log(`Successfully decrypted ${targetPath}`);
	} else {
		console.error(`Unknown command: ${command}`);
		process.exit(1);
	}
} catch (err: any) {
	console.error(`Operation failed: ${err.message}`);
	process.exit(1);
}
