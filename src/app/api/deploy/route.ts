import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import sites from '@/app/data/sites.json';

const execAsync = promisify(exec);

interface SiteConfig {
  name: string;
  localPath: string;
  remote: string;
}

export const maxDuration = 900; // 15 minutes maximum execution time

export async function POST(request: NextRequest) {
  const { site, environments, versionType, commitMessage } = await request.json();

  // Only allow local execution for security
  const host = request.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return NextResponse.json({ error: 'Deployment execution is only allowed when running locally' }, { status: 403 });
  }

  if (!site || !environments || !versionType || !commitMessage) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Set a longer timeout for deployment operations
  request.signal?.addEventListener('abort', () => {
    console.log('Deployment request aborted');
  });

  const siteConfig = sites.find(s => s.name === site) as SiteConfig | undefined;
  if (!siteConfig) {
    return NextResponse.json({ error: `Site '${site}' not found in configuration` }, { status: 404 });
  }

  try {
    const { prep, environments: envResults } = await executeScript(site, versionType, commitMessage, environments, siteConfig.localPath, siteConfig.remote);
    return NextResponse.json({ message: 'Deployment results', prep, environments: envResults });
  } catch (error) {
    return NextResponse.json({ error: `Deployment failed: ${(error as Error).message}` }, { status: 500 });
  }
}

function executeScript(siteName: string, versionType: string, commitMessage: string, environments: string[], localPath: string, remote: string): Promise<{ prep: string; environments: { [key: string]: string } }> {
  return new Promise(async (resolve, reject) => {
    try {
      const sourceBranch = 'dev'; // Always deploy from dev branch
      
      // Prep commands (done once) - with timeout protection via Node.js
      const prepCommands = [
        `touch /tmp/npm-updates.log`,
        `npm outdated | awk 'NR>1 {print $1"@"$4}' | while read pkg; do echo "$pkg" >> /tmp/npm-updates.log && printf "." && npm install --force --save "$pkg" > /dev/null 2>&1; done`,
        `echo "\n\n✓ Updated packages:" && cat /tmp/npm-updates.log && rm /tmp/npm-updates.log`,
        'npm run lint',
        'npm audit fix --force',
        `npm version ${versionType} --force`,
        `git add . -v`,
        `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`
      ];

      let prepOutput = 'echo "Updating packages..."\n';
      
      // Execute prep commands with individual error handling
      for (let i = 0; i < prepCommands.length; i++) {
        const cmd = prepCommands[i];
        try {
          console.log(`[${siteName}] Executing step ${i + 1}/${prepCommands.length}: ${cmd.split(' ')[0]}...`);
          const { stdout, stderr } = await execAsync(cmd, { cwd: localPath, timeout: 300000 }); // 5 minute overall timeout per command
          prepOutput += stdout;
          if (stderr) prepOutput += stderr;
          console.log(`[${siteName}] Step ${i + 1} completed successfully`);
        } catch (error) {
          const errorMsg = `[${siteName}] Step ${i + 1} failed: ${cmd}\nError: ${(error as Error).message}\n`;
          prepOutput += errorMsg;
          console.error(errorMsg);

          // Handle expected failures gracefully
          if (cmd.includes('git commit') && (error as Error).message.includes('nothing to commit')) {
            prepOutput += 'No changes to commit, continuing...\n';
            continue;
          }
          if (cmd.includes('npm outdated') && ((error as Error).message.includes('Command failed') || (error as Error).message.includes('timeout'))) {
            prepOutput += 'Package update failed, continuing with deployment...\n';
            continue;
          }
          if (cmd.includes('npm audit fix') && (error as Error).message.includes('audit')) {
            prepOutput += 'Audit fix failed, continuing...\n';
            continue;
          }
          // For critical errors, we might want to continue rather than fail completely
          prepOutput += 'Continuing with deployment despite error...\n';
        }
      }
      
      const envResults: { [key: string]: string } = {};
      
      // Now push to each selected environment with timeout protection
      for (let i = 0; i < environments.length; i++) {
        const env = environments[i];
        const branch = env === 'prod' ? 'main' : 'dev';
        const pushCmd = `git push ${env === 'dev' ? '-u ' : ''}${remote} ${sourceBranch}:${branch} --tags`; // Protected by Node.js timeout
        let envOutput = `Pushing to ${env} (${branch}) - ${i + 1}/${environments.length}...\n`;
        
        try {
          console.log(`[${siteName}] Pushing to ${env} (${i + 1}/${environments.length}): ${pushCmd}`);
          const { stdout, stderr } = await execAsync(pushCmd, { cwd: localPath, timeout: 300000 }); // 5 minute timeout
          envOutput += stdout;
          if (stderr) envOutput += stderr;
          envOutput += `✓ Successfully deployed ${siteName} to ${env}\n`;
          console.log(`[${siteName}] Successfully deployed to ${env}`);
        } catch (error) {
          const errorMsg = `Push to ${env} failed: ${(error as Error).message}\n`;
          envOutput += errorMsg;
          console.error(`[${siteName}] ${errorMsg}`);
          
          // Handle expected git errors gracefully
          if (pushCmd.includes('git push') && (error as Error).message.includes('non-fast-forward')) {
            envOutput += 'Non-fast-forward error, you may need to force push or resolve conflicts manually.\n';
            continue;
          }
          if ((error as Error).message.includes('timeout') || (error as Error).message.includes('Command failed')) {
            envOutput += 'Git push failed, you may need to retry manually.\n';
            continue;
          }
          if ((error as Error).message.includes('Repository not found') || (error as Error).message.includes('does not exist')) {
            envOutput += 'Repository not found or access denied. Check your git remote configuration.\n';
            continue;
          }
        }
        
        envResults[env] = envOutput;
      }
      
      resolve({ prep: prepOutput, environments: envResults });
    } catch (error) {
      reject(error);
    }
  });
}