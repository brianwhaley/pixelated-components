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

	// And ensure the returned cloneUrl matches
	const res = await createAndPushRemote(tmpDir, 'test', 'me');
	expect(res).toHaveProperty('cloneUrl', 'https://github.com/me/test.git');
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

it('creates an Amplify app when AWS SDK client is present and commands succeed', async () => {
	const sendMock = vi.fn(async (cmd) => {
		// cmd will be an instance created by the constructors we assign to the module
		if (cmd && cmd.input && cmd.input.name) return { app: { appId: 'd1example' } };
		return {};
	});
	const MockClient = vi.fn(() => ({ send: sendMock }));
	// Override the imported Amplify client and command constructors on the module
	(appModule).AmplifyClient = MockClient;
	(appModule).CreateAppCommand = function(input){ this.input = input };
	(appModule).CreateBranchCommand = function(input){ this.input = input };
	(appModule).UpdateBranchCommand = function(input){ this.input = input };

	// Mock reading components config to supply AWS creds and site .env.local
	vi.spyOn(fs, 'readFile').mockImplementation(async (p) => {
		if (p && p.toString().includes('src/config/pixelated.config.json')) return JSON.stringify({ aws: { access_key_id: 'AKIA_TEST', secret_access_key: 'SECRET_TEST', region: 'us-east-2' } });
		if (p && p.toString().endsWith('.env.local')) return 'PIXELATED_CONFIG_KEY=TEST_KEY_VALUE\n';
		return JSON.stringify({});
	});

	const fakeRl = { question: vi.fn().mockResolvedValueOnce('') };
	await expect(appModule.createAmplifyApp(fakeRl, 'test-site', 'https://github.com/me/test-site.git')).resolves.not.toThrow();
	// ensure the client was constructed with provided credentials
	expect(MockClient).toHaveBeenCalledWith(expect.objectContaining({ region: 'us-east-2', credentials: expect.objectContaining({ accessKeyId: 'AKIA_TEST' }) }));
	// ensure create app and branch commands were sent
	expect(sendMock.mock.calls.some(c => c[0] && c[0].input && c[0].input.name === 'test-site')).toBe(true);
	expect(sendMock.mock.calls.some(c => c[0] && c[0].input && c[0].input.branchName === 'dev')).toBe(true);

	// also ensure UpdateAppCommand was called to set environment variables and/or IAM role
	expect(sendMock.mock.calls.some(c => c[0] && c[0] instanceof appModule.UpdateAppCommand)).toBe(true);
	// ensure the env var key from .env.local was included
	expect(sendMock.mock.calls.some(c => c[0] && c[0].input && c[0].input.environmentVariables && c[0].input.environmentVariables.PIXELATED_CONFIG_KEY === 'TEST_KEY_VALUE')).toBe(true);
});

});