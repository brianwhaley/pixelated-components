#!/bin/bash

# Universal Release Script for Pixelated Projects
# This script builds in dev, updates main, and optionally publishes to npm

set -e  # Exit on any error

# Get project name from package.json
PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "unknown-project")

# Function to prompt for remote selection
prompt_remote_selection() {
    echo "Available git remotes:" >&2
    local remotes=($(git remote))
    local i=1
    for remote in "${remotes[@]}"; do
        echo "$i) $remote" >&2
        ((i++))
    done
    
    local choice
    read -p "Select remote to use (1-${#remotes[@]}): " choice >&2
    
    case $choice in
        [1-9]|[1-9][0-9])
            if [ "$choice" -le "${#remotes[@]}" ]; then
                echo "${remotes[$((choice-1))]}"
            else
                echo "${remotes[0]}"  # Default to first if invalid
            fi
            ;;
        *) echo "${remotes[0]}" ;;  # Default to first remote
    esac
}

# Select remote
if [ -t 0 ]; then
    REMOTE_NAME=$(prompt_remote_selection)
else
    # Non-interactive: use smart detection
    REMOTE_NAME=$(git remote | grep "pixelated-components" | head -1)
    if [ -z "$REMOTE_NAME" ]; then
        REMOTE_NAME=$(git remote | grep "pixelated" | head -1)
    fi
    if [ -z "$REMOTE_NAME" ]; then
        REMOTE_NAME=$(git remote | xargs -I {} sh -c 'git ls-remote --heads {} dev >/dev/null 2>&1 && echo {}' | head -1)
    fi
    if [ -z "$REMOTE_NAME" ]; then
        REMOTE_NAME=$(git remote | head -1)  # Fallback to first remote
    fi
fi

echo "🚀 Starting Release Process for $PROJECT_NAME"
echo "================================================="

# Function to get current version
get_current_version() {
    node -p "require('./package.json').version"
}

# Function to prompt for version bump type
prompt_version_type() {
    if [ -t 0 ]; then
        # Interactive mode
        echo "Current version: $(get_current_version)" >&2
        echo "Select version bump type:" >&2
        echo "1) patch (x.x.1)" >&2
        echo "2) minor (x.1.0)" >&2
        echo "3) major (1.x.x)" >&2
        echo "4) custom version" >&2
        echo "5) no version bump" >&2
        read -p "Enter choice (1-5): " choice >&2
    else
        # Non-interactive mode - use default
        echo "Non-interactive mode detected, using default patch version bump" >&2
        choice="1"
    fi
    
    case $choice in
        1) version_type="patch" ;;
        2) version_type="minor" ;;
        3) version_type="major" ;;
        4)
            if [ -t 0 ]; then
                read -p "Enter custom version: " custom_version >&2
            else
                echo "Custom version requires interactive mode" >&2
                version_type="patch"
            fi
            ;;
        5) version_type="none" ;;
        *) version_type="patch" ;; # default
    esac
}

# Function to prompt for commit message
prompt_commit_message() {
    if [ -t 0 ]; then
        read -p "Enter commit message (or press enter for default): " commit_msg
        if [ -z "$commit_msg" ]; then
            echo "chore: release $(get_current_version)"
        else
            echo "$commit_msg"
        fi
    else
        echo "chore: release $(get_current_version)"
    fi
}

# Function to prompt for publishing
prompt_publish() {
    if [ -t 0 ]; then
        read -p "Do you want to publish to npm? (y/n): " should_publish
        if [ "$should_publish" = "y" ] || [ "$should_publish" = "Y" ]; then
            echo "yes"
        else
            echo "no"
        fi
    else
        echo "no"  # Default to no in non-interactive mode
    fi
}

# Function to prompt for OTP
prompt_otp() {
    if [ -t 0 ]; then
        read -p "Enter npm OTP: " otp
        echo "$otp"
    else
        echo ""  # No OTP in non-interactive mode
    fi
}

# Check if we're on dev branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "dev" ]; then
    echo "❌ Error: Must be on dev branch to run this script"
    echo "Current branch: $current_branch"
    echo "Please switch to dev branch: git checkout dev"
    exit 1
fi

echo "📦 Step 1: Updating dependencies..."
npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save 2>/dev/null || true
npm audit fix --force 2>/dev/null || true

echo "🔍 Step 2: Running lint..."
npm run lint

echo "🔨 Step 3: Building project..."
npm run build

echo "🏷️  Step 4: Version bump..."
prompt_version_type
if [ "$version_type" != "none" ]; then
    if [ "$version_type" = "patch" ] || [ "$version_type" = "minor" ] || [ "$version_type" = "major" ]; then
        npm version $version_type --force --no-git-tag-version
    else
        # Custom version
        npm version $version_type --force --no-git-tag-version
    fi
fi

echo "💾 Step 5: Committing changes..."
commit_message=$(prompt_commit_message)
git add . -v
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    git commit -m "$commit_message"
fi

echo "📤 Step 6: Pushing dev branch..."
# Try to push, if it fails due to remote changes, fetch and rebase
if ! git push $REMOTE_NAME dev; then
    echo "⚠️  Push failed, fetching remote changes and rebasing..."
    git fetch $REMOTE_NAME
    if git rebase $REMOTE_NAME/dev; then
        echo "✅ Rebased successfully, pushing..."
        git push $REMOTE_NAME dev || {
            echo "❌ Failed to push after rebase. Please check git status."
            exit 1
        }
    else
        echo "❌ Rebase failed. Please resolve conflicts and run 'git rebase --continue' or 'git rebase --abort'"
        exit 1
    fi
fi

echo "🔄 Step 7: Updating main branch..."
# Force main to match dev exactly
git push $REMOTE_NAME dev:main --force

# Also update main locally if it exists
if git show-ref --verify --quiet refs/heads/main; then
    git branch -D main 2>/dev/null || true
    git checkout -b main
    git reset --hard dev
    git push $REMOTE_NAME main --force
    git checkout dev
fi

echo "🏷️  Step 8: Creating and pushing git tag..."
new_version=$(get_current_version)
if ! git tag -l | grep -q "v$new_version"; then
    git tag "v$new_version"
    git push $REMOTE_NAME "v$new_version"
else
    echo "ℹ️  Tag v$new_version already exists"
fi

echo "🔐 Step 9: Publishing to npm..."
should_publish=$(prompt_publish)
if [ "$should_publish" = "yes" ]; then
    otp=$(prompt_otp)
    npm publish --access public --otp=$otp
    echo "✅ Successfully published to npm!"
else
    echo "ℹ️  Skipping npm publish"
    echo "You can publish manually with: npm publish --access public"
fi

echo ""
echo "✅ Release complete!"
echo "📦 Version: $(get_current_version)"
echo "📋 Branches updated: dev, main"
echo "🏷️  Tag created: v$(get_current_version)"

if [ "$should_publish" = "yes" ]; then
    echo "🔗 https://www.npmjs.com/package/$PROJECT_NAME"
fi