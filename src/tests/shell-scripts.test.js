import { spawn } from 'child_process';
import path from 'path';
import { describe, it, expect } from 'vitest';

function bashCheck(scriptPath) {
	return new Promise((resolve, reject) => {
		const p = spawn('bash', ['-n', scriptPath]);
		let out = '';
		p.stdout.on('data', c => out += c.toString());
		p.stderr.on('data', c => out += c.toString());
		p.on('exit', code => code === 0 ? resolve(out) : reject(new Error(out)));
	});
}

describe('shell scripts syntax', () => {
	it('build.sh is syntactically valid', async () => {
		await bashCheck(path.resolve('src/scripts/build.sh'));
	});
	it('release.sh is syntactically valid', async () => {
		await bashCheck(path.resolve('src/scripts/release.sh'));
	});
	it('setup-remotes.sh is syntactically valid', async () => {
		await bashCheck(path.resolve('src/scripts/setup-remotes.sh'));
	});
});
