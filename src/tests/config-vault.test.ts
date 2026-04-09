import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
import { encrypt } from '../components/config/crypto';

function mkdtmp(prefix = 'pv-test-') {
	return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe('config-vault postbuild integration', () => {
	it('should decrypt .enc and inject into .next/server', () => {
		const tmp = mkdtmp();
		const appConfigDir = path.join(tmp, 'src', 'app', 'config');
		fs.mkdirSync(appConfigDir, { recursive: true });

		const json = JSON.stringify({ siteName: 'EncSite' });
		const key = 'a'.repeat(64); // valid 32 byte hex key
		const encrypted = encrypt(json, key);

		const encPath = path.join(appConfigDir, 'pixelated.config.json.enc');
		fs.writeFileSync(encPath, encrypted, 'utf8');

		// Run the CLI using the project script (absolute path), with cwd set to the tmp dir
		const scriptPath = path.resolve(__dirname, '..', 'scripts', 'config-vault.ts');
		const res = spawnSync('npx', ['tsx', scriptPath, 'postbuild'], {
			cwd: tmp,
			env: { ...process.env, PIXELATED_CONFIG_KEY: key },
			encoding: 'utf8',
			timeout: 120_000,
		});

		if (res.stderr) {
			// include stderr in failure message for easier debugging
			// but do not fail the test here; we'll assert on exit code
			// console.error(res.stderr);
		}

		expect(res.status).toBe(0);
		expect(res.stdout).toContain('Config injected into .next/server/pixelated.config.json');

		const injected = path.join(tmp, '.next', 'server', 'pixelated.config.json');
		expect(fs.existsSync(injected)).toBe(true);
		const read = fs.readFileSync(injected, 'utf8');
		expect(JSON.parse(read)).toEqual({ siteName: 'EncSite' });

		fs.rmSync(tmp, { recursive: true, force: true });
	});

	it('should be a no-op if no .enc exists', () => {
		const tmp = mkdtmp();
		// no encrypted file created
		const scriptPath = path.resolve(__dirname, '..', 'scripts', 'config-vault.ts');
const res = spawnSync('npx', ['tsx', scriptPath, 'postbuild', '--debug'], {
		cwd: tmp,
		env: process.env,
			encoding: 'utf8',
			timeout: 60_000,
		});

		expect(res.status).toBe(0);
		expect(res.stdout).toContain('No encrypted config found; nothing to do.');

		fs.rmSync(tmp, { recursive: true, force: true });
	});
});