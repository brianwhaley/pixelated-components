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

// Helper: obtain key from arg or env or .env.local (only used for encrypt/decrypt)
let key = argKey || process.env.PIXELATED_CONFIG_KEY;
if (!key) {
	const envPath = path.join(process.cwd(), '.env.local');
	if (fs.existsSync(envPath)) {
		try {
			const envContent = fs.readFileSync(envPath, 'utf8');
			const match = envContent.match(/^PIXELATED_CONFIG_KEY=(.*)$/m);
			if (match && match[1]) key = match[1].trim();
		} catch (e) {
			// ignore
		}
	}
}

const atomicWrite = (destPath: string, data: string) => {
	const dir = path.dirname(destPath);
	const base = path.basename(destPath);
	const tmp = path.join(dir, `.${base}.tmp`);
	fs.writeFileSync(tmp, data, 'utf8');
	fs.renameSync(tmp, destPath);
};

// Helper: print usage/help
function printUsage(): void {
	console.log('Usage:');
	console.log('  npx tsx src/scripts/config-vault.ts encrypt <filePath> [key]   - Encrypts <filePath> (writes <filePath>.enc)');
	console.log('  npx tsx src/scripts/config-vault.ts decrypt <filePath> [key]   - Decrypts <filePath>.enc and writes plaintext');
	console.log('  npx tsx src/scripts/config-vault.ts postbuild                  - CI helper: decrypts and injects into .next/server');
	console.log('\nNotes:');
	console.log('  - Key can be passed as argument or via PIXELATED_CONFIG_KEY env var.');
	console.log('  - Use PIXELATED_CONFIG_DEBUG=1 for verbose output during postbuild.');
}

// Helpful messages when arguments are missing
if (!command) {
	console.log('No command provided.');
	printUsage();
	process.exit(0);
}
if (command === 'help' || command === '--help' || command === '-h') {
	printUsage();
	process.exit(0);
}

// If encrypt/decrypt are requested, ensure targetPath and key exist; log informative messages
if (command === 'encrypt' || command === 'decrypt') {
	if (!targetPath) {
		console.log('No target path provided for encrypt/decrypt.');
		printUsage();
		process.exit(1);
	}
	if (!key) {
		// we attempted to resolve key from env/.env.local earlier; if still missing, inform the user
		console.log('No key provided for encrypt/decrypt (argument, PIXELATED_CONFIG_KEY, or .env.local).');
		printUsage();
		process.exit(1);
	}
}

/**
 * Post-build behavior used by CI (Amplify):
 * - Look for an encrypted config file in standard candidate locations
 * - Validate PIXELATED_CONFIG_KEY (from env or .env.local)
 * - Decrypt in-place and copy plaintext to .next/server/pixelated.config.json
 * - Validate JSON and emit a concise success message
 */
function decryptPostBuild(): void {
	const DEBUG = process.env.PIXELATED_CONFIG_DEBUG === '1';
	const candidates = [
		path.join(process.cwd(), 'src/app/config/pixelated.config.json.enc'),
		path.join(process.cwd(), 'src/config/pixelated.config.json.enc'),
		path.join(process.cwd(), 'src/pixelated.config.json.enc'),
	];

	let foundEnc: string | null = null;
	for (const p of candidates) {
		if (fs.existsSync(p)) {
			foundEnc = p;
			break;
		}
	}

	if (!foundEnc) {
		if (DEBUG) console.log('No encrypted config found; nothing to do.');
		process.exit(0);
	}

	// Resolve key (env preferred, then .env.local)
	let keyLocal = process.env.PIXELATED_CONFIG_KEY;
	if (!keyLocal) {
		const envPath = path.join(process.cwd(), '.env.local');
		if (fs.existsSync(envPath)) {
			try {
				const envContent = fs.readFileSync(envPath, 'utf8');
				const match = envContent.match(/^PIXELATED_CONFIG_KEY=(.*)$/m);
				if (match && match[1]) keyLocal = match[1].trim();
			} catch (e) {
				// ignore
			}
		}
	}

	if (!keyLocal) {
		console.error('PIXELATED_CONFIG_KEY not set; cannot decrypt config.');
		process.exit(1);
	}
	if (!/^[0-9a-fA-F]{64}$/.test(keyLocal)) {
		console.error('PIXELATED_CONFIG_KEY invalid: must be 64 hex characters.');
		process.exit(1);
	}

	try {
		const raw = fs.readFileSync(foundEnc, 'utf8');
		if (!isEncrypted(raw)) {
			console.error('Found file is not in encrypted format.');
			process.exit(1);
		}
		const decrypted = decrypt(raw, keyLocal);
		const dest = foundEnc.endsWith('.enc') ? foundEnc.slice(0, -4) : `${foundEnc}.plain`;
		atomicWrite(dest, decrypted);
		// Copy to .next/server for SSR to pick up
		const injectPath = path.join(process.cwd(), '.next', 'server', 'pixelated.config.json');
		fs.mkdirSync(path.dirname(injectPath), { recursive: true });
		fs.copyFileSync(dest, injectPath);
		// Validate JSON
		JSON.parse(decrypted);
		console.log('Config injected into .next/server/pixelated.config.json');
		if (DEBUG) console.log(`Decrypted ${path.basename(foundEnc)} -> ${injectPath}`);
		process.exit(0);
	} catch (err: any) {
		console.error(`Post-build decrypt failed: ${err.message}`);
		process.exit(1);
	}
}

try {
	if (command === 'encrypt') {
		if (!key) {
			console.error('Encryption key is required.');
			process.exit(1);
		}
		const content = fs.readFileSync(targetPath, 'utf8');
		if (isEncrypted(content)) {
			console.log('File is already encrypted. No action taken.');
			process.exit(0);
		}
		const encrypted = encrypt(content, key);
		const encPath = targetPath.endsWith('.enc') ? targetPath : `${targetPath}.enc`;
		atomicWrite(encPath, encrypted);
		console.log(`Successfully encrypted ${targetPath} -> ${path.basename(encPath)}`);
	} else if (command === 'decrypt') {
		if (!key) {
			console.error('Decryption key is required.');
			process.exit(1);
		}
		const content = fs.readFileSync(targetPath, 'utf8');
		if (!isEncrypted(content)) {
			console.log('File is not encrypted. No action taken.');
			process.exit(0);
		}
		const decrypted = decrypt(content, key);
		const destPath = targetPath.endsWith('.enc') ? targetPath.slice(0, -4) : targetPath;
		atomicWrite(destPath, decrypted);
		console.log(`Successfully decrypted ${path.basename(targetPath)} -> ${path.basename(destPath)}`);
	} else if (command === 'postbuild' || command === 'post-build' || command === 'inject') {
		decryptPostBuild();
	} else {
		console.error(`Unknown command: ${command}`);
		process.exit(1);
	}
} catch (err: any) {
	console.error(`Operation failed: ${err.message}`);
	process.exit(1);
}
