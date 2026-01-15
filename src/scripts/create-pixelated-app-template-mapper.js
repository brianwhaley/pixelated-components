import fs from 'fs/promises';
import path from 'path';

async function exists(p) {
	try {
		await fs.access(p);
		return true;
	} catch (e) {
		return false;
	}
}

export async function loadManifest(baseDir = path.resolve(__dirname)) {
	const manifestPath = path.resolve(baseDir, 'create-pixelated-app.json');
	try {
		if (await exists(manifestPath)) {
			const txt = await fs.readFile(manifestPath, 'utf8');
			return JSON.parse(txt);
		}
	} catch (e) {
		// ignore parse/read errors
	}
	return null;
}

export function findTemplateForSlug(manifest, slug) {
	if (!manifest || !Array.isArray(manifest.templates)) return null;
	slug = (slug || '').toLowerCase();
	for (const t of manifest.templates) {
		if (!t.aliases || !Array.isArray(t.aliases)) continue;
		for (let a of t.aliases) {
			a = a.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
			if (a === slug) return t;
		}
		// also fuzzy match (e.g., 'about-us' -> 'about')
		for (let a of t.aliases) {
			a = a.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
			if (slug === a || slug.startsWith(a + '-') || slug.endsWith('-' + a) || slug.includes('-' + a + '-')) return t;
		}
	}
	return null;
}

export async function pruneTemplateDirs(manifest, destPath, requestedSlugs = []) {
	const removed = [];
	if (!manifest || !Array.isArray(manifest.templates)) return removed;
	const requested = new Set((requestedSlugs || []).map(s => s.toString()));
	for (const t of manifest.templates) {
		const folderName = path.basename(t.src);
		const candidateDir = path.join(destPath, 'src', 'app', '(pages)', folderName);
		if (await exists(candidateDir) && !requested.has(folderName)) {
			// remove the template page folder
			await fs.rm(candidateDir, { recursive: true, force: true });
			removed.push(folderName);
			// remove any associated files defined in the manifest (relative to site root)
			if (Array.isArray(t.associated_files)) {
				for (const rel of t.associated_files) {
					const candidateFile = path.join(destPath, rel);
					try {
						if (await exists(candidateFile)) {
							await fs.rm(candidateFile, { recursive: true, force: true });
						}
					} catch (e) {
						// ignore individual failures
					}
				}
			}
		}
	}
	return removed;
}

export function printAvailableTemplates(manifest) {
	if (!manifest || !Array.isArray(manifest.templates) || manifest.templates.length === 0) return;
	console.log('\nAvailable templates:');
	for (const t of manifest.templates) {
		const aliases = Array.isArray(t.aliases) ? t.aliases.join(', ') : '';
		console.log(` - ${t.name}${aliases ? ': ' + aliases : ''}`);
	}
}
