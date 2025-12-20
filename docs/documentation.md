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