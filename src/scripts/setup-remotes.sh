#!/bin/bash

# Setup remotes for all Pixelated projects
# This script configures consistent Git remotes across all repositories

set -e  # Exit on any error

# Base directory (parent of all repos)
BASE_DIR="$(pwd)"
echo "Base directory: $BASE_DIR"

# List of repositories to configure
REPOS=(
    "brianwhaley"
    "informationfocus"
    "oaktreelandscaping"
    "palmetto-epoxy"
    "pixelated"
    "pixelated-admin"
    "pixelated-components"
    "pixelated-template"
    "pixelvivid"
)

# GitHub username/organization
GITHUB_USER="brianwhaley"

echo "Setting up Git remotes for Pixelated projects..."
echo "================================================="

# First, clean up any global remotes that might interfere
echo "Cleaning up global remotes..."
for repo in "${REPOS[@]}"; do
    git config --global --unset-all remote."$repo".url 2>/dev/null || true
    git config --global --unset remote."$repo".fetch 2>/dev/null || true
done
echo "✓ Global remotes cleaned up"

for repo in "${REPOS[@]}"; do
    repo_path="$BASE_DIR/$repo"

    if [ -d "$repo_path/.git" ]; then
        echo "Configuring remotes for: $repo"
        cd "$repo_path"

        # Add remotes for all repositories
        for target_repo in "${REPOS[@]}"; do
            echo "  - Setting up $target_repo remote"
            remote_url="https://github.com/$GITHUB_USER/$target_repo.git"
            # Remove remote if it exists, then add fresh
            git remote remove "$target_repo" 2>/dev/null || true
            git remote add "$target_repo" "$remote_url"
        done
        
        echo "  ✓ All remotes configured for $repo"
    else
        echo "⚠️  Skipping $repo (not a Git repository or doesn't exist)"
    fi
    echo ""
done

echo "================================================="
echo "Remote setup complete!"
echo ""
echo "Each repository now has remotes named after all Pixelated projects."
echo "Example usage:"
echo "  git remote -v                    # List all remotes"
echo "  git fetch pixelated-components   # Fetch from pixelated-components"
echo "  git push pixelated-components main  # Push to pixelated-components"