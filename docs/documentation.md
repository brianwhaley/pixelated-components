# Pixelated Admin Documentation

## Table of Contents

- [Environment Variables](#environment-variables)
- [Coding Conventions](coding-conventions.md)

## Configuration (Pixelated unified config)

Secrets and service credentials (Google OAuth, NextAuth secrets, service account keys) should now be stored in `src/app/config/pixelated.config.json` and accessed server-side via `getFullPixelatedConfig()`.

For example, add the Google credentials under the `google` top-level key and NextAuth secrets under `nextAuth` in `pixelated.config.json`:

- `google.client_id`
- `google.client_secret`
- `google.api_key`
- `google.refresh_token` (use `scripts/generate-google-tokens.js` to obtain and add to `pixelated.config.json`)
- `nextAuth.secret`
- `nextAuth.url`

If you need to keep `pixelated.config.json` encrypted, provide the decryption key (`PIXELATED_CONFIG_KEY`) through your deployment secrets store (do not commit it to the repository).

If you need to expose non-secret values to the client (e.g., a public Google Maps API key), return them via `getClientOnlyPixelatedConfig()` or a small server helper; avoid baking secrets into the client build.
### Generating NEXTAUTH_SECRET

Run this command to generate a secure random string:

```bash
openssl rand -base64 32
```

Example output: `RZJ0yls+FdikOyfQ8UX0MB4bJFS9e73Wfaai1EVsUi8=`

### Obtaining Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Identity API:
   - Navigate to 'APIs & Services' > 'Library'
   - Search for 'Google Identity' and enable it
4. Set up the OAuth consent screen:
   - Go to 'APIs & Services' > 'OAuth consent screen'
   - Choose 'External' user type (allows anyone to use the app)
   - Fill in the required app information
5. Create OAuth 2.0 credentials:
   - Go to 'APIs & Services' > 'Credentials'
   - Click 'Create Credentials' > 'OAuth 2.0 Client IDs'
   - Choose 'Web application'
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-amplify-domain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret from the credentials page

**Note:** If you get "Access blocked: [App] can only be used within its organization", change the OAuth consent screen user type to 'External'.

### Obtaining Google Gemini API Key

The Gemini API key is required for AI-powered SEO recommendations in the ConfigBuilder.

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Choose an existing project or create a new one
5. Copy the generated API key
6. Add it to your environment variables as `NEXT_PUBLIC_GEMINI_API_KEY`

**Note:** Gemini API has a generous free tier for development, but monitor usage in Google Cloud Console for production costs.


## ===== BUILD APP =====

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
npm audit fix --force
npm run lint --fix
npm version patch --force
git add . -v
git commit -m "add amplify.yml"
git push -u pixelatedadmin dev --tags
git push pixelatedadmin dev:main
