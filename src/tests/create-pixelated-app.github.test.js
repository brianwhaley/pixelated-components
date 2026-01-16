import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createAndPushRemote } from '../scripts/create-pixelated-app.js';
import * as appModule from '../scripts/create-pixelated-app.js';

describe('createAndPushRemote', () => {
	let tmpDir;
	beforeEach(() => {
		tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'create-site-'));
	});

afterEach(() => {
		try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (e) {}
		vi.restoreAllMocks();
});

it('creates repo successfully when provider returns token and GitHub returns clone_url', async () => {
	// Mock _exec to simulate git commands and inline tsx
	const mockExec = vi.fn(async (cmd, opts) => {
		if (cmd.includes('npx tsx -e')) {
			return { stdout: JSON.stringify({ token: 'fake-token', defaultOwner: 'me' }) };
		}
		// For git commands, return empty stdout
		return { stdout: '' };
	});
	(appModule)._exec = mockExec;

	// Mock fetch to simulate GitHub API
	global.fetch = vi.fn(async () => ({ ok: true, json: async () => ({ clone_url: 'https://github.com/me/test.git' }) }));

	await expect(createAndPushRemote(tmpDir, 'test', 'me')).resolves.not.toThrow();

	// Ensure we attempted to run tsx and push
	expect(mockExec.mock.calls.some(c => c[0].includes('npx tsx -e'))).toBe(true);
	expect(mockExec.mock.calls.some(c => c[0].includes('git push'))).toBe(true);
});

it('throws when provider output does not include token', async () => {
	const mockExec = vi.fn(async (cmd, opts) => {
		if (cmd.includes('npx tsx -e')) {
			return { stdout: JSON.stringify({}) };
		}
		return { stdout: '' };
	});
	(appModule)._exec = mockExec;
	global.fetch = vi.fn();

	await expect(createAndPushRemote(tmpDir, 'test', 'me')).rejects.toThrow(/Missing github.token/);
});

});