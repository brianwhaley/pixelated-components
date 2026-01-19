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
});
