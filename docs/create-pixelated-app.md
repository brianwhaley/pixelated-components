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

### Runtime diagnostics

If a deployed site reports `Pixelated config is empty. Check that src/app/config/pixelated.config.json is available.`, follow these checks:

1. Verify `pixelated.config.json.enc` is present in the server build artifact (e.g., in `dist/config/` or included via `outputFileTracingIncludes` so it is present in the server lambda).
2. Ensure `PIXELATED_CONFIG_KEY` is set in the *runtime* environment (Amplify environment variables for the app). If unsure, enable temporary diagnostic logging by setting `PIXELATED_CONFIG_DEBUG=1` in the app environment variables.
3. With `PIXELATED_CONFIG_DEBUG=1` set, the server will log (non-secret) diagnostics showing which config path was found and whether a key was present and whether decryption succeeded or failed.

Notes:
- The diagnostic will only print the key length or presence, never the key itself.
- After debugging, **remove** `PIXELATED_CONFIG_DEBUG` from the environment to avoid extra log noise.

## Tests

- Unit tests mock the provider invocation and the GitHub API so the flow is exercised without network calls or writing plaintext config.

## Notes

- No repository secrets are set by the CLI.
- The created repository is public by default (set `private: false` in the API call).
