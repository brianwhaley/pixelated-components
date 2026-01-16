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
