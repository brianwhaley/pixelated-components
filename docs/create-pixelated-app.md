# create-pixelated-app

This document describes the new behavior of the `create-pixelated-app` CLI when creating a GitHub repository automatically.

## Key points

- The CLI will prompt: `Create a new GitHub repository in '<owner>' and push the initial commit? (Y/n)` where `<owner>` defaults to `github.defaultOwner` from `src/config/pixelated.config.json` (fallback `brianwhaley`).
- The script will only obtain the GitHub token from the project's encrypted config via the project's provider—**it will not read `GITHUB_TOKEN` from environment variables**.
- The provider used is the existing `getFullPixelatedConfig()` logic from `src/components/config/config` which automatically supports encrypted `pixelated.config.json` using `PIXELATED_CONFIG_KEY` for decryption.
- The flow does:
  1. Initialize a local repo and make an initial commit
  2. Use the project provider to read `github.token` from the decrypted config (requires `PIXELATED_CONFIG_KEY` or equivalent) by running an inline `tsx` snippet
  3. Create a new repo via the GitHub API under the owner's account
  4. Add `origin` remote (HTTPS) and push `main`

## Token & key handling

- The script intentionally does **not** look for `GITHUB_TOKEN` in environment variables.
- It does rely on `PIXELATED_CONFIG_KEY` to be available where the script runs (for decryption). You can provide it via `.env.local` or other secure local mechanisms supported by the project's configuration provider.

## Tests

- Unit tests mock the provider invocation and the GitHub API so the flow is exercised without network calls or writing plaintext config.

## Notes

- No repository secrets are set by the CLI.
- The created repository is public by default (set `private: false` in the API call).

## AWS Amplify support

- After creating and pushing the repo, the CLI will prompt: `Create an AWS Amplify app for this repository and connect 'main' and 'dev' branches? (y/N)`.
- This is a best-effort flow that invokes the local `aws` CLI. Ensure `aws` is installed and configured (credentials and region).
- You may optionally provide a GitHub Personal Access Token (PAT) when prompted so Amplify can automatically connect the repository. If you do not provide a PAT, you may need to finish the connection in the AWS Console.
- The CLI attempts to create the Amplify app and `dev`/`main` branches and will try to configure them for `Next.js - SSR` and enable automatic builds, but you should verify settings in the AWS Console afterwards.
