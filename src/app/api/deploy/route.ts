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
      
      // Prep commands (done once)
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
      
      // Execute prep commands
      for (const cmd of prepCommands) {
        try {
          const { stdout, stderr } = await execAsync(cmd, { cwd: localPath });
          prepOutput += stdout;
          if (stderr) prepOutput += stderr;
        } catch (error) {
          const errorMsg = `Error: ${(error as Error).message}\n`;
          prepOutput += errorMsg;

          // Handle expected failures gracefully
          if (cmd.includes('git commit') && (error as Error).message.includes('nothing to commit')) {
            continue;
          }
        }
      }
      
      const envResults: { [key: string]: string } = {};
      
      // Now push to each selected environment
      for (const env of environments) {
        const branch = env === 'prod' ? 'main' : 'dev';
        const pushCmd = `git push ${env === 'dev' ? '-u ' : ''}${remote} ${sourceBranch}:${branch} --tags`;
        let envOutput = '';
        try {
          const { stdout, stderr } = await execAsync(pushCmd, { cwd: localPath });
          envOutput += stdout;
          if (stderr) envOutput += stderr;
        } catch (error) {
          const errorMsg = `Error: ${(error as Error).message}\n`;
          envOutput += errorMsg;
          if (pushCmd.includes('git push') && (error as Error).message.includes('non-fast-forward')) {
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