import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import type { Vulnerability } from './site-health-types';

const execAsync = promisify(exec);

export interface SecurityScanResult {
  status: 'success' | 'error';
  data?: {
    status: string;
    message?: string;
    vulnerabilities: Vulnerability[];
    summary: {
      info: number;
      low: number;
      moderate: number;
      high: number;
      critical: number;
      total: number;
    };
    dependencies: number;
    totalDependencies: number;
  };
  error?: string;
}

interface NpmAuditMetadata {
  vulnerabilities: {
    info: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  dependencies: {
    prod: number;
    dev: number;
    optional: number;
    peer: number;
    peerOptional: number;
    total: number;
  };
  totalDependencies: number;
}

interface NpmAuditResult {
  auditReportVersion: number;
  vulnerabilities: Record<string, {
    name: string;
    severity: string;
    via: string | (string | { title?: string; url?: string })[];
    effects?: string[];
    range: string;
    nodes: string[];
    fixAvailable?: boolean;
    title?: string;
    url?: string;
  }>;
  metadata: NpmAuditMetadata;
}

export async function analyzeSecurityHealth(localPath: string, siteName?: string, repoName?: string): Promise<SecurityScanResult> {
	try {
		// Helper: try to resolve a usable existing path for a site
		function findExistingLocalPath(candidatePath?: string, siteName?: string, repoName?: string): string | null {
			// direct candidate
			if (candidatePath && fs.existsSync(candidatePath)) return candidatePath;

			// check obvious workspace parent (one level up from current package)
			const workspaceParent = path.resolve(process.cwd(), '..');
			const candidates: string[] = [];
			if (siteName) candidates.push(path.join(workspaceParent, siteName));
			if (repoName) candidates.push(path.join(workspaceParent, repoName));

			// also check common external volume used on this machine
			const externalBase = path.join('/Volumes', 'btw_x10_pro', 'Git');
			if (siteName) candidates.push(path.join(externalBase, siteName));
			if (repoName) candidates.push(path.join(externalBase, repoName));

			for (const c of candidates) {
				if (fs.existsSync(c)) {
					console.info(`Security scan: using fallback path for site '${siteName}': ${c}`);
					return c;
				}
			}

			return null;
		}

		const resolvedPath = findExistingLocalPath(localPath, siteName, repoName) || null;

		// Check if the resolved path exists and has package.json
		if (!resolvedPath) {
			return {
				status: 'error',
				error: 'Site directory not found'
			};
		}

		const packageJsonPath = path.join(resolvedPath, 'package.json');
		if (!fs.existsSync(packageJsonPath)) {
			return {
				status: 'success',
				data: {
					status: 'No Dependencies',
					message: 'No package.json found',
					vulnerabilities: [],
					summary: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 },
					dependencies: 0,
					totalDependencies: 0
				}
			};
		}

		// Run npm audit
		const auditResult = await runNpmAudit(localPath);

		// Process vulnerabilities
		const vulnerabilities: Vulnerability[] = [];
		let totalVulns = 0;

		if (auditResult.vulnerabilities) {
			for (const [pkgName, vulnData] of Object.entries(auditResult.vulnerabilities)) {
				const vuln = vulnData as NpmAuditResult['vulnerabilities'][string];
				vulnerabilities.push({
					name: pkgName,
					severity: vuln.severity as Vulnerability['severity'],
					title: Array.isArray(vuln.via) ? (typeof vuln.via[0] === 'string' ? vuln.via[0] : vuln.via[0]?.title || 'Unknown vulnerability') : vuln.title || 'Unknown vulnerability',
					url: vuln.url,
					range: vuln.range,
					fixAvailable: vuln.fixAvailable || false
				});
				totalVulns++;
			}
		}

		// Calculate overall status
		const metadata = auditResult.metadata?.vulnerabilities || { info: 0, low: 0, moderate: 0, high: 0, critical: 0 };
		const hasCritical = metadata.critical > 0;
		const hasHigh = metadata.high > 0;
		const hasModerate = metadata.moderate > 0;

		let overallStatus = 'Secure';
		if (hasCritical) {
			overallStatus = 'Critical';
		} else if (hasHigh) {
			overallStatus = 'High Risk';
		} else if (hasModerate) {
			overallStatus = 'Moderate Risk';
		} else if (metadata.low > 0 || metadata.info > 0) {
			overallStatus = 'Low Risk';
		}

		return {
			status: 'success',
			data: {
				status: overallStatus,
				vulnerabilities,
				summary: {
					...metadata,
					total: totalVulns
				},
				dependencies: auditResult.metadata?.dependencies?.total || 0,
				totalDependencies: auditResult.metadata?.totalDependencies || 0
			}
		};

	} catch (error) {
		console.error('Error running npm audit:', error);
		return {
			status: 'error',
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}

async function runNpmAudit(localPath: string): Promise<NpmAuditResult> {
	try {
		const { stdout } = await execAsync('npm audit --json', {
			cwd: localPath,
			timeout: 120000 // 2 minute timeout (audits can take longer)
		});

		return JSON.parse(stdout);
	} catch (error: unknown) {
		// npm audit exits with code 1 when vulnerabilities are found, but still returns JSON
		const execError = error as { stdout?: string; message: string };
		if (execError.stdout) {
			try {
				return JSON.parse(execError.stdout);
			} catch (parseError) {
				throw new Error(`Failed to parse npm audit output: ${(parseError as Error).message}`);
			}
		}
		throw new Error(`npm audit failed: ${execError.message}`);
	}
}