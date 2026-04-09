import { spawn } from 'child_process';
import path from 'path';
import { describe, it, expect } from 'vitest';

const script = path.resolve('./src/scripts/create-pixelated-app.js');

describe('create-pixelated-app CLI', () => {
	it('prints available templates on startup and aborts when user answers no to proceed', async () => {
		const proc = spawn(process.execPath, [script], { stdio: 'pipe' });
		let out = '';
		let err = '';
		proc.stdout.on('data', (c) => out += c.toString());
		proc.stderr.on('data', (c) => err += c.toString());

		// Provide answers: site name, blank site URL (enter), blank email (enter), proceed? -> 'n' to abort
		proc.stdin.write('test-site\n');
		proc.stdin.write('\n');
		proc.stdin.write('\n');
		proc.stdin.write('n\n');

		await new Promise((resolve, reject) => {
			proc.on('exit', (code) => {
				try {
					expect(code).toBe(0);
					// Confirm available templates printed
					expect(out).toMatch(/Available templates/);
					expect(out).toMatch(/FAQs/);
					resolve(true);
				} catch (e) { reject(e); }
			});
			proc.on('error', reject);
		});
	});
});
