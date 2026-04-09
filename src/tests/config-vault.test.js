import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { describe, it, expect } from 'vitest';

function runCmd(cmd, args = []) {
	return new Promise((resolve, reject) => {
		const p = spawn(cmd, args, {});
		let out = '';
		p.stdout.on('data', (c) => out += c.toString());
		p.stderr.on('data', (c) => out += c.toString());
		p.on('exit', (code) => code === 0 ? resolve(out) : reject(new Error(out)));
	});
}

describe('config-vault script', () => {
	it('encrypts and decrypts a file using the CLI', async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pixelated-vault-'));
		const filePath = path.join(tmp, 'secret.txt');
		await fs.writeFile(filePath, 'super-secret');
		const key = 'a'.repeat(64); // valid 32-byte hex

		// encrypt
		await runCmd('npx', ['tsx', 'src/scripts/config-vault.ts', 'encrypt', filePath, key]);
		const encPath = `${filePath}.enc`;
		const enc = await fs.readFile(encPath, 'utf8');
		expect(enc.startsWith('pxl:v1:')).toBe(true);

		// decrypt
		await runCmd('npx', ['tsx', 'src/scripts/config-vault.ts', 'decrypt', encPath, key]);
		const decrypted = await fs.readFile(filePath, 'utf8');
		expect(decrypted).toBe('super-secret');
	});
});
