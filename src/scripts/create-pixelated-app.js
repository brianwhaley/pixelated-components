#!/usr/bin/env node
/**
 * create-pixelated-app.js
 *
 * Simple CLI to scaffold a new site from `pixelated-template`.
 * - copies the template to a destination folder
 * - clears out the .git history in the copy
 * - optionally initializes a fresh git repo and adds a remote
 *
 * TODOs (placeholders for later work):
 *  - Run `npm ci` / `npm run lint` / `npm test` and optionally build
 * 

2) High-level workflow the script should perform 🔁
Validate inputs (target path, site slug, repo name).
Copy pixelated-template → ./<new-site-name> (preserve file modes).
Replace placeholders in files (template tokens like {{SITE_NAME}}, {{PACKAGE_NAME}}, {{DOMAIN}}).
Patch template-specific files (see list below).
Remove template git metadata (rm -rf .git) and reset any CI state.
Create/patch pixelated.config.json with site-specific values (ask for secrets). Optionally run npm run config:encrypt to write .enc.
Run validation: npm ci (optional), npm run lint, npm test, npm run build.
Init git, make initial commit, optionally create remote GitHub repo (if token available) and push.
Print summary and next steps (e.g., configure hosting / DNS / deploy keys).

3) Files / fields to update in the template 🔧
package.json — name, description, repository, author, homepage, version, scripts (if you want to change default scripts).
README.md — project title and quick-start instructions.
next.config.ts / amplify.yml — site-specific env entries and build steps.
pixelated.config.json — update global/aws/contentful/google fields for this site (prefer *.enc workflow).
src/app/(pages)/… and any site metadata files (site slug, default pagesDir).
public/ assets and site-images.json — update site logos/URLs.
certificates/ if using TLS — template may include placeholder paths.
FEATURE_CHECKLIST.md — optionally update default checklist for new site.
.gitignore — ensure pixelated.config.json is ignored if plaintext during setup.

6) Helpful CLI implementation details (tools & libs) 🛠️
Provide a --dry-run and --preview mode so users can verify changes before creating repo or pushing.

7) Validation & post-creation steps ✅
npm run lint && npm test && npm run build — fail fast and show errors for the new site.
Optional: run npm run config:decrypt locally (with provided key) to confirm decryption works in your deploy workflow (BUT DO NOT store the key in the repo).

*/

import fs from 'fs/promises';
import path from 'path';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { fileURLToPath } from 'url';
import { loadManifest, findTemplateForSlug, pruneTemplateDirs, printAvailableTemplates } from './create-pixelated-app-template-mapper.js';
import { AmplifyClient, CreateAppCommand, CreateBranchCommand, UpdateAppCommand, UpdateBranchCommand } from '@aws-sdk/client-amplify';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stepNumber = 1;

const exec = promisify(execCb);
// Exportable exec wrapper so tests can stub it.
export let _exec = exec;

async function exists(p) {
	try {
		await fs.access(p);
		return true;
	} catch (e) {
		return false;
	}
}

async function countFiles(src) {
	let total = 0;
	async function walk(p) {
		const stat = await fs.lstat(p);
		if (stat.isDirectory()) {
			const items = await fs.readdir(p, { withFileTypes: true });
			for (const item of items) {
				await walk(path.join(p, item.name));
			}
		} else {
			total++;
		}
	}
	await walk(src);
	return total;
}

function startSpinner(messageFn) {
	if (!process.stdout.isTTY) return { stop: () => {} };
	const frames = ['-', '\\', '|', '/'];
	let i = 0;
	const interval = setInterval(() => {
		const msg = messageFn ? messageFn() : '';
		process.stdout.write(`\r${frames[i % frames.length]} ${msg}`);
		i++;
	}, 100);
	return {
		stop: () => {
			clearInterval(interval);
			process.stdout.write('\r');
			process.stdout.write('\n');
		}
	};
}

async function copyRecursive(src, dest, onFileCopied) {
	// Recursive copy that reports per-file progress via onFileCopied.
	await fs.mkdir(dest, { recursive: true });
	const items = await fs.readdir(src, { withFileTypes: true });
	for (const item of items) {
		const s = path.join(src, item.name);
		const d = path.join(dest, item.name);
		const stat = await fs.lstat(s);
		if (stat.isDirectory()) {
			await copyRecursive(s, d, onFileCopied);
		} else if (stat.isSymbolicLink()) {
			try {
				const link = await fs.readlink(s);
				await fs.symlink(link, d);
				if (onFileCopied) onFileCopied(d);
			} catch (e) {
				// ignore symlink failures
				if (onFileCopied) onFileCopied(d);
			}
		} else {
			// Regular file
			await fs.copyFile(s, d);
			if (onFileCopied) onFileCopied(d);
		}
	}
}

// Replace placeholders like {{SITE_NAME}}, {{SITE_URL}}, {{EMAIL_ADDRESS}} across the created site
// This supports both literal tags and simple regex patterns (for cases where the bundler
// transformed template tokens into JS expressions like {SITE_NAME}). Each replacement
// entry may have { tag, value, isRegex } where isRegex indicates `tag` is a regex string.
async function replacePlaceholders(rootDir, replacements) {
	const ignoreDirs = new Set(['.git', 'node_modules', 'dist', 'coverage']);
	let filesChanged = 0;
	async function walk(p) {
		const items = await fs.readdir(p, { withFileTypes: true });
		for (const item of items) {
			const entry = path.join(p, item.name);
			if (item.isDirectory()) {
				// Allow running against .next when explicitly targeting it, but skip when walking a template
				if (item.name === '.next' && rootDir !== '.next') continue;
				if (ignoreDirs.has(item.name)) continue;
				await walk(entry);
			} else {
				try {
					let content = await fs.readFile(entry, 'utf8');
					let newContent = content;
					for (const { tag, value, isRegex } of replacements) {
						let re;
						if (isRegex) {
							re = new RegExp(tag, 'g');
						} else {
							re = new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
						}
						newContent = newContent.replace(re, value);
					}
					if (newContent !== content) {
						await fs.writeFile(entry, newContent, 'utf8');
						filesChanged++;
					}
				} catch (e) {
					// Could be binary or unreadable - skip
				}
			}
		}
	}
	await walk(rootDir);
	return filesChanged;
}

// Token map used by the CLI: literal marker (e.g., "__SITE_NAME__") -> replacement value (populate during interactive prompts)
export const TOKEN_MAP = { 
	"__SITE_NAME__": '', 
	"__SITE_URL__": '', 
	"__EMAIL_ADDRESS__": '' 
};

// Helper: add a route entry to the routes.json structure for a newly created page
export function addRouteEntry(routesJson, pageSlug, displayName, rootDisplayName) {
	if (!routesJson || !Array.isArray(routesJson.routes)) return false;
	const candidatePath = `/${pageSlug}`;
	if (routesJson.routes.some(r => r.path === candidatePath)) return false;
	const name = displayName.split(/\s+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
	routesJson.routes.push({
		"name": name,
		"path": candidatePath,
		"title": `${rootDisplayName} - ${displayName}`,
		"description": "",
		"keywords": ""
	});
	return true;
}

// Copy a template page into the target directory, resolving to the expected location inside the workspace template.
// Returns an object { used: 'template'|'fallback', src: <sourcePath> }
export async function copyTemplateForPage(templatePathArg, templateSrc, templatePagesHome, targetDir) {
	const folderName = path.basename(templateSrc);
	const srcTemplatePath = path.join(templatePathArg, 'src', 'app', '(pages)', folderName);
	if (await exists(srcTemplatePath)) {
		await copyRecursive(srcTemplatePath, targetDir);
		return { used: 'template', src: srcTemplatePath };
	} else {
		await copyRecursive(templatePagesHome, targetDir);
		return { used: 'fallback', src: templatePagesHome };
	}
}


export async function createAndPushRemote(destPath, siteName, defaultOwner) {
	// Initialize a local git repo and make the initial commit
	await _exec('git init -b main', { cwd: destPath });
	await _exec('git add .', { cwd: destPath });
	await _exec('git commit -m "chore: initial commit from pixelated-template"', { cwd: destPath });
	console.log('✅ Git initialized and initial commit created.');

	// If an encrypted config exists, attempt a non-fatal decrypt in the new site to ensure the token can be read
	const encCandidates = [
		path.join(destPath, 'src', 'app', 'config', 'pixelated.config.json.enc'),
		path.join(destPath, 'src', 'config', 'pixelated.config.json.enc'),
		path.join(destPath, 'src', 'pixelated.config.json.enc'),
		path.join(destPath, 'pixelated.config.json.enc'),
		path.join(destPath, 'dist', 'config', 'pixelated.config.json.enc')
	];
	for (const p of encCandidates) {
		if (await exists(p)) {
			console.log(`Found encrypted config at ${p}. Attempting to run 'npm run config:decrypt' in the new site (non-fatal)`);
			try {
				await _exec('npm run config:decrypt', { cwd: destPath, timeout: 60_000 });
				console.log('Attempted config:decrypt (non-fatal)');
			} catch (err) {
				console.warn('config:decrypt failed or PIXELATED_CONFIG_KEY missing (non-fatal):', err?.message || err);
			}
			break;
		}
	}

	// Create a small temporary script inside the new site to reliably import the project's provider and print JSON to stdout
	const tmpDir = path.join(destPath, '.px-scripts');
	const tmpFile = path.join(tmpDir, 'get_github_token.ts');
	await fs.mkdir(tmpDir, { recursive: true });
	const tmpContent = `import('./src/components/config/config').then(m => {
		const cfg = m.getFullPixelatedConfig();
		// Only print the github object (or null) as JSON to stdout
		console.log(JSON.stringify(cfg?.github || null));
	}).catch(e => {
		console.error('ERR_IMPORT', e?.message || e);
		process.exit(2);
	});`;
	await fs.writeFile(tmpFile, tmpContent, 'utf8');

	let execOut;
	try {
		execOut = await _exec(`npx tsx ${tmpFile}`, { cwd: destPath, timeout: 60_000 });
	} catch (e) {
		// Provide a helpful error message and ensure cleanup happens below
		console.error('❌ Failed to run config provider to obtain GitHub token. Ensure PIXELATED_CONFIG_KEY is available (e.g., in .env.local) and the site includes an encrypted pixelated.config.json.enc');
		throw e;
	} finally {
		// Always clean up the temporary script directory
		try { await fs.rm(tmpDir, { recursive: true, force: true }); } catch (_) { /* ignore cleanup errors */ }
	}

	const outStr = (execOut && execOut.stdout) ? String(execOut.stdout).trim() : '';
	if (!outStr) {
		console.error('❌ No output from config provider; cannot locate github token');
		throw new Error('Missing provider output');
	}

	let githubInfo;
	try { githubInfo = JSON.parse(outStr); } catch (e) { console.error('❌ Invalid JSON from config provider:', outStr); throw e; }
	const token = githubInfo?.token;
	const cfgOwner = githubInfo?.defaultOwner;
	if (!token) {
		console.error('❌ github.token not found in decrypted config; cannot create remote repo.');
		throw new Error('Missing github.token');
	}

	const repoName = siteName;
	const ownerForMessage = cfgOwner || defaultOwner;
	console.log(`Creating GitHub repo: ${ownerForMessage}/${repoName} ...`);

	let resp;
	try {
		resp = await fetch('https://api.github.com/user/repos', {
			method: 'POST',
			headers: {
				'Authorization': `token ${token}`,
				'Content-Type': 'application/json',
				'User-Agent': 'create-pixelated-app'
			},
			body: JSON.stringify({ name: repoName, private: false })
		});
	} catch (e) {
		console.error('❌ Failed to call GitHub API', e?.message || e);
		throw e;
	}

	const body = await (async () => { try { return await resp.json(); } catch (e) { return null; } })();
	if (!resp.ok) {
		console.error(`❌ Failed to create GitHub repo: ${resp.status} ${resp.statusText} ${body?.message || ''}`);
		throw new Error('GitHub repo creation failed');
	}
	const cloneUrl = body.clone_url;
	if (!cloneUrl) {
		console.error('❌ GitHub returned unexpected response (no clone_url)');
		throw new Error('Invalid GitHub response');
	}

	// Add remote and push using repo-name as remote
	const remoteName = repoName;
	await _exec(`git remote add ${remoteName} ${cloneUrl}`, { cwd: destPath });
	await _exec('git branch --show-current || git branch -M main', { cwd: destPath });
	try {
		// If we have a github token available in the decrypted config, use it for an authenticated push (avoids relying on local credential helper)
		if (token) {
			await _exec(`git -c credential.helper= -c http.extraheader="Authorization: token ${token}" push -u ${remoteName} main`, { cwd: destPath });
			await _exec('git branch -f dev main', { cwd: destPath });
			await _exec(`git -c credential.helper= -c http.extraheader="Authorization: token ${token}" push -u ${remoteName} dev`, { cwd: destPath });
		} else {
			await _exec(`git push -u ${remoteName} main`, { cwd: destPath });
			await _exec('git branch -f dev main', { cwd: destPath });
			await _exec(`git push -u ${remoteName} dev`, { cwd: destPath });
		}
		console.log(`✅ Remote '${remoteName}' created and pushed (main, dev): ${cloneUrl}`);
		// Return useful values for downstream steps (e.g., Amplify app creation)
		return { cloneUrl, remoteName, token };
	} catch (e) {
		console.warn('⚠️  Failed to push branches automatically. The repo was created on GitHub, but you may need to push manually or configure your git credentials. Error:', e?.message || e);
		// Still return partial info so caller can decide next steps
		return { cloneUrl, remoteName, token };
	}
}

// Create an AWS Amplify app and connect repository branches (best-effort via AWS CLI).
// This uses the local AWS CLI configuration (credentials/profile) and optionally a GitHub
// personal access token to allow Amplify to connect to the repo automatically.
export async function createAmplifyApp(rl, siteName, cloneUrl, sitePath) {
	// Use AWS region from components config if available; skip interactive region prompt
	const componentsCfgPath = path.resolve(__dirname, '..', 'config', 'pixelated.config.json');
	let regionToUse = 'us-east-2';
	let creds = null;
	try {
		if (await exists(componentsCfgPath)) {
			const cfgText = await fs.readFile(componentsCfgPath, 'utf8');
			const cfg = JSON.parse(cfgText);
			if (cfg?.aws?.region) {
				regionToUse = cfg.aws.region;
				console.log(`✅ Using AWS region from components config: ${regionToUse}`);
			}
			if (cfg?.aws?.access_key_id && cfg?.aws?.secret_access_key) {
				creds = { accessKeyId: cfg.aws.access_key_id, secretAccessKey: cfg.aws.secret_access_key };
				console.log('✅ Found AWS credentials in components config; they will be used for Amplify SDK operations.');
			}
		}
	} catch (e) {
		// ignore and continue without config values
	}

	// Prompt only for GitHub PAT (do not prompt for region)
	const githubToken = (await rl.question('GitHub personal access token (PAT) to connect repo [leave blank to skip]: ')) || '';

	console.log('Creating Amplify app (this may take a few seconds)...');
	// Use AWS SDK Amplify client
	const client = new AmplifyClient({ region: regionToUse, credentials: creds || undefined });
	let createResp;
	try {
		createResp = await client.send(new CreateAppCommand({ name: siteName, platform: 'WEB_DYNAMIC', repository: cloneUrl || undefined, accessToken: githubToken || undefined }));
	} catch (e) {
		throw new Error('Failed to create Amplify app via SDK: ' + (e?.message || e), { cause: e });
	}

	const appId = createResp?.app?.appId || createResp?.appId || createResp?.id;
	if (!appId) {
		console.log('Amplify create app response:', createResp);
		throw new Error('Unable to determine Amplify appId from SDK response');
	}
	console.log(`✅ Created Amplify app: ${appId}`);
	console.log(`🔗 Open in console: https://${regionToUse}.console.aws.amazon.com/amplify/home?region=${regionToUse}#/d/${appId}`);

	// Optionally: read site config (if sitePath provided) and set environment variables for the app & branches
	let envVars = {};
	if (sitePath) {
		// Primary: look for a local .env.local and prefer variables defined there
		const envLocalPath = path.join(sitePath, '.env.local');
		if (await exists(envLocalPath)) {
			try {
				const envText = await fs.readFile(envLocalPath, 'utf8');
				for (const line of envText.split(/\r?\n/)) {
					const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
					if (!m) continue;
					const k = m[1];
					let v = m[2] || '';
					// remove optional quotes
					v = v.replace(/^"|"$/g, '');
					if (k === 'PIXELATED_CONFIG_KEY' || k.startsWith('PIXELATED_CONFIG')) {
						envVars[k] = v;
					}
				}
				console.log(`✅ Loaded environment values from ${envLocalPath} and will set matching Amplify environment variables.`);
			} catch (e) {
				console.warn('⚠️ Failed to read .env.local for env var population:', e?.message || e);
			}
		}

		// Secondary: if no PIXELATED_CONFIG_* vars were found in .env.local, look for pixelated.config.json
		if (!envVars.PIXELATED_CONFIG_JSON && !envVars.PIXELATED_CONFIG_B64) {
			const candidates = [
				path.join(sitePath, 'src', 'app', 'config', 'pixelated.config.json'),
				path.join(sitePath, 'src', 'config', 'pixelated.config.json'),
				path.join(sitePath, 'src', 'pixelated.config.json'),
				path.join(sitePath, 'pixelated.config.json')
			];
			for (const c of candidates) {
				if (await exists(c)) {
					try {
						const raw = await fs.readFile(c, 'utf8');
						envVars.PIXELATED_CONFIG_JSON = raw;
						envVars.PIXELATED_CONFIG_B64 = Buffer.from(raw, 'utf8').toString('base64');
						console.log(`✅ Loaded site pixelated.config.json from ${c} and will set PIXELATED_CONFIG_* environment variables in Amplify.`);
						break;
					} catch (e) {
						console.warn('⚠️ Failed to read site config for env var population:', e?.message || e);
					}
				}
			}
		}
	}

	// Attempt to resolve the ARN for the 'amplify-role' role (best-effort)
	let iamRoleArn = null;
	try {
		const { IAMClient, GetRoleCommand } = await import('@aws-sdk/client-iam');
		const iam = new IAMClient({ region: regionToUse, credentials: creds || undefined });
		try {
			const roleResp = await iam.send(new GetRoleCommand({ RoleName: 'amplify-role' }));
			iamRoleArn = roleResp?.Role?.Arn;
			if (iamRoleArn) console.log(`✅ Found amplify-role ARN: ${iamRoleArn}`);
		} catch (e) {
			// ignore; role may not exist or insufficient perms
			console.warn('⚠️ Could not resolve amplify-role ARN; skipping automatic service-role assignment.');
		}
	} catch (e) {
		// ignore if IAM client not available
	}

	// If we have envVars or iamRoleArn, update the app and branches accordingly
	if (Object.keys(envVars).length || iamRoleArn) {
		try {
			const updateParams = {};
			if (Object.keys(envVars).length) updateParams.environmentVariables = envVars;
			if (iamRoleArn) updateParams.iamServiceRoleArn = iamRoleArn;
			await client.send(new UpdateAppCommand({ appId, ...updateParams }));
			console.log('✅ Amplify app updated with environment variables and IAM service role (if available).');

			for (const branch of ['dev','main']) {
				try {
					await client.send(new UpdateBranchCommand({ appId, branchName: branch, environmentVariables: envVars }));
					console.log(`✅ Updated branch '${branch}' with environment variables.`);
				} catch (e) {
					console.warn(`⚠️ Failed to update branch ${branch} env vars:`, e?.message || e);
				}
			}
		} catch (e) {
			console.warn('⚠️ Failed to update Amplify app/branches with env vars or service role:', e?.message || e);
		}
	}

	console.log('ℹ️  Amplify app creation attempt finished. Verify the app in the AWS Console to ensure webhooks and branch connections are correct.');
}

async function main() {
	const rl = readline.createInterface({ input, output });
	try {
		console.log('\n📦 Pixelated site creator — scaffold a new site from pixelated-template\n');
		console.log('================================================================================\n');


		// Prompt for basic site info
		console.log(`\nStep ${stepNumber++}: Site Information`);
		console.log('================================================================================\n');
		const defaultName = 'my-site';
		const siteName = (await rl.question(`Root directory name (kebab-case) [${defaultName}]: `)) || defaultName;
		// Display name used in route titles: convert kebab to Title Case
		const rootDisplayName = siteName.split(/[-_]+/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');


		// Additional site metadata for placeholder substitution
		console.log(`\nStep ${stepNumber++}: Site Metadata`);
		console.log('================================================================================\n');
		const siteUrl = (await rl.question('Site URL (e.g. https://example.com) [leave blank to skip]: ')).trim();
		const emailAddress = (await rl.question('Contact email address [leave blank to skip]: ')).trim();


		// Create a copy of pixelated-template inside the current workspace
		console.log(`\nStep ${stepNumber++}: Template Copy`);
		console.log('================================================================================\n');
		const workspaceRoot = path.resolve(__dirname, '..', '..', '..');
		const templatePath = path.resolve(workspaceRoot, 'pixelated-template');
		if (!(await exists(templatePath))) {
			console.error(`\n❌ Template not found at ${templatePath}. Please ensure this tool is run inside the workspace that contains pixelated-template.`);
			process.exit(1);
		}

		// Load manifest (if present)
		const manifest = await loadManifest(__dirname);
		// Note: available templates will be printed later just before prompting for pages
		
		// Destination is implicitly the top-level Git folder + site name to avoid prompting for it
		const destPath = path.resolve(workspaceRoot, siteName);
		console.log(`\nThe new site will be created at: ${destPath}`);
		const proceed = (await rl.question('Proceed? (Y/n): ')) || 'y';
		if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
			console.log('Aborting.');
			process.exit(0);
		} 

		if (await exists(destPath)) {
			const shouldOverwrite = (await rl.question(`Destination ${destPath} already exists. Overwrite? (y/N): `)).toLowerCase();
			if (shouldOverwrite !== 'y' && shouldOverwrite !== 'yes') {
				console.log('Aborting. Choose another destination.');
				process.exit(0);
			}
			console.log(`Removing existing directory ${destPath}...`);
			await fs.rm(destPath, { recursive: true, force: true });
		}

		console.log(`\nCopying template from ${templatePath} -> ${destPath} ...`);
		const totalFiles = await countFiles(templatePath);
		let filesCopied = 0;
		let lastFile = '';
		const spinner = startSpinner(() => `Copying... ${filesCopied}/${totalFiles} ${lastFile ? '- ' + path.basename(lastFile) : ''}`);
		await copyRecursive(templatePath, destPath, (f) => { if (f) { filesCopied++; lastFile = f; } });
		// If fs.cp was used, per-file callbacks won't have been called; ensure we report the full total
		if (filesCopied < totalFiles) filesCopied = totalFiles;
		spinner.stop();
		console.log(`✅ Template files copied (${filesCopied} files).`);

		// Remove git history
		const gitDir = path.join(destPath, '.git');
		if (await exists(gitDir)) {
			console.log('Removing .git directory from new site...');
			await fs.rm(gitDir, { recursive: true, force: true });
		}


		// Pages prompt: show available templates and ask which pages to create (comma-separated)
		console.log(`\nStep ${stepNumber++}: Page Creation`);
		console.log('================================================================================\n');
		if (manifest && Array.isArray(manifest.templates) && manifest.templates.length) {
			printAvailableTemplates(manifest);
		}
		const pagesInput = (await rl.question('Pages to create (comma-separated, e.g. about,contact) [leave blank to skip]: ')).trim();
		let pagesToCreate = [];
		let existingPages = ['humans.txt', 'styleguide'];
		if (pagesInput) {
			const raw = pagesInput.split(',').map(s => s.trim()).filter(Boolean);
			// sanitize and normalize
			const seen = new Set();
			for (const r of raw) {
				const lower = r.toLowerCase();
				if (lower === 'home' || lower === 'index') {
					existingPages.push('home');
					continue;
				}
				let slug = r.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
				if (!slug) continue;
				if (seen.has(slug)) continue;
				seen.add(slug);
				const matchedTemplate = findTemplateForSlug(manifest, slug);
				pagesToCreate.push({ slug, displayName: r.trim(), template: matchedTemplate });
			}

			console.log('\nSummary of pages:');
			if (existingPages.length) console.log(` - Existing (skipped): ${existingPages.join(', ')}`);
			if (pagesToCreate.length) {
				console.log(' - To be created:');
				for (const p of pagesToCreate) {
					if (p.template) {
						console.log(`   - ${p.slug} (mapped to template: ${p.template.name})`);
					} else {
						console.log(`   - ${p.slug} (no template match)`);
					}
				}
			}
			const proceedPages = (await rl.question('Proceed to create these pages? (Y/n): ')) || 'y';
			if (proceedPages.toLowerCase() === 'y' || proceedPages.toLowerCase() === 'yes') {
				// perform creation
				const templatePagesHome = path.join(templatePath, 'src', 'app', '(pages)', '(home)');
				const siteRoutesFile = path.join(destPath, 'src', 'app', 'data', 'routes.json');
				let routesJson = null;
				try {
					routesJson = JSON.parse(await fs.readFile(siteRoutesFile, 'utf8'));
					// Ensure siteInfo exists and set its name to the root display name
					routesJson.siteInfo = routesJson.siteInfo || {};
					routesJson.siteInfo.name = rootDisplayName;
				} catch (e) {
					console.warn('⚠️  Could not read routes.json, routes will not be updated.');
				}

				for (const p of pagesToCreate) {
					const targetDir = path.join(destPath, 'src', 'app', '(pages)', p.slug);
					console.log(`Creating page ${p.slug} -> ${targetDir}`);
					let copyResult = null;
					if (p.template && p.template.src) {
						copyResult = await copyTemplateForPage(templatePath, p.template.src, templatePagesHome, targetDir);
						if (copyResult.used === 'template') {
							console.log(` - Copied template ${p.template.name} from ${copyResult.src}`);
						} else {
							console.warn(`⚠️  Template source ${path.join(templatePath, 'src', 'app', '(pages)', path.basename(p.template.src))} not found; using default page template instead.`);
						}
					} else {
						await copyRecursive(templatePagesHome, targetDir);
					}
					// rename component in page.tsx
					const pageFile = path.join(targetDir, 'page.tsx');
					try {
						let content = await fs.readFile(pageFile, 'utf8');
						const compName = p.displayName.replace(/[^a-zA-Z0-9]+/g,' ').split(/\s+/).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('') + 'Page';
						content = content.replace(/export default function\s+\w+\s*\(/, `export default function ${compName}(`);
						await fs.writeFile(pageFile, content, 'utf8');
						console.log(` - Updated component name to ${compName} in ${path.relative(destPath, pageFile)}`);
					} catch (e) {
						console.warn(`⚠️  Failed to update component name for ${p.slug}:`, e?.message || e);
					}

					// update routes.json
					if (routesJson && Array.isArray(routesJson.routes)) {
						// Skip if route path already exists
						const candidatePath = `/${p.slug}`;
						if (!routesJson.routes.some(r => r.path === candidatePath)) {
							routesJson.routes.push({
								"name": p.displayName.split(/\s+/).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' '),
								"path": candidatePath,
								"title": `${rootDisplayName} - ${p.displayName}`,
								"description": "",
								"keywords": ""
							});
						} else {
							console.log(` - Route ${candidatePath} already exists; skipping route add.`);
						}
					}
				}

				if (manifest) {
					const removed = await pruneTemplateDirs(manifest, destPath, pagesToCreate.map(p=>p.slug));
					for (const r of removed) {
						console.log(`Removed unused template page ${r} from new site...`);
					}
				}

				if (routesJson) {
					try {
						await fs.writeFile(siteRoutesFile, JSON.stringify(routesJson, null, '\t'), 'utf8');
						console.log('✅ routes.json updated.');
					} catch (e) {
						console.warn('⚠️  Failed to write routes.json:', e?.message || e);
					}
				}
			} else {
				console.log('Skipping page creation.');
			}
		}


		// Automatically replace double-underscore template placeholders (e.g., __SITE_NAME__) with provided values
		console.log(`\nStep ${stepNumber++}: Placeholder Tokens Replacement`);
		console.log('================================================================================\n');
		const replacements = {};
		if (rootDisplayName) replacements.SITE_NAME = rootDisplayName;
		if (siteUrl) replacements.SITE_URL = siteUrl;
		if (emailAddress) replacements.EMAIL_ADDRESS = emailAddress;
		if (Object.keys(replacements).length) {
			const replArray = [];
			for (const [t, valRaw] of Object.entries(replacements)) {
				const val = String(valRaw);
				// populate TOKEN_MAP so other code can inspect token->value mapping (keyed by literal marker)
				const marker = `__${t}__`;
				TOKEN_MAP[marker] = val;
				// First, replace expression occurrences like {__TOKEN__} with a quoted string expression to avoid bare identifiers
				replArray.push({ tag: `\\{${marker}\\}`, value: `{${JSON.stringify(val)}}`, isRegex: true });
				// Then, replace literal marker occurrences (e.g., __TOKEN__) with the plain value
				replArray.push({ tag: marker, value: val });
			}
			try {
				const changed = await replacePlaceholders(destPath, replArray);
				console.log(`✅ Replaced template placeholders in ${changed} files under ${destPath}`);
			} catch (e) {
				console.warn('⚠️ Failed to replace placeholders in site copy:', e?.message || e);
			}
		}



		// Prompt about creating a new GitHub repository. Default owner is read from components config `github.defaultOwner` (fallback: 'brianwhaley')
		console.log(`\nStep ${stepNumber++}: GitHub Repository Creation`);
		console.log('================================================================================\n');
		const componentsCfgPath = path.resolve(__dirname, '..', 'config', 'pixelated.config.json');
		let defaultOwner = 'brianwhaley';
		try {
			if (await exists(componentsCfgPath)) {
				const compCfgText = await fs.readFile(componentsCfgPath, 'utf8');
				const compCfg = JSON.parse(compCfgText);
				if (compCfg?.github?.defaultOwner) defaultOwner = compCfg.github.defaultOwner;
			}
		} catch (e) {
			// ignore and use fallback
		}
		const createRemoteAnswer = (await rl.question(`Create a new GitHub repository in '${defaultOwner}' and push the initial commit? (Y/n): `)) || 'y';
		let remoteInfo = null;
		if (createRemoteAnswer.toLowerCase() === 'y' || createRemoteAnswer.toLowerCase() === 'yes') {
			try {
				remoteInfo = await createAndPushRemote(destPath, siteName, defaultOwner);
			} catch (e) {
				console.warn('⚠️  Repo creation or git push failed. Your local repository is still available at:', destPath);
				console.warn(e?.stderr || e?.message || e);
			}
		}
		// Optionally create an AWS Amplify app and connect branches (main, dev)
		console.log(`\nStep ${stepNumber++}: AWS Amplify App Creation`);
		console.log('================================================================================\n');	// Inform user what region will be used (config-backed)
		try {
			const cfgPath = path.resolve(__dirname, '..', 'config', 'pixelated.config.json');
			if (await exists(cfgPath)) {
				const cfgText = await fs.readFile(cfgPath, 'utf8');
				const cfg = JSON.parse(cfgText);
				if (cfg?.aws?.region) {
					console.log(`ℹ️  Note: Amplify will use AWS region from config: ${cfg.aws.region}`);
				}
			}
		} catch (e) {
		// ignore errors reading config; nothing to do
		}		const createAmplifyAnswer = (await rl.question(`Create an AWS Amplify app for this repository and connect 'main' and 'dev' branches? (y/N): `)) || 'n';
		if (createAmplifyAnswer.toLowerCase() === 'y' || createAmplifyAnswer.toLowerCase() === 'yes') {
			try {
				await createAmplifyApp(rl, siteName, remoteInfo?.cloneUrl);
			} catch (e) {
				console.warn('⚠️  Amplify app creation failed or was incomplete. You can create an app manually via the AWS Console or AWS CLI.');
				console.warn(e?.stderr || e?.message || e);
			}
		}

		console.log('================================================================================\n');
		console.log('🎉 Done.');
		console.log('================================================================================\n');
		console.log('Summary:');
		console.log(` - Site copied to: ${destPath}`);
		console.log('\nNote: A git remote was not set by this script. You can add one later with `git remote add <repo-name> <url>` (use the repository name as the remote) if desired.');
		console.log('\nNext recommended steps (manual or to be automated in future):');
		console.log(' - Update pixelated.config.json for this site and encrypt it with your config tool');
		console.log(' - Run `npm run lint`, `npm test`, and `npm run build` inside the new site and fix any issues');
		console.log(' - Create GitHub repo (if not already created), push main branch, and set up CI/deploy secrets');
	} catch (err) {
		console.error('Unexpected error:', err);
		process.exit(1);
	} finally {
		rl.close();
	}
}

if (typeof process !== 'undefined' && new URL(import.meta.url).pathname === process.argv[1]) {
	// CLI entry point: run the interactive main flow
	main();
}

