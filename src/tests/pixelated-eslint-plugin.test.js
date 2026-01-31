import { describe, it, expect } from 'vitest';
import { Linter } from 'eslint';

describe('pixelated-eslint-plugin', () => {
	it('exports rules and configs', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		expect(mod.default).toBeDefined();
		expect(mod.default.rules).toBeDefined();
		expect(mod.default.configs).toBeDefined();
	});

	it('warns when a top-level <section> has no id', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new Linter();
		linter.definePlugin('pixelated', mod.default);
		const code = `export default function Page(){ return (<><section>Hi</section></>); }`;
		const messages = linter.verify(code, {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
			plugins: { pixelated: true },
			rules: { 'pixelated/require-section-ids': 'warn' }
		});
		expect(messages.some(m => m.ruleId === 'pixelated/require-section-ids')).toBe(true);
	});

	it('does not warn when top-level <section> has an id', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new Linter();
		linter.definePlugin('pixelated', mod.default);
		const code = `export default function Page(){ return (<><section id=\"foo\">Hi</section></>); }`;
		const messages = linter.verify(code, {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
			plugins: { pixelated: true },
			rules: { 'pixelated/require-section-ids': 'warn' }
		});
		expect(messages.some(m => m.ruleId === 'pixelated/require-section-ids')).toBe(false);
	});

	it('warns for nested <section> inside article (rule is unconditional)', async () => {
			const mod = await import('../scripts/pixelated-eslint-plugin.js');
			const linter = new Linter();
			linter.definePlugin('pixelated', mod.default);
			const code = `export default function Page(){ return (<article><section>Nested</section></article>); }`;
			const messages = linter.verify(code, {
				parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
				plugins: { pixelated: true },
				rules: { 'pixelated/require-section-ids': 'warn' }
			});
			expect(messages.some(m => m.ruleId === 'pixelated/require-section-ids')).toBe(true);
		});

		it('warns when a <PageSection> has no id', async () => {
			const mod = await import('../scripts/pixelated-eslint-plugin.js');
			const linter = new Linter();
			linter.definePlugin('pixelated', mod.default);
			const code = `export default function Page(){ return (<PageSection>Content</PageSection>); }`;
			const messages = linter.verify(code, {
				parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
				plugins: { pixelated: true },
				rules: { 'pixelated/require-section-ids': 'warn' }
			});
			expect(messages.some(m => m.ruleId === 'pixelated/require-section-ids')).toBe(true);
		});

		it('does not warn when <PageSection> has an id', async () => {
			const mod = await import('../scripts/pixelated-eslint-plugin.js');
			const linter = new Linter();
			linter.definePlugin('pixelated', mod.default);
			const code = `export default function Page(){ return (<PageSection id="ps">Content</PageSection>); }`;
			const messages = linter.verify(code, {
				parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
				plugins: { pixelated: true },
				rules: { 'pixelated/require-section-ids': 'warn' }
			});
			expect(messages.some(m => m.ruleId === 'pixelated/require-section-ids')).toBe(false);
		});

		it('warns for member-expression UI.PageSection without id', async () => {
			const mod = await import('../scripts/pixelated-eslint-plugin.js');
			const linter = new Linter();
			linter.definePlugin('pixelated', mod.default);
			const code = `export default function Page(){ return (<UI.PageSection>Content</UI.PageSection>); }`;
			const messages = linter.verify(code, {
				parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
				plugins: { pixelated: true },
				rules: { 'pixelated/require-section-ids': 'warn' }
			});
			expect(messages.some(m => m.ruleId === 'pixelated/require-section-ids')).toBe(true);
	});

	it('enforces canonical test file locations (valid/invalid)', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);

		// valid: src/tests
		const ok1 = linter.verify('test("x", ()=>{});', {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
			plugins: { pixelated: true },
			rules: { 'pixelated/validate-test-locations': 'error' },
		}, { filename: 'src/tests/foo.test.ts' });
		expect(ok1.some(m => m.ruleId === 'pixelated/validate-test-locations')).toBe(false);

		// valid: stories
		const ok2 = linter.verify('export const s = {}', {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module', ecmaFeatures: { jsx: true } },
			plugins: { pixelated: true },
			rules: { 'pixelated/validate-test-locations': 'error' },
		}, { filename: 'src/stories/foo.stories.tsx' });
		expect(ok2.some(m => m.ruleId === 'pixelated/validate-test-locations')).toBe(false);

		// invalid: test file placed under components/
		const bad = linter.verify('test("x", ()=>{});', {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
			plugins: { pixelated: true },
			rules: { 'pixelated/validate-test-locations': 'error' },
		}, { filename: 'src/components/foo/foo.test.tsx' });
		expect(bad.some(m => m.ruleId === 'pixelated/validate-test-locations')).toBe(true);
	});

	it('disallows process.env / import.meta.env except PIXELATED_CONFIG_KEY', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);

		const cfg = {
			parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			plugins: { pixelated: true },
			rules: { 'pixelated/no-process-env': ['error', { allowed: ['PIXELATED_CONFIG_KEY'] }] },
		};

		// disallowed usages
		expect(linter.verify('const x = process.env.FOO;', cfg).some(m => m.ruleId === 'pixelated/no-process-env')).toBe(true);
		expect(linter.verify("const x = process['env']['BAR'];", cfg).some(m => m.ruleId === 'pixelated/no-process-env')).toBe(true);
		expect(linter.verify('const { BAR } = process.env;', cfg).some(m => m.ruleId === 'pixelated/no-process-env')).toBe(true);
		expect(linter.verify('const z = import.meta.env.BAR;', cfg).some(m => m.ruleId === 'pixelated/no-process-env')).toBe(true);

		// allowed exception
		expect(linter.verify('const k = process.env.PIXELATED_CONFIG_KEY;', cfg).some(m => m.ruleId === 'pixelated/no-process-env')).toBe(false);
		expect(linter.verify('const k = import.meta.env.PIXELATED_CONFIG_KEY;', cfg).some(m => m.ruleId === 'pixelated/no-process-env')).toBe(false);
	});

	it('warns when file sets debug = true (and allows debug in tests/stories)', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);
		const cfg = { parserOptions: { ecmaVersion: 2022, sourceType: 'module' }, plugins: { pixelated: true }, rules: { 'pixelated/no-debug-true': 'warn' } };

		// top-level variable
		expect(linter.verify('const debug = true;', cfg, { filename: 'src/components/foo.tsx' }).some(m => m.ruleId === 'pixelated/no-debug-true')).toBe(true);
		// object literal
		expect(linter.verify('const cfg = { debug: true };', cfg, { filename: 'src/components/foo.tsx' }).some(m => m.ruleId === 'pixelated/no-debug-true')).toBe(true);
		// assignment
		expect(linter.verify('module.exports.debug = true;', cfg, { filename: 'src/lib/index.js' }).some(m => m.ruleId === 'pixelated/no-debug-true')).toBe(true);
		// uppercase DEBUG is allowed to be caught too
		expect(linter.verify('const DEBUG = true;', cfg, { filename: 'src/components/foo.tsx' }).some(m => m.ruleId === 'pixelated/no-debug-true')).toBe(true);

		// allowed in test files / stories
		expect(linter.verify('const debug = true;', cfg, { filename: 'src/tests/foo.test.ts' }).some(m => m.ruleId === 'pixelated/no-debug-true')).toBe(false);
		expect(linter.verify('const debug = true;', cfg, { filename: 'src/stories/foo.stories.tsx' }).some(m => m.ruleId === 'pixelated/no-debug-true')).toBe(false);
	});

	it('enforces kebab-case for filenames (allow list & exemptions)', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);
		const cfg = { parserOptions: { ecmaVersion: 2022, sourceType: 'module' }, plugins: { pixelated: true }, rules: { 'pixelated/file-name-kebab-case': 'warn' } };

		// valid kebab-case
		expect(linter.verify('const x = 1;', cfg, { filename: 'src/components/my-component.tsx' }).length).toBe(0);
		// allowed index and README
		expect(linter.verify('export {}', cfg, { filename: 'src/components/index.tsx' }).length).toBe(0);
		expect(linter.verify('export {}', cfg, { filename: 'README.md' }).length).toBe(0);
		// test/story files are exempt
		expect(linter.verify('test(\"x\",()=>{})', cfg, { filename: 'src/components/my-component.test.tsx' }).length).toBe(0);
		expect(linter.verify('export const s = {}', cfg, { filename: 'src/stories/MyComponent.stories.tsx' }).length).toBe(0);
		// violations
		expect(linter.verify('const x = 1;', cfg, { filename: 'src/components/myComponent.tsx' }).some(m => m.ruleId === 'pixelated/file-name-kebab-case')).toBe(true);
		expect(linter.verify('const x = 1;', cfg, { filename: 'src/components/MyComponent.tsx' }).some(m => m.ruleId === 'pixelated/file-name-kebab-case')).toBe(true);
		expect(linter.verify('const x = 1;', cfg, { filename: 'src/components/my_component.tsx' }).some(m => m.ruleId === 'pixelated/file-name-kebab-case')).toBe(true);
	});

	it('enforces kebab-case for JSX className values', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);
		const cfg = { parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } }, plugins: { pixelated: true }, rules: { 'pixelated/class-name-kebab-case': 'warn' } };

		// valid
		expect(linter.verify('export default function X(){ return (<div className="callout-title-text other-class">Hi</div>); }', cfg).length).toBe(0);

		// invalid: camelCase and snake_case
		const msgs = linter.verify('export default function X(){ return (<div className="calloutTitleText callout_title_text">Hi</div>); }', cfg);
		expect(msgs.some(m => m.ruleId === 'pixelated/class-name-kebab-case')).toBe(true);
	});

	it('detects duplicate exported identifiers when a barrel re-exports two modules that export the same name', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);

		// Create a temporary module directory under src for deterministic resolution
		const tmpDir = new URL('../src/__tmp_barrel__', import.meta.url);
		const fs = await import('fs');
		if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
		// a.js and b.js both export the same identifier 'dupeName'
		fs.writeFileSync(new URL('a.js', tmpDir), 'export function dupeName() {}');
		fs.writeFileSync(new URL('b.js', tmpDir), 'export const dupeName = 1;');

		const barrelCode = "export * from './__tmp_barrel__/a';\nexport * from './__tmp_barrel__/b';";
		const messages = linter.verify(barrelCode, {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
			plugins: { pixelated: true },
			rules: { 'pixelated/no-duplicate-export-names': 'error' },
		}, { filename: 'src/barrel.mock.js' });

		// Clean up
		fs.unlinkSync(new URL('a.js', tmpDir));
		fs.unlinkSync(new URL('b.js', tmpDir));

		expect(messages.some(m => m.ruleId === 'pixelated/no-duplicate-export-names' && /dupeName/.test(m.message))).toBe(true);

		// index barrels are intentionally ignored by the rule (legacy/resolution permissive)
		const messagesIndex = linter.verify(barrelCode, {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
			plugins: { pixelated: true },
			rules: { 'pixelated/no-duplicate-export-names': 'error' },
		}, { filename: 'src/index.mock.js' });
		expect(messagesIndex.some(m => m.ruleId === 'pixelated/no-duplicate-export-names')).toBe(false);
	});

	it('warns when propTypes lack JSDoc or inline comments for client components', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);
		const code = `'use client';
	export function C() { useEffect(()=>{}); }
	C.propTypes = { a: PropTypes.string }`;
		const messages = linter.verify(code, {
			parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
			plugins: { pixelated: true },
			rules: { 'pixelated/required-proptypes-jsdoc': 'error' },
		});
		expect(messages.some(m => m.ruleId === 'pixelated/required-proptypes-jsdoc')).toBe(true);
	});

	it('does not warn when JSDoc above propTypes exists', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);
		const code = `'use client';
	/**\n * Component C\n * @param {string} [props.a] - description\n */
	export function C() { useEffect(()=>{}); }
	C.propTypes = { a: PropTypes.string }`;
		const messages = linter.verify(code, {
			parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
			plugins: { pixelated: true },
			rules: { 'pixelated/required-proptypes-jsdoc': 'error' },
		});
		expect(messages.some(m => m.ruleId === 'pixelated/required-proptypes-jsdoc')).toBe(false);
	});

	it('does not warn when per-prop inline comments exist', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);
		const code = `'use client';
	export function C() { useEffect(()=>{}); }
	C.propTypes = { /* x */ a: PropTypes.string }`;
		const messages = linter.verify(code, {
			parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
			plugins: { pixelated: true },
			rules: { 'pixelated/required-proptypes-jsdoc': 'error' },
		});
		expect(messages.some(m => m.ruleId === 'pixelated/required-proptypes-jsdoc')).toBe(false);
	});

	it('regression: exported rules are present in recommended config', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const plugin = mod.default;
		const expected = ['validate-test-locations', 'no-process-env', 'no-debug-true', 'file-name-kebab-case', 'required-proptypes-jsdoc', 'class-name-kebab-case'];
		expected.forEach(r => {
			expect(plugin.rules[r]).toBeDefined();
			expect(plugin.configs).toBeDefined();
			expect(plugin.configs.recommended).toBeDefined();
			expect(plugin.configs.recommended.rules[`pixelated/${r}`]).toBeDefined();
		});
			expect(plugin.configs.recommended.rules['pixelated/required-proptypes-jsdoc']).toBe('error');
			expect(plugin.configs.recommended.rules['pixelated/no-temp-dependency']).toBe('error');
		});

	it('errors when package-lock contains vulnerable temp dep', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);

		const fs = await import('fs');
		const lockPath = new URL('../../package-lock.test.json', import.meta.url);
		const lockFullPath = lockPath.pathname;
		fs.writeFileSync(lockFullPath, JSON.stringify({ dependencies: { 'fast-xml-parser': { version: '5.2.5' } } }));

		const code = 'const x = 1;';
		const messages = linter.verify(code, {
			parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			plugins: { pixelated: true },
			rules: { 'pixelated/no-temp-dependency': 'error' },
		}, { filename: 'src/index.js' });

		fs.unlinkSync(lockFullPath);
		expect(messages.some(m => m.ruleId === 'pixelated/no-temp-dependency')).toBe(true);
	});

	it('does not error when package-lock contains patched dep', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);

		const fs = await import('fs');
		const lockPath = new URL('../../package-lock.test.json', import.meta.url);
		const lockFullPath = lockPath.pathname;
		fs.writeFileSync(lockFullPath, JSON.stringify({ dependencies: { 'fast-xml-parser': { version: '5.3.4' } } }));

		const code = 'const x = 1;';
		const messages = linter.verify(code, {
			parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
			plugins: { pixelated: true },
			rules: { 'pixelated/no-temp-dependency': 'error' },
		}, { filename: 'src/index.js' });

		fs.unlinkSync(lockFullPath);
		expect(messages.some(m => m.ruleId === 'pixelated/no-temp-dependency')).toBe(false);
	});

	it('errors when lockfile is clean but package.json has an override for the temp dep', async () => {
		const mod = await import('../scripts/pixelated-eslint-plugin.js');
		const linter = new (await import('eslint')).Linter();
		linter.definePlugin('pixelated', mod.default);

		const fs = await import('fs');
		const os = await import('os');
		const path = await import('path');
		const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-'));
		try {
			// patched lockfile
			fs.writeFileSync(path.join(tmpdir, 'package-lock.json'), JSON.stringify({ dependencies: { 'fast-xml-parser': { version: '5.3.4' } } }));
			// package.json with override that maps xml-builder -> fast-xml-parser
			fs.writeFileSync(path.join(tmpdir, 'package.json'), JSON.stringify({ overrides: { '@aws-sdk/xml-builder': { 'fast-xml-parser': '^5.3.4' } } }));

			const oldCwd = process.cwd();
			process.chdir(tmpdir);

			const code = 'const x = 1;';
			const messages = linter.verify(code, {
				parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
				plugins: { pixelated: true },
					rules: { 'pixelated/no-temp-dependency': 'error', 'pixelated/no-stale-override': 'error' },
				}, { filename: 'src/index.js' });

			process.chdir(oldCwd);
			expect(messages.some(m => m.ruleId === 'pixelated/no-temp-dependency')).toBe(false);
			expect(messages.some(m => m.ruleId === 'pixelated/no-stale-override')).toBe(false);
		} finally {
			fs.rmSync(tmpdir, { recursive: true, force: true });
		}
	});

		it('reports nested vulnerable copy and does not flag stale override', async () => {
			const mod = await import('../scripts/pixelated-eslint-plugin.js');
			const linter = new (await import('eslint')).Linter();
			linter.definePlugin('pixelated', mod.default);

			const fs = await import('fs');
			const os = await import('os');
			const path = await import('path');
			const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-'));
			try {
				// top-level patched, nested vulnerable under xml-builder
				const lock = { packages: { '': { dependencies: { 'fast-xml-parser': '^5.3.4' } }, 'node_modules/@aws-sdk/xml-builder': { version: '3.972.2', dependencies: { 'fast-xml-parser': '5.2.5' } } } };
				fs.writeFileSync(path.join(tmpdir, 'package-lock.json'), JSON.stringify(lock));
				fs.writeFileSync(path.join(tmpdir, 'package.json'), JSON.stringify({ overrides: { '@aws-sdk/xml-builder': { 'fast-xml-parser': '^5.3.4' } } }));

				const oldCwd = process.cwd();
				process.chdir(tmpdir);

				const code = 'const x = 1;';
				const messages = linter.verify(code, {
					parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
					plugins: { pixelated: true },
					rules: { 'pixelated/no-temp-dependency': 'error', 'pixelated/no-stale-override': 'error' },
				}, { filename: 'src/index.js' });

				process.chdir(oldCwd);
				expect(messages.some(m => m.ruleId === 'pixelated/no-temp-dependency')).toBe(true);
				expect(messages.some(m => m.ruleId === 'pixelated/no-stale-override')).toBe(false);
			} finally {
				fs.rmSync(tmpdir, { recursive: true, force: true });
			}
		});

		it('errors when override is stale because library declares equal-or-higher dependency', async () => {
			const mod = await import('../scripts/pixelated-eslint-plugin.js');
			const linter = new (await import('eslint')).Linter();
			linter.definePlugin('pixelated', mod.default);

			const fs = await import('fs');
			const os = await import('os');
			const path = await import('path');
			const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-'));
			try {
				// library declares equal dependency
				const lock = { packages: { 'node_modules/@aws-sdk/xml-builder': { version: '3.972.2', dependencies: { 'fast-xml-parser': '5.3.4' } } } };
				fs.writeFileSync(path.join(tmpdir, 'package-lock.json'), JSON.stringify(lock));
				fs.writeFileSync(path.join(tmpdir, 'package.json'), JSON.stringify({ overrides: { '@aws-sdk/xml-builder': { 'fast-xml-parser': '^5.3.4' } } }));

				const oldCwd = process.cwd();
				process.chdir(tmpdir);

				const code = 'const x = 1;';
				const messages = linter.verify(code, {
					parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
					plugins: { pixelated: true },
					rules: { 'pixelated/no-stale-override': 'error' },
				}, { filename: 'src/index.js' });

				process.chdir(oldCwd);
				expect(messages.some(m => m.ruleId === 'pixelated/no-stale-override')).toBe(true);
			} finally {
				fs.rmSync(tmpdir, { recursive: true, force: true });
			}
		});

		it('does not error when override is necessary (library requires older version)', async () => {
			const mod = await import('../scripts/pixelated-eslint-plugin.js');
			const linter = new (await import('eslint')).Linter();
			linter.definePlugin('pixelated', mod.default);

			const fs = await import('fs');
			const os = await import('os');
			const path = await import('path');
			const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), 'pkg-'));
			try {
				const lock = { packages: { 'node_modules/@aws-sdk/xml-builder': { version: '3.972.2', dependencies: { 'fast-xml-parser': '5.2.5' } } } };
				fs.writeFileSync(path.join(tmpdir, 'package-lock.json'), JSON.stringify(lock));
				fs.writeFileSync(path.join(tmpdir, 'package.json'), JSON.stringify({ overrides: { '@aws-sdk/xml-builder': { 'fast-xml-parser': '^5.3.4' } } }));

				const oldCwd = process.cwd();
				process.chdir(tmpdir);

				const code = 'const x = 1;';
				const messages = linter.verify(code, {
					parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
					plugins: { pixelated: true },
					rules: { 'pixelated/no-stale-override': 'error' },
				}, { filename: 'src/index.js' });

				process.chdir(oldCwd);
				expect(messages.some(m => m.ruleId === 'pixelated/no-stale-override')).toBe(false);
			} finally {
				fs.rmSync(tmpdir, { recursive: true, force: true });
			}
		});});