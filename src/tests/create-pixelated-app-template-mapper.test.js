import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { describe, it, expect } from 'vitest';
import { findTemplateForSlug, printAvailableTemplates } from '../scripts/create-pixelated-app.js';

describe('template-mapper', () => {
	it('findTemplateForSlug matches aliases and fuzzy variants', () => {
		const manifest = {
			templates: [
				{ name: 'FAQs', aliases: ['faq', 'faqs', 'frequently-asked-questions'], src: '/tmp/faqs' },
				{ name: 'About', aliases: ['about'], src: '/tmp/about' }
			]
		};
		expect(findTemplateForSlug(manifest, 'faqs')?.name).toBe('FAQs');
		expect(findTemplateForSlug(manifest, 'faq')?.name).toBe('FAQs');
		expect(findTemplateForSlug(manifest, 'faqs-us')?.name).toBe('FAQs');
		expect(findTemplateForSlug(manifest, 'about')?.name).toBe('About');
		expect(findTemplateForSlug(manifest, 'not-a-match')).toBeNull();
	});

	it('printAvailableTemplates logs names and aliases', () => {
		const manifest = {
			templates: [
				{ name: 'FAQs', aliases: ['faq', 'faqs'] },
				{ name: 'About', aliases: ['about'] }
			]
		};
		const logs = [];
		const spy = (m) => logs.push(m);
		const orig = console.log;
		console.log = spy;
		try {
			printAvailableTemplates(manifest);
			// ensure at least the header and entries were logged
			expect(logs.some(l => typeof l === 'string' && l.includes('Available templates'))).toBe(true);
			expect(logs.some(l => typeof l === 'string' && l.includes('FAQs'))).toBe(true);
		} finally {
			console.log = orig;
		}
	});
});

describe('create-pixelated-app page copy helper', () => {
	it('uses the specific template when it exists', async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pixelated-test-'));
		const templatePath = path.join(tmp, 'pixelated-template');
		const pagesDir = path.join(templatePath, 'src', 'app', '(pages)');
		const targetDir = path.join(tmp, 'site', 'src', 'app', '(pages)', 'about');
		const templatePagesHome = path.join(templatePath, 'src', 'app', '(pages)', '(home)');
		await fs.mkdir(path.join(pagesDir, 'about'), { recursive: true });
		await fs.mkdir(templatePagesHome, { recursive: true });
		await fs.writeFile(path.join(pagesDir, 'about', 'page.tsx'), 'TEMPLATE', 'utf8');
		await fs.writeFile(path.join(templatePagesHome, 'page.tsx'), 'HOME', 'utf8');

		const result = await copyTemplateForPage(templatePath, 'foo/about', templatePagesHome, targetDir);
		expect(result.used).toBe('template');
		expect(await fs.readFile(path.join(targetDir, 'page.tsx'), 'utf8')).toBe('TEMPLATE');
	});

	it('falls back to home template when specific template is missing', async () => {
		const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'pixelated-test-'));
		const templatePath = path.join(tmp, 'pixelated-template');
		const pagesDir = path.join(templatePath, 'src', 'app', '(pages)');
		const targetDir = path.join(tmp, 'site', 'src', 'app', '(pages)', 'missing');
		const templatePagesHome = path.join(templatePath, 'src', 'app', '(pages)', '(home)');
		await fs.mkdir(templatePagesHome, { recursive: true });
		await fs.writeFile(path.join(templatePagesHome, 'page.tsx'), 'HOME', 'utf8');

		const result = await copyTemplateForPage(templatePath, 'foo/missing', templatePagesHome, targetDir);
		expect(result.used).toBe('fallback');
		expect(await fs.readFile(path.join(targetDir, 'page.tsx'), 'utf8')).toBe('HOME');
	});
});
