import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { describe, it, expect } from 'vitest';

describe('generate-site-images script', () => {
	it('generates site-images.json listing image files in public', async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pixelated-images-'));
		const publicDir = path.join(tmp, 'public');
		await fs.mkdir(publicDir, { recursive: true });
		// create some image files
		await fs.writeFile(path.join(publicDir, 'a.png'), 'x');
		await fs.writeFile(path.join(publicDir, 'sub', 'b.jpg').replace('/sub/', '/sub/'), 'x').catch(() => {});
		await fs.mkdir(path.join(publicDir, 'sub'), { recursive: true });
		await fs.writeFile(path.join(publicDir, 'sub', 'b.jpg'), 'x');

		const script = path.resolve('src/scripts/generate-site-images.js');
		await new Promise((resolve, reject) => {
			const p = spawn(process.execPath, [script], { cwd: tmp });
			let out = '';
			p.stdout.on('data', c => out += c.toString());
			p.stderr.on('data', c => out += c.toString());
			p.on('exit', code => code === 0 ? resolve(out) : reject(new Error('script failed: ' + out)));
		});

		const outFile = path.join(publicDir, 'site-images.json');
		const raw = await fs.readFile(outFile, 'utf8');
		const json = JSON.parse(raw);
		expect(json.images).toBeDefined();
		expect(json.metadata.imageCount).toBe(2);
	});
});
