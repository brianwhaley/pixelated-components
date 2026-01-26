import fs from 'fs';
import path from 'path';
import * as childProcess from 'child_process';

/**
 * Zip the contents of a WordPress theme folder into Pixelated.zip.
 * - Default target folder: sibling `pixelated-blog-wp-theme` in the repo root
 * - Uses the system `zip` command (macOS/Linux). Fails with a helpful message if zip is not available.
 *
 * Exported for unit testing.
 */
export function buildZipArgs(zipName = 'Pixelated.zip') {
	// exported for unit-testing
	// Exclude: the zip itself, VCS, macOS metadata, dev/build artifacts and common folders
	return [
		'-r',
		zipName,
		'.',
		'-x', zipName,
		'-x', '.git/*',
		'-x', '.git/**',
		'-x', '.DS_Store',
		'-x', 'node_modules/**',
		'-x', 'dist/**',
		'-x', '.cache/**',
		'-x', 'coverage/**',
		'-x', '.vscode/**',
	];
}

export function zipPixelatedTheme(inputPath, zipName = 'Pixelated.zip') {
	const scriptDir = path.resolve(new URL(import.meta.url).pathname, '..');
	// repo layout: <repo-root>/pixelated-components/src/scripts
	const repoRoot = path.resolve(scriptDir, '..', '..');
	const themeDir = inputPath
		? path.resolve(process.cwd(), inputPath)
		: path.resolve(repoRoot, '..', 'pixelated-blog-wp-theme');

	if (!fs.existsSync(themeDir) || !fs.statSync(themeDir).isDirectory()) {
		throw new Error(`Theme directory not found or not a directory: ${themeDir}`);
	}

	const zipPath = path.join(themeDir, zipName);

	// Remove existing zip (non-fatal if it doesn't exist)
	try {
		if (fs.existsSync(zipPath)) {
			fs.unlinkSync(zipPath);
			console.log(`Removed existing zip: ${zipPath}`);
		}
	} catch (err) {
		throw new Error(`Failed to remove existing zip '${zipPath}': ${err?.message ?? err}`);
	}

	// Ensure `zip` command is available
	// Prefer checking availability via `which` but handle ENOENT gracefully (some test runners don't have `which`).
	let which;
	try {
		which = childProcess.spawnSync('which', ['zip']);
	} catch (err) {
		// spawnSync may throw ENOENT if `which` isn't available in the environment
		which = { error: err };
	}
	if ((which && which.error && (which.error.code === 'ENOENT' || which.status !== 0)) || (which && typeof which.status === 'number' && which.status !== 0)) {
		throw new Error('`zip` command not found on PATH — please install zip (e.g. `brew install zip`)');
	}

	// Run: zip -r Pixelated.zip . (exclude the zip file itself and .git to avoid embedding repo history)
	// Note: patterns are passed directly to zip; include both simple and recursive patterns to be safe.
	const args = buildZipArgs(zipName);
	let result;
	try {
		result = childProcess.spawnSync('zip', args, { cwd: themeDir, stdio: 'inherit' });
	} catch (err) {
		// Normalize ENOENT into a clearer message for callers/tests
		if (err && err.code === 'ENOENT') {
			throw new Error('`zip` command not found on PATH — please install zip (e.g. `brew install zip`)');
		}
		throw new Error(`Failed to run zip: ${String(err)}`);
	}

	if (result && result.error) {
		// If zip produced the archive file despite reporting an error, accept the result
		if (fs.existsSync(zipPath)) {
			console.warn('zip reported an error but output file exists; continuing');
		} else if (result.error && result.error.code === 'ENOENT') {
			throw new Error('`zip` command not found on PATH — please install zip (e.g. `brew install zip`)');
		} else {
			throw new Error(`Failed to run zip: ${String(result.error)}`);
		}
	}
	if (typeof result?.status === 'number' && result.status !== 0) {
		// If the zip CLI returned non-zero but produced the file, treat as success (warnings)
		if (!fs.existsSync(zipPath)) {
			throw new Error(`zip exited with status ${result.status}`);
		}
	}

	if (!fs.existsSync(zipPath)) {
		throw new Error(`zip command completed but output not found at ${zipPath}`);
	}

	console.log(`Created ${zipPath}`);
	return zipPath;
}

// CLI (ESM-friendly)
import { pathToFileURL } from 'url';
const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (entryUrl && entryUrl === import.meta.url) {
	(async () => {
		try {
			const arg = process.argv[2];
			const zipName = process.argv[3] || 'Pixelated.zip';
			const out = await zipPixelatedTheme(arg, zipName);
			console.log('OK ->', out);
			process.exit(0);
		} catch (err) {
			console.error('ERROR:', err?.message ?? err);
			process.exit(2);
		}
	})();
}
