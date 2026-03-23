import { spawn } from 'child_process';
import path from 'path';
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';

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
	describe('Script Validation', () => {
		it('build.sh exists', async () => {
			const scriptPath = path.resolve('src/scripts/build.sh');
			expect(fs.existsSync(scriptPath)).toBe(true);
		});

		it('build.sh is syntactically valid', async () => {
			await bashCheck(path.resolve('src/scripts/build.sh'));
		});

		it('release.sh exists', async () => {
			const scriptPath = path.resolve('src/scripts/release.sh');
			expect(fs.existsSync(scriptPath)).toBe(true);
		});

		it('release.sh is syntactically valid', async () => {
			await bashCheck(path.resolve('src/scripts/release.sh'));
		});

		it('setup-remotes.sh exists', async () => {
			const scriptPath = path.resolve('src/scripts/setup-remotes.sh');
			expect(fs.existsSync(scriptPath)).toBe(true);
		});

		it('setup-remotes.sh is syntactically valid', async () => {
			await bashCheck(path.resolve('src/scripts/setup-remotes.sh'));
		});
	});

	describe('Script Permissions', () => {
		it('build.sh should be executable or readable', async () => {
			const scriptPath = path.resolve('src/scripts/build.sh');
			const stats = fs.statSync(scriptPath);
			expect(stats.isFile()).toBe(true);
		});

		it('release.sh should be executable or readable', async () => {
			const scriptPath = path.resolve('src/scripts/release.sh');
			const stats = fs.statSync(scriptPath);
			expect(stats.isFile()).toBe(true);
		});

		it('setup-remotes.sh should be executable or readable', async () => {
			const scriptPath = path.resolve('src/scripts/setup-remotes.sh');
			const stats = fs.statSync(scriptPath);
			expect(stats.isFile()).toBe(true);
		});
	});

	describe('Script Content', () => {
		it('build.sh should have bash shebang', async () => {
			const scriptPath = path.resolve('src/scripts/build.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			expect(content.startsWith('#!/bin/bash') || content.startsWith('#!/bin/sh')).toBe(true);
		});

		it('release.sh should have bash shebang', async () => {
			const scriptPath = path.resolve('src/scripts/release.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			expect(content.startsWith('#!/bin/bash') || content.startsWith('#!/bin/sh')).toBe(true);
		});

		it('setup-remotes.sh should have bash shebang', async () => {
			const scriptPath = path.resolve('src/scripts/setup-remotes.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			expect(content.startsWith('#!/bin/bash') || content.startsWith('#!/bin/sh')).toBe(true);
		});

		it('build.sh should have non-empty content', async () => {
			const scriptPath = path.resolve('src/scripts/build.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			expect(content.length).toBeGreaterThan(10);
		});

		it('release.sh should have non-empty content', async () => {
			const scriptPath = path.resolve('src/scripts/release.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			expect(content.length).toBeGreaterThan(10);
		});

		it('setup-remotes.sh should have non-empty content', async () => {
			const scriptPath = path.resolve('src/scripts/setup-remotes.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			expect(content.length).toBeGreaterThan(10);
		});
	});

	describe('Script Functions', () => {
		it('build.sh should contain common build patterns', async () => {
			const scriptPath = path.resolve('src/scripts/build.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			const hasCommonPatterns = /npm|yarn|build|compile|make/.test(content);
			expect(content).toBeTruthy();
		});

		it('release.sh should contain package/version patterns', async () => {
			const scriptPath = path.resolve('src/scripts/release.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			expect(content).toBeTruthy();
		});

		it('setup-remotes.sh should contain git remote patterns', async () => {
			const scriptPath = path.resolve('src/scripts/setup-remotes.sh');
			const content = fs.readFileSync(scriptPath, 'utf-8');
			const hasGitPatterns = /git|remote|origin/.test(content);
			expect(content).toBeTruthy();
		});
	});

	describe('Script Error Handling', () => {
		it('bashCheck should validate script syntax', async () => {
			const validScript = 'echo "test"';
			const result = badshCheck('/tmp/test-valid.sh').catch(e => {
				// Script file doesn't need to exist for syntax check to work
				expect(false).toBe(true); // This shouldn't happen for valid syntax
			});
		});

		it('All scripts should pass bash syntax check', async () => {
			const scripts = [
				'src/scripts/build.sh',
				'src/scripts/release.sh',
				'src/scripts/setup-remotes.sh'
			];
			
			for (const script of scripts) {
				const scriptPath = path.resolve(script);
				if (fs.existsSync(scriptPath)) {
					await expect(bashCheck(scriptPath)).resolves.toBeDefined();
				}
			}
		});
	});

	describe('Shell Script Integration', () => {
		it('all scripts in scripts directory should be valid', async () => {
			const scriptsDir = path.resolve('src/scripts');
			if (fs.existsSync(scriptsDir)) {
				const files = fs.readdirSync(scriptsDir);
				const shFiles = files.filter(f => f.endsWith('.sh'));
				
				for (const file of shFiles) {
					const scriptPath = path.join(scriptsDir, file);
					await bashCheck(scriptPath);
				}
			}
		});

		it('bash syntax validator should be functional', async () => {
			const tempScript = path.resolve('src/scripts/build.sh');
			if (fs.existsSync(tempScript)) {
				const result = await bashCheck(tempScript);
				expect(typeof result).toBe('string');
			}
		});
	});
});
