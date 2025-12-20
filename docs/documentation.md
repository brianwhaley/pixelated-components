# Pixelated Admin Documentation

## Environment Variables

To configure OAuth and NextAuth, set the following environment variables in your deployment platform (e.g., AWS Amplify):

- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
- `APPLE_ID`: Your Apple OAuth client ID
- `APPLE_SECRET`: Your Apple OAuth client secret
- `NEXTAUTH_SECRET`: A random string (generate with: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your Amplify app URL (e.g., `https://dev.xxxxx.amplifyapp.com`)

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
4. Create OAuth 2.0 credentials:
   - Go to 'APIs & Services' > 'Credentials'
   - Click 'Create Credentials' > 'OAuth 2.0 Client IDs'
   - Choose 'Web application'
   - Add authorized redirect URIs:
     - For local development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://your-amplify-domain.com/api/auth/callback/google`
5. Copy the Client ID and Client Secret from the credentials page