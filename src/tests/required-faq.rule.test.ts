import { RuleTester } from 'eslint';
import fs from 'fs';
import plugin from '../scripts/pixelated-eslint-plugin.js';
import { vi, describe, afterEach, test } from 'vitest';

const rule = (plugin as any).rules['required-faq'];

// Direct unit tests: invoke the rule visitor with a fake `context` so we can reliably
// control `cwd` and filesystem behavior without hitting ESLint's flat-config logic.
function makeContext(filename = 'src/app/layout.tsx', cwd = process.cwd()) {
	const reports: Array<any> = [];
	return {
		getFilename: () => filename,
		cwd,
		report: (r: any) => reports.push(r),
		getReports: () => reports,
		getSourceCode: () => ({ text: '' }),
	};
}

// helper to simulate a simple src/ filesystem with an app/faqs/page.tsx and pages/faqs variants
function mockFaqFs({ pathSuffix = 'src/app/faqs/page.tsx', content = '{"@type":"FAQPage"}' } = {}) {
	const makeDirent = (name: string, isDir: boolean) => ({ name, isDirectory: () => isDir } as unknown as fs.Dirent);
	vi.spyOn(fs, 'existsSync').mockImplementation(p => {
		const s = String(p).replace(/\\\\/g, '/');
		// pretend src exists and the specific faq file exists
		if (s.endsWith(pathSuffix) || s.includes('/src')) return true;
		return false;
	});
	vi.spyOn(fs, 'readdirSync').mockImplementation(((p: fs.PathLike, opts?: unknown) => {
		const s = String(p).replace(/\\\\/g, '/');
		// handle default app/faqs and pages/faqs
		if (s.endsWith('/src')) return [makeDirent('app', true), makeDirent('pages', true)] as unknown as fs.Dirent[];
		if (s.endsWith('/src/app')) {
			if (pathSuffix.includes('team/locations')) return [makeDirent('team', true)] as unknown as fs.Dirent[];
			return [makeDirent('faqs', true), makeDirent('(pages)', true)] as unknown as fs.Dirent[];
		}
		if (s.endsWith('/src/app/team')) return [makeDirent('locations', true)] as unknown as fs.Dirent[];
		if (s.endsWith('/src/app/team/locations')) return [makeDirent('faqs', true)] as unknown as fs.Dirent[];
		if (s.endsWith('/src/app/faqs') || s.endsWith('/src/app/team/locations/faqs')) return [makeDirent('page.tsx', false)] as unknown as fs.Dirent[];
		if (s.endsWith('/src/app/(pages)')) return [makeDirent('faqs', true)] as unknown as fs.Dirent[];
		if (s.endsWith('/src/pages')) return [makeDirent('faqs', true)] as unknown as fs.Dirent[];
		if (s.endsWith('/src/pages/faqs')) return [makeDirent('index.tsx', false)] as unknown as fs.Dirent[];
		return [] as unknown as fs.Dirent[];
	}) as unknown as typeof fs.readdirSync);
	vi.spyOn(fs, 'readFileSync').mockImplementation(p => content);
}

test('valid when `faqs` exists and contains FAQSchema', () => {
	mockFaqFs({ content: '{"@type":"FAQPage"}' });
	const ctx = makeContext();
	const visitor = rule.create(ctx);
	if (visitor['Program:exit']) visitor['Program:exit']();
	expect(ctx.getReports()).toHaveLength(0);
	vi.restoreAllMocks();
});

test('reports missingFaqSchema when `faqs` exists but lacks FAQSchema', () => {
	mockFaqFs({ content: '/* no schema here */' });
	const ctx = makeContext();
	const visitor = rule.create(ctx);
	if (visitor['Program:exit']) visitor['Program:exit']();
	expect(ctx.getReports().some(r => r.messageId === 'missingFaqSchema')).toBe(true);
	vi.restoreAllMocks();
});

test('reports missingFaqPage when neither `faq` nor `faqs` exist', () => {
	vi.spyOn(fs, 'existsSync').mockImplementation(() => false);
	const ctx = makeContext();
	const visitor = rule.create(ctx);
	if (visitor['Program:exit']) visitor['Program:exit']();
	expect(ctx.getReports().some(r => r.messageId === 'missingFaqPage')).toBe(true);
	vi.restoreAllMocks();
});

test('accepts src/app/(pages)/faqs/page.tsx (grouped app folder)', () => {
	mockFaqFs({ pathSuffix: 'src/app/(pages)/faqs/page.tsx', content: '{"@type":"FAQPage"}' });
	const ctx = makeContext();
	const visitor = rule.create(ctx);
	if (visitor['Program:exit']) visitor['Program:exit']();
	expect(ctx.getReports()).toHaveLength(0);
	vi.restoreAllMocks();
});

test('accepts pages-router variants (src/pages/faqs/index.tsx and JSON-LD)', () => {
	mockFaqFs({ pathSuffix: 'src/pages/faqs/index.tsx', content: '{"@type":"FAQPage"}' });
	const ctx = makeContext();
	const visitor = rule.create(ctx);
	if (visitor['Program:exit']) visitor['Program:exit']();
	expect(ctx.getReports()).toHaveLength(0);
	vi.restoreAllMocks();
});

test('accepts deeply nested src/app/.../faqs/page.tsx', () => {
	// simulate a deeply nested path (e.g. src/app/team/locations/faqs/page.tsx)
	mockFaqFs({ pathSuffix: 'src/app/team/locations/faqs/page.tsx', content: '{"@type":"FAQPage"}' });
	const ctx = makeContext();
	const visitor = rule.create(ctx);
	if (visitor['Program:exit']) visitor['Program:exit']();
	expect(ctx.getReports()).toHaveLength(0);
	vi.restoreAllMocks();
});

test('accepts direct pages file src/pages/faqs.tsx', () => {
	mockFaqFs({ pathSuffix: 'src/pages/faqs/index.tsx', content: '{"@type":"FAQPage"}' });
	const ctx = makeContext();
	const visitor = rule.create(ctx);
	if (visitor['Program:exit']) visitor['Program:exit']();
	expect(ctx.getReports()).toHaveLength(0);
	vi.restoreAllMocks();
});
