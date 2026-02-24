/**
 * Deployment Integration Services
 * Server-side utilities for site deployment operations
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { SiteConfig } from '../sites/sites.integration';

const execAsync = promisify(exec); 

export interface DeploymentRequest {
  site: string;
  environments: string[];
  versionType: string;
  commitMessage: string;
}

export interface DeploymentResult {
  prep: string;
  environments: { [key: string]: string };
}

/**
 * Execute deployment script for a site
 */
export async function executeDeployment(
	request: DeploymentRequest,
	siteConfig: SiteConfig,
	isLocalExecution: boolean = false
): Promise<DeploymentResult> {
	// Only allow local execution for security
	if (!isLocalExecution) {
		throw new Error('Deployment execution is only allowed when running locally');
	}

	const { versionType, commitMessage, environments } = request;
	const { localPath, remote } = siteConfig;

	return executeScript(siteConfig.name, versionType, commitMessage, environments, localPath, remote);
}

/**
 * Execute the deployment script
 */
async function executeScript(
	siteName: string,
	versionType: string,
	commitMessage: string,
	environments: string[],
	localPath: string | undefined,
	remote: string | undefined
): Promise<DeploymentResult> {
	const sourceBranch = 'dev'; // Always deploy from dev branch

	// Guard against missing localPath — callers may omit for non-local checks
	if (!localPath) {
		throw new Error('localPath is required for deployment execution');
	}

	// Guard against missing remote — required for git operations
	if (!remote) {
		throw new Error('remote is required for deployment execution');
	}

	try {
		// Get current branch and ensure we're on dev
		const { stdout: currentBranch } = await execAsync('git branch --show-current', { cwd: localPath });
		if (currentBranch.trim() !== sourceBranch) {
			throw new Error(`Must be on ${sourceBranch} branch to deploy. Current branch: ${currentBranch.trim()}`);
		}

		// Pull latest changes
		await execAsync(`git pull ${remote} dev`, { cwd: localPath });

		// Run prep commands
		const prepResult = await runPrepCommands(siteName, versionType, commitMessage, localPath);

		// Deploy to each environment
		const environmentResults: { [key: string]: string } = {};
		for (const env of environments) {
			try {
				const result = await deployToEnvironment(siteName, env, versionType, commitMessage, remote);
				environmentResults[env] = result;
			} catch (error) {
				environmentResults[env] = `Failed: ${(error as Error).message}`;
			}
		}

		return {
			prep: prepResult,
			environments: environmentResults
		};
	} catch (error) {
		throw new Error(`Deployment failed: ${(error as Error).message}`, { cause: error });
	}
}

/**
 * Run preparation commands before deployment
 */
async function runPrepCommands(siteName: string, versionType: string, commitMessage: string, localPath: string | undefined): Promise<string> {
	const results: string[] = [];

	try {
		// Update packages first
		results.push('Updating packages...');
		try {
			const { stdout: outdatedOutput } = await execAsync('npm outdated --json', { timeout: 60000, cwd: localPath });
			const outdated = JSON.parse(outdatedOutput);
			const packagesToUpdate = Object.keys(outdated).map(pkg => `${pkg}@${outdated[pkg].latest}`);

			if (packagesToUpdate.length > 0) {
				for (const pkg of packagesToUpdate.slice(0, 10)) { // Limit to 10 packages to avoid timeouts
					try {
						await execAsync(`npm install --save ${pkg}`, { timeout: 120000, cwd: localPath });
						results.push(`Updated ${pkg}`);
					} catch (error) {
						results.push(`Failed to update ${pkg}: ${(error as Error).message}`);
					}
				}
			} else {
				results.push('All packages are up to date');
			}
		} catch (error) {
			results.push(`Package update check failed: ${(error as Error).message}`);
		}

		// Run linting
		try {
			await execAsync('npm run lint', { timeout: 120000, cwd: localPath });
			results.push('Linting passed');
		} catch (error) {
			results.push(`Linting failed: ${(error as Error).message}`);
		}

		// Run audit fix
		try {
			await execAsync('npm audit fix --force', { timeout: 120000, cwd: localPath });
			results.push('Security audit fixes applied');
		} catch (error) {
			results.push(`Audit fix failed: ${(error as Error).message}`);
		}

		// Update version based on type
		if (versionType === 'patch') {
			await execAsync('npm version patch --no-git-tag-version', { cwd: localPath });
			results.push('Updated patch version');
		} else if (versionType === 'minor') {
			await execAsync('npm version minor --no-git-tag-version', { cwd: localPath });
			results.push('Updated minor version');
		} else if (versionType === 'major') {
			await execAsync('npm version major --no-git-tag-version', { cwd: localPath });
			results.push('Updated major version');
		}

		// Build the project
		await execAsync('npm run build', { timeout: 300000, cwd: localPath });
		results.push('Built project successfully');

		// Commit changes
		await execAsync(`git add . -v`, { timeout: 60000, cwd: localPath });
		const escapedMessage = commitMessage.replace(/'/g, "'\\''");
		await execAsync(`git commit -m "${escapedMessage}"`, { timeout: 60000, cwd: localPath });
		results.push(`Committed changes: ${commitMessage}`);

		// Get the new version
		const { stdout: version } = await execAsync('node -p "require(\'./package.json\').version"', { cwd: localPath });
		results.push(`New version: ${version.trim()}`);

		return results.join('\n');
	} catch (error) {
		throw new Error(`Prep failed: ${(error as Error).message}`, { cause: error });
	}
}

/**
 * Deploy to a specific environment
 */
async function deployToEnvironment(
	siteName: string,
	environment: string,
	versionType: string,
	commitMessage: string,
	remote: string
): Promise<string> {
	const results: string[] = [];
	const sourceBranch = 'dev';

	try {
		// Determine target branch
		const branch = environment === 'prod' ? 'main' : 'dev';
		const pushCmd = `git push ${environment === 'dev' ? '-u ' : ''}${remote} ${sourceBranch}:${branch} --tags`;

		results.push(`Pushing to ${environment} (${branch})...`);

		const { stdout, stderr } = await execAsync(pushCmd, { timeout: 300000 }); // 5 minute timeout
		if (stdout) results.push(stdout);
		if (stderr) results.push(stderr);
		results.push(`✓ Successfully deployed ${siteName} to ${environment}`);

		return results.join('\n');
	} catch (error) {
		const errorMsg = `Push to ${environment} failed: ${(error as Error).message}`;

		// Handle expected git errors gracefully
		if ((error as Error).message.includes('non-fast-forward')) {
			return `${errorMsg}\nNon-fast-forward error, you may need to force push or resolve conflicts manually.`;
		}
		if ((error as Error).message.includes('timeout') || (error as Error).message.includes('Command failed')) {
			return `${errorMsg}\nGit push failed, you may need to retry manually.`;
		}
		if ((error as Error).message.includes('Repository not found') || (error as Error).message.includes('does not exist')) {
			return `${errorMsg}\nRepository not found or access denied. Check your git remote configuration.`;
		}

		throw new Error(errorMsg, { cause: error });
	}
}