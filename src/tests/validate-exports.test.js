import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { describe, it, expect } from 'vitest';

function runScript(scriptPath, cwd) {
	return new Promise((resolve) => {
		const p = spawn(process.execPath, [scriptPath], { cwd });
		let out = '';
		p.stdout.on('data', c => out += c.toString());
		p.stderr.on('data', c => out += c.toString());
		p.on('exit', code => resolve({ code, out }));
	});
}

describe('validate-exports script', () => {
	it('passes when exports match component files', async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pixelated-validate-'));
		// Create minimal structure: src/components/foo.tsx and index files
		await fs.mkdir(path.join(tmp, 'src', 'components'), { recursive: true });
		await fs.writeFile(path.join(tmp, 'src', 'components', 'foo.tsx'), 'export const Foo = () => null;');
		const indexes = ['index.js', 'index.server.js', 'index.adminclient.js', 'index.adminserver.js'];
		for (const i of indexes) {
			await fs.writeFile(path.join(tmp, i), "export * from './src/components/foo';\n");
		}

		const script = path.resolve('src/scripts/validate-exports.js');
		const res = await runScript(script, tmp);
		expect(res.code).toBe(0);
		expect(res.out).toMatch(/All exports validated successfully/);
	});

	it('fails when an exported path does not exist', async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pixelated-validate-'));
		await fs.mkdir(path.join(tmp, 'src', 'components'), { recursive: true });
		// Create index that exports a non-existent component
		const indexes = ['index.js', 'index.server.js', 'index.adminclient.js', 'index.adminserver.js'];
		for (const i of indexes) {
			await fs.writeFile(path.join(tmp, i), "export * from './src/components/missing';\n");
		}
		const script = path.resolve('src/scripts/validate-exports.js');
		const res = await runScript(script, tmp);
		expect(res.code).toBe(1);
		expect(res.out).toMatch(/\.ts|\.tsx files not found/);
	});
});
