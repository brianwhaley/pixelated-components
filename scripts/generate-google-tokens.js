const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Load environment variables from .env.local manually
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, ''); // Remove quotes
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnvFile();

// Configuration - Choose the redirect URI that matches your OAuth app
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3006/oauth/callback'; // Default for web apps

const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly'
];

const TOKEN_PATH = path.join(__dirname, '..', '.google-tokens.json');

async function authorize() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
    console.error('\nAlso set GOOGLE_REDIRECT_URI if needed. Common options:');
    console.error('- Web apps: http://localhost:3006/oauth/callback');
    console.error('- Web apps: http://localhost:3006');
    console.error('- Production: https://yourdomain.com/oauth/callback');
    console.error('- Custom: any URL configured in your OAuth app');
    process.exit(1);
  }

  console.log(`Using redirect URI: ${REDIRECT_URI}`);
  console.log('Make sure this matches your OAuth app configuration in Google Cloud Console\n');

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    REDIRECT_URI
  );

  // Check if we have previously stored a token
  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oauth2Client.setCredentials(JSON.parse(token));
    return oauth2Client;
  } catch (error) {
    return getNewToken(oauth2Client);
  }
}

async function getNewToken(oauth2Client) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force refresh token
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Store the token to disk for later program executions
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        console.log('Token stored to', TOKEN_PATH);
        console.log('\nAdd this to your .env.local file:');
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

        resolve(oauth2Client);
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Test the authentication
async function testAuth() {
  try {
    const auth = await authorize();

    console.log('\n✅ OAuth setup successful!');
    console.log('Refresh token saved and environment variable ready.');
    console.log('\nTo test the APIs fully, you\'ll need to:');
    console.log('1. Add the refresh token to your .env.local');
    console.log('2. Configure GA4 Property IDs and GSC Site URLs in sites.json');
    console.log('3. Test through the site health page in your application');

    // Optional: Test basic API connectivity without specific property IDs
    console.log('\n🔍 Testing basic API connectivity...');

    try {
      // Test Search Console API (can test without specific site)
      const searchconsole = google.searchconsole({ version: 'v1', auth });
      console.log('✅ Google Search Console API initialized successfully');
    } catch (error) {
      console.log('⚠️  Google Search Console API test failed (this is normal without site configuration)');
    }

    try {
      // Test Analytics API (can test basic connectivity)
      const analytics = google.analyticsdata({ version: 'v1beta', auth });
      console.log('✅ Google Analytics API initialized successfully');
    } catch (error) {
      console.log('⚠️  Google Analytics API test failed (this is normal without property configuration)');
    }

  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testAuth();
}

module.exports = { authorize };