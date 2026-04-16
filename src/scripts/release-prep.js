#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getNpmOriginalArgs() {
	const raw = process.env.npm_config_argv;
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed.original) ? parsed.original : [];
	} catch {
		return [];
	}
}

const npmOriginalArgs = getNpmOriginalArgs();
const isVerbose = process.argv.includes('--verbose') || process.argv.includes('-v') || npmOriginalArgs.includes('--verbose') || npmOriginalArgs.includes('-v') || process.env.RELEASE_PREP_VERBOSE === '1';

const RELEASE_PREP_NAME = 'release-prep';

function runCommand(command, args, options) {
	const result = spawnSync(command, args, {
		encoding: 'utf8',
		stdio: isVerbose ? 'inherit' : 'pipe',
		...options,
	});

	return {
		status: result.status,
		stdout: result.stdout?.trim() ?? '',
		stderr: result.stderr?.trim() ?? '',
	};
}

async function existsFile(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function findMonorepoRoot(startDir) {
	const result = runCommand('git', ['rev-parse', '--show-toplevel'], { cwd: startDir, stdio: 'pipe' });
	if (result.status === 0 && result.stdout) {
		return path.resolve(result.stdout);
	}

	let current = path.resolve(startDir);
	while (true) {
		if (await existsFile(path.join(current, 'package.json'))) {
			return current;
		}
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}

	throw new Error('Unable to determine monorepo root');
}

async function findWorkspaceRoot(startDir, monorepoRoot) {
	let current = path.resolve(startDir);
	while (true) {
		if (await existsFile(path.join(current, 'package.json'))) {
			return current;
		}
		if (current === monorepoRoot) {
			return monorepoRoot;
		}
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return monorepoRoot;
}

async function readPackageJson(pkgDir) {
	const pkgPath = path.join(pkgDir, 'package.json');
	const file = await fs.readFile(pkgPath, 'utf8');
	return JSON.parse(file);
}

function getContextType(workspaceRoot, monorepoRoot) {
	if (workspaceRoot === monorepoRoot) {
		return 'root';
	}

	const relative = path.relative(monorepoRoot, workspaceRoot).replace(/\\/g, '/');
	if (relative.startsWith('apps/')) return 'app';
	if (relative.startsWith('tools/')) return 'tool';
	if (relative.startsWith('packages/')) return 'package';
	return 'standalone';
}

async function listWorkspaceDirs(monorepoRoot) {
	const workspaceDirs = [];
	for (const group of ['packages', 'apps', 'tools']) {
		const groupDir = path.join(monorepoRoot, group);
		try {
			const entries = await fs.readdir(groupDir, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isDirectory()) continue;
				const workspaceDir = path.join(groupDir, entry.name);
				if (await existsFile(path.join(workspaceDir, 'package.json'))) {
					workspaceDirs.push(workspaceDir);
				}
			}
		} catch {
			continue;
		}
	}
	return workspaceDirs;
}

function formatStatus(step) {
	if (step.status === 'success') return '✅';
	if (step.status === 'failed') return '❌';
	return '⏭️';
}

function printWorkspaceHeader(workspaceName) {
	console.log('\n=================================================');
	console.log(`📦 ${workspaceName}`);
	console.log('=================================================');
}

function printWorkspaceSummary(workspaceResult) {
	for (const [stepName, stepResult] of Object.entries(workspaceResult.steps)) {
		console.log(`${formatStatus(stepResult)} ${stepResult.label}${stepResult.status === 'skipped' ? ' (skipped)' : ''}`);
		if (stepResult.status === 'failed' && stepResult.detail) {
			console.log(`   ${stepResult.detail.split('\n').join('\n   ')}`);
		}
	}
}

function commandLabel(command, args) {
	return `${command} ${args.map(String).join(' ')}`;
}

function runLifecycleStep(workspaceDir, label, command, args) {
	console.log(`\n--- ${label} (${path.basename(workspaceDir)}) ---`);
	console.log(commandLabel(command, args));
	const result = runCommand(command, args, { cwd: workspaceDir });
	if (isVerbose) {
		if (result.stdout) console.log(result.stdout);
		if (result.stderr) console.error(result.stderr);
	}
	if (result.status === 0) {
		return { status: 'success', label };
	}

	const detail = result.stderr || result.stdout || 'Unknown error';
	console.error(detail);
	return { status: 'failed', label, detail };
}

async function workspaceHasScript(pkgJson, name) {
	return pkgJson.scripts && typeof pkgJson.scripts[name] === 'string';
}

async function workspaceHasVitest(pkgJson) {
	const deps = { ...pkgJson.dependencies, ...pkgJson.devDependencies, ...pkgJson.optionalDependencies, ...pkgJson.peerDependencies };
	return typeof deps?.vitest !== 'undefined';
}

async function runUpdateStep(workspaceDir, pkgJson) {
	if (await workspaceHasScript(pkgJson, 'update')) {
		return runLifecycleStep(workspaceDir, 'Update', 'npm', ['run', 'update']);
	}
	return { status: 'skipped', label: 'Update' };
}

async function runLintStep(workspaceDir, pkgJson) {
	if (await workspaceHasScript(pkgJson, 'lint')) {
		return runLifecycleStep(workspaceDir, 'Lint', 'npm', ['run', 'lint']);
	}
	return { status: 'skipped', label: 'Lint' };
}

async function runTestStep(workspaceDir, pkgJson) {
	if (await workspaceHasScript(pkgJson, 'test:coverage')) {
		return runLifecycleStep(workspaceDir, 'Test', 'npm', ['run', 'test:coverage']);
	}
	if (await workspaceHasScript(pkgJson, 'test')) {
		return runLifecycleStep(workspaceDir, 'Test', 'npm', ['run', 'test']);
	}
	if (await workspaceHasVitest(pkgJson)) {
		return runLifecycleStep(workspaceDir, 'Test', 'npm', ['exec', '--', 'vitest', 'run', '--coverage', '--silent', '--passWithNoTests']);
	}
	return { status: 'skipped', label: 'Test' };
}

async function runBuildStep(workspaceDir, pkgJson) {
	if (await workspaceHasScript(pkgJson, 'build')) {
		return runLifecycleStep(workspaceDir, 'Build', 'npm', ['run', 'build']);
	}
	return { status: 'skipped', label: 'Build' };
}

async function runGenerateImagesStep(workspaceDir, pkgJson) {
	if (await workspaceHasScript(pkgJson, 'generate-site-images')) {
		return runLifecycleStep(workspaceDir, 'Generate Images', 'npm', ['run', 'generate-site-images']);
	}
	return { status: 'skipped', label: 'Generate Images' };
}

async function runWorkspacePipeline(workspaceDir) {
	const pkgJson = await readPackageJson(workspaceDir);
	const workspaceName = pkgJson.name || path.basename(workspaceDir);
	const steps = {
		update: { label: 'Update', status: 'skipped' },
		lint: { label: 'Lint', status: 'skipped' },
		test: { label: 'Test', status: 'skipped' },
		build: { label: 'Build', status: 'skipped' },
		images: { label: 'Generate Images', status: 'skipped' },
	};

	steps.update = await runUpdateStep(workspaceDir, pkgJson);
	steps.lint = await runLintStep(workspaceDir, pkgJson);

	if (steps.lint.status === 'failed') {
		steps.test = { status: 'skipped', label: 'Test', detail: 'Skipped because lint failed' };
	} else {
		steps.test = await runTestStep(workspaceDir, pkgJson);
	}

	if (steps.test.status === 'failed') {
		steps.build = { status: 'skipped', label: 'Build', detail: 'Skipped because tests failed' };
	} else {
		steps.build = await runBuildStep(workspaceDir, pkgJson);
	}

	if (steps.build.status === 'failed') {
		steps.images = { status: 'skipped', label: 'Generate Images', detail: 'Skipped because build failed' };
	} else {
		steps.images = await runGenerateImagesStep(workspaceDir, pkgJson);
	}

	return { name: workspaceName, dir: workspaceDir, steps };
}

async function run() {
	const cwd = process.cwd();
	const monorepoRoot = await findMonorepoRoot(cwd);
	const workspaceRoot = await findWorkspaceRoot(cwd, monorepoRoot);
	const contextType = getContextType(workspaceRoot, monorepoRoot);
	const workspaceDirs = contextType === 'root'
		? await listWorkspaceDirs(monorepoRoot)
		: [workspaceRoot];

	if (workspaceDirs.length === 0) {
		console.error('No workspace packages found to run release prep.');
		process.exit(1);
	}

	if (isVerbose) {
		console.log('--- verbose mode enabled: streaming child command output live ---');
	}

	console.log('=================================================');
	console.log(`🚀 release-prep starting from ${cwd}`);
	console.log(`Context: ${contextType}`);
	console.log('Workspaces:');
	workspaceDirs.forEach((dir) => console.log(` - ${path.relative(monorepoRoot, dir)}`));
	console.log('=================================================');

	const workspaceResults = [];
	for (const workspaceDir of workspaceDirs) {
		const pkgJson = await readPackageJson(workspaceDir);
		printWorkspaceHeader(pkgJson.name || path.basename(workspaceDir));
		const result = await runWorkspacePipeline(workspaceDir);
		workspaceResults.push(result);
		printWorkspaceSummary(result);
	}

	console.log('\n=================================================');
	console.log('📊 Release-prep summary');
	console.log('=================================================');
	let failedCount = 0;
	for (const result of workspaceResults) {
		const failedSteps = Object.values(result.steps).filter((step) => step.status === 'failed');
		console.log(`\n${result.name}`);
		if (failedSteps.length === 0) {
			console.log('  ✅ All requested steps completed successfully');
		} else {
			failedCount += 1;
			failedSteps.forEach((step) => console.log(`  ❌ ${step.label}`));
		}
	}

	if (failedCount > 0) {
		console.error(`\nrelease-prep failed for ${failedCount} workspace(s)`);
		process.exit(1);
	}

	console.log('\n✅ release-prep complete');
	process.exit(0);
}

run().catch((error) => {
	console.error('Unexpected error in release-prep:', error);
	process.exit(1);
});
