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
});
