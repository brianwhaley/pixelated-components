import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect } from 'vitest';

function createTemporaryProject(files: Record<string, string>) {
	const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pixelated-eslint-'));
	for (const [relativePath, contents] of Object.entries(files)) {
		const absolutePath = path.join(projectRoot, relativePath);
		fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
		fs.writeFileSync(absolutePath, contents);
	}
	return projectRoot;
}

function createRuleContext(filename: string) {
	const reports: any[] = [];
	return {
		getFilename: () => filename,
		getSourceCode: () => ({ ast: { type: 'Program' } }),
		report: (report: any) => reports.push(report),
		reports,
	};
}

describe('pixelated package-json dependency rules', () => {
	it('reports an undeclared package dependency imported from source', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({ dependencies: { react: '^19.0.0' } }, null, 2),
		});
		const filePath = path.join(projectRoot, 'src', 'app', 'page.tsx');
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(filePath, "import foo from 'foo';\nexport default function Page(){ return <div />; }");

		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-missing-dependency'].create(context);
		visitor.ImportDeclaration?.({ source: { value: 'foo' } });

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'missingDependency')).toBe(true);
	});

	it('warns when a dev dependency is imported from runtime source', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({ devDependencies: { eslint: '^9.0.0' } }, null, 2),
		});
		const filePath = path.join(projectRoot, 'src', 'app', 'page.tsx');
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(filePath, "import eslint from 'eslint';\nexport default function Page(){ return <div />; }");

		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-wrong-dependency-type'].create(context);
		visitor.ImportDeclaration?.({ source: { value: 'eslint' } });

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'devUsedInProd')).toBe(true);
	});

	it('warns when a runtime dependency is imported from dev-only source', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({ dependencies: { react: '^19.0.0' } }, null, 2),
		});
		const filePath = path.join(projectRoot, 'src', 'tests', 'page.test.tsx');
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(filePath, "import React from 'react';\nexport default function Page(){ return <div />; }");

		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-wrong-dependency-type'].create(context);
		visitor.ImportDeclaration?.({ source: { value: 'react' } });

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'prodUsedInDev')).toBe(true);
	});

	it('detects unused runtime dependencies and optionalDependencies across the project', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({
				dependencies: { react: '^19.0.0', 'unused-lib': '^1.0.0' },
				optionalDependencies: { 'optional-lib': '^1.0.0' },
				devDependencies: { typescript: '^5.0.0' },
			}, null, 2),
			'src/app/page.tsx': "import React from 'react';\nexport default function Page(){ return <div />; }",
		});

		const filePath = path.join(projectRoot, 'src', 'app', 'page.tsx');
		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-no-unused-dependency'].create(context);
		visitor['Program:exit']?.();

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'unusedDependency')).toBe(true);
	});

	it('does not report dependencies referenced only by package scripts as unused', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({
				dependencies: { eslint: '^9.0.0' },
				scripts: { lint: 'eslint --fix src' },
			}, null, 2),
			'src/app/page.tsx': "export default function Page(){ return <div />; }",
		});

		const filePath = path.join(projectRoot, 'src', 'app', 'page.tsx');
		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-no-unused-dependency'].create(context);
		visitor['Program:exit']?.();

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'unusedDependency')).toBe(false);
	});

	it('does not report packages referenced only by config files as unused', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({
				dependencies: { next: '^15.0.0' },
			}, null, 2),
			'next.config.ts': "import next from 'next'; export default { reactStrictMode: true };",
		});

		const filePath = path.join(projectRoot, 'next.config.ts');
		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-no-unused-dependency'].create(context);
		visitor['Program:exit']?.();

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'unusedDependency')).toBe(false);
	});

	it('does not report next in next.config.ts as a dev-only dependency', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({
				dependencies: { next: '^15.0.0' },
			}, null, 2),
			'next.config.ts': "import next from 'next'; export default { reactStrictMode: true };",
		});

		const filePath = path.join(projectRoot, 'next.config.ts');
		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-wrong-dependency-type'].create(context);
		visitor.ImportDeclaration?.({ source: { value: 'next' } });

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'prodUsedInDev')).toBe(false);
	});

	it('does not warn about a dev-only file import when the package is also used in runtime source', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({
				dependencies: { react: '^19.0.0' },
			}, null, 2),
			'src/app/page.tsx': "import React from 'react'; export default function Page(){ return <div />; }",
			'build/setup.ts': "import React from 'react'; console.log('setup');",
		});

		const filePath = path.join(projectRoot, 'build', 'setup.ts');
		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-wrong-dependency-type'].create(context);
		visitor.ImportDeclaration?.({ source: { value: 'react' } });

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'prodUsedInDev')).toBe(false);
	});

	it('does not report @eslint/js as unused when scripts reference eslint', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({
				devDependencies: { '@eslint/js': '^9.0.0' },
				scripts: { lint: 'eslint --fix src' },
			}, null, 2),
			'src/app/page.tsx': "export default function Page(){ return <div />; }",
		});

		const filePath = path.join(projectRoot, 'src', 'app', 'page.tsx');
		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-no-unused-dependency'].create(context);
		visitor['Program:exit']?.();

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'unusedDependency')).toBe(false);
	});

	it('does not report devDependencies only as unused', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({ devDependencies: { typescript: '^5.0.0' } }, null, 2),
			'src/app/page.tsx': "export default function Page(){ return <div />; }",
		});

		const filePath = path.join(projectRoot, 'src', 'app', 'page.tsx');
		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-no-unused-dependency'].create(context);
		visitor['Program:exit']?.();

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'unusedDependency')).toBe(false);
	});

	it('ignores built-in modules when checking package declarations', async () => {
		const plugin = await import('../scripts/pixelated-eslint-plugin.js');
		const projectRoot = createTemporaryProject({
			'package.json': JSON.stringify({ dependencies: {} }, null, 2),
		});
		const filePath = path.join(projectRoot, 'src', 'app', 'page.ts');
		fs.mkdirSync(path.dirname(filePath), { recursive: true });
		fs.writeFileSync(filePath, "import fs from 'fs';\nexport function readFile() { return fs.readFileSync('foo.txt', 'utf8'); }");

		const context = createRuleContext(filePath);
		const visitor = plugin.default.rules['package-json-missing-dependency'].create(context);
		visitor.ImportDeclaration?.({ source: { value: 'fs' } });

		fs.rmSync(projectRoot, { recursive: true, force: true });
		expect(context.reports.some(r => r.messageId === 'missingDependency')).toBe(false);
	});
});
