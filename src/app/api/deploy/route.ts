import { NextRequest, NextResponse } from 'next/server';
import sites from '@/data/sites.json';

interface SiteConfig {
  name: string;
  dev: {
    host: string;
    user: string;
    keyPath: string;
  };
  prod: {
    host: string;
    user: string;
    keyPath: string;
  };
}

export async function POST(request: NextRequest) {
  console.log('Deploy API called');
  const { site, environments, versionType, commitMessage } = await request.json();
  console.log('Received:', { site, environments, versionType, commitMessage });

  if (!site || !environments || !versionType || !commitMessage) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const siteConfig = sites.find(s => s.name === site) as SiteConfig | undefined;
  if (!siteConfig) {
    return NextResponse.json({ error: 'Site not found' }, { status: 404 });
  }

  const results: { [key: string]: string } = {};

  for (const env of environments) {
    if (!siteConfig[env as keyof typeof siteConfig]) {
      results[env] = 'Environment config not found';
      continue;
    }

    const config = siteConfig[env as 'dev' | 'prod'];

    try {
      const result = await executeScript(site, versionType, commitMessage);
      results[env] = result;
    } catch (error) {
      results[env] = `Error: ${(error as Error).message}`;
    }
  }

  return NextResponse.json({ message: 'Deployment results', results });
}

function executeScript(siteName: string, versionType: string, commitMessage: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate the deployment script
    const script = `echo "Updating packages..." && npm outdated | awk 'NR>1 {print $1"@"$4}' | while read pkg; do echo "$pkg" >> /tmp/npm-updates.log && printf "." && npm install --force --save "$pkg" > /dev/null 2>&1; done && echo "\\n\\n✓ Updated packages:" && cat /tmp/npm-updates.log && rm /tmp/npm-updates.log
npm run lint
npm audit fix --force
npm version ${versionType} --force
git add * -v
git commit -m "${commitMessage.replace(/"/g, '\\"')}"
git push -u ${siteName} dev --tags
git push ${siteName} dev:main`;

    resolve(script);
  });
}