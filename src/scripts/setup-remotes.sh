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
	"leadscraper"
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

        if [ "$repo" = "pixelated-components" ]; then
            # Pixelated-components should have remotes for ALL repos
            for target_repo in "${REPOS[@]}"; do
                remote_url="https://github.com/$GITHUB_USER/$target_repo.git"
                if git remote | grep -q "^$target_repo$"; then
                    git remote set-url "$target_repo" "$remote_url" 2>/dev/null || true
                else
                    git remote add "$target_repo" "$remote_url" 2>/dev/null || true
                fi
            done
            echo "  ✓ pixelated-components configured with all remotes"
        else
            # Non-components repos should have only their own remote named after the repo
            desired_remote="$repo"
            desired_url="https://github.com/$GITHUB_USER/$repo.git"

            # Ensure desired remote exists and points to the correct URL
            if git remote | grep -q "^$desired_remote$"; then
                git remote set-url "$desired_remote" "$desired_url" 2>/dev/null || true
            else
                git remote add "$desired_remote" "$desired_url" 2>/dev/null || true
            fi

            # Remove direct-name remotes that are other pixelated repos (avoid touching unrelated remotes)
            for other in "${REPOS[@]}"; do
                if [ "$other" != "$repo" ] && git remote | grep -q "^$other$"; then
                    echo "  - Removing stray remote $other from $repo"
                    git remote remove "$other" 2>/dev/null || true
                fi
            done

            echo "  ✓ $repo configured with its own remote only"
        fi

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