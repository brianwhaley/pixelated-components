#!/bin/bash

# Universal Release Script for Pixelated Projects
# This script builds in dev, updates main, and optionally publishes to npm

set -e  # Exit on any error

# Get project name from package.json
PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "unknown-project")

# Initialize step counter
STEP_COUNT=1

# Function to get current version
get_current_version() {
    node -p "require('./package.json').version"
}



echo ""
echo "================================================="
echo "🚀 Starting Release Process for $PROJECT_NAME"
echo "================================================="
echo ""
# Check if we're on dev branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "dev" ]; then
    echo "❌ Error: Must be on dev branch to run this script"
    echo "Current branch: $current_branch"
    echo "Please switch to dev branch: git checkout dev"
    exit 1
fi



# Select remote
echo ""
echo "🔑 Step $((STEP_COUNT++)): Choose the git Remote to release:"
echo "================================================="
# Helper: derive a sensible default remote (remote whose repo name matches local folder)
derive_default_remote() {
    local remotes=($(git remote))
    local local_repo
    local_repo=$(basename "$(git rev-parse --show-toplevel)")
    for remote in "${remotes[@]}"; do
        url=$(git remote get-url "$remote" 2>/dev/null || true)
        repo=$(basename -s .git "${url##*/}")
        if [ -n "$repo" ] && [ "$repo" = "$local_repo" ]; then
            echo "$remote"
            return
        fi
    done
    # Fallback to first remote if no match
    echo "${remotes[0]}"
}

# Function to prompt for remote selection, showing a default derived from local repo name
prompt_remote_selection() {
    echo "Available git remotes:" >&2
    local remotes=($(git remote))
    local count=${#remotes[@]}
    local i=1

    for remote in "${remotes[@]}"; do
        echo "$i) $remote" >&2
        ((i++))
    done

    local default_remote
    default_remote=$(derive_default_remote)
    # find index of default_remote for user prompt
    local default_index=1
    for idx in "${!remotes[@]}"; do
        if [ "${remotes[$idx]}" = "$default_remote" ]; then
            default_index=$((idx+1))
            break
        fi
    done

    local prompt="Select remote to use (1-$count) [default $default_index - $default_remote]: "
    local choice
    read -p "$prompt" choice >&2

    if [ -z "$choice" ]; then
        echo "$default_remote"
        return
    fi

    case $choice in
        [1-9]|[1-9][0-9])
            if [ "$choice" -le "$count" ]; then
                echo "${remotes[$((choice-1))]}"
            else
                echo "${remotes[0]}"  # Default to first if invalid
            fi
            ;;
        *) echo "${remotes[0]}" ;;  # Default to first remote
    esac
}
REMOTE_NAME=$(prompt_remote_selection)

# Confirm current directory matches the selected remote's repository name
remote_url=$(git remote get-url "$REMOTE_NAME" 2>/dev/null || true)
remote_repo=$(basename -s .git "${remote_url##*/}")
local_repo=$(basename "$(git rev-parse --show-toplevel)")
if [ -n "$remote_repo" ] && [ "$remote_repo" != "$local_repo" ]; then
    echo "\n⚠️  Warning: Selected remote '$REMOTE_NAME' points to repository '$remote_repo' but you are currently in folder '$local_repo'."
    read -p "Proceed anyway? (y/N): " proceed
    proceed=${proceed:-n}
    if [[ ! "$proceed" =~ ^[Yy] ]]; then
        echo "Aborting. Please run this script from the correct repository folder." >&2
        exit 1
    fi
fi




# Attempt to source GITHUB token from pixelated config (without printing it)
# Looks in a few common locations; will decrypt if needed and possible
echo ""
echo "🔑 Step $((STEP_COUNT++)): Locating GitHub token in config..."
echo "================================================="
GITHUB_TOKEN_SOURCE=""
config_paths=("src/app/config/pixelated.config.json" "src/config/pixelated.config.json" "src/pixelated.config.json")
for cfg in "${config_paths[@]}"; do
    if [ -f "$cfg" ]; then
        token=$(node -e "try{const fs=require('fs');const p=process.argv[1];const d=JSON.parse(fs.readFileSync(p,'utf8'));const v=d.GITHUB_TOKEN||(d.github&&d.github.token)||d.github_token||(d.tokens&&d.tokens.github&&d.tokens.github.token); if(v) console.log(v)}catch(e){}" "$cfg" 2>/dev/null || true)
        if [ -n "$token" ]; then
            export GITHUB_TOKEN="$token"
            GITHUB_TOKEN_SOURCE="$cfg"
            echo "✅ GITHUB token loaded from $cfg"
            break
        fi
    fi
done
# If not found and we have config:decrypt available and a key, try to decrypt temporarily
if [ -z "$GITHUB_TOKEN" ] && grep -q "\"config:decrypt\":" package.json 2>/dev/null; then
    if [ -z "$PIXELATED_CONFIG_KEY" ]; then
        echo "⚠️ PIXELATED_CONFIG_KEY not set; cannot decrypt config to find token"
    else
        echo "🔓 Decrypting config to locate GitHub token..."
        if npm run config:decrypt; then
            for cfg in "${config_paths[@]}"; do
                if [ -f "$cfg" ]; then
                    token=$(node -e "try{const fs=require('fs');const p=process.argv[1];const d=JSON.parse(fs.readFileSync(p,'utf8'));const v=d.GITHUB_TOKEN||(d.github&&d.github.token)||d.github_token||(d.tokens&&d.tokens.github&&d.tokens.github.token); if(v) console.log(v)}catch(e){}" "$cfg" 2>/dev/null || true)
                    if [ -n "$token" ]; then
                        export GITHUB_TOKEN="$token"
                        GITHUB_TOKEN_SOURCE="$cfg"
                        echo "✅ GITHUB token loaded from $cfg after decrypt"
                        break
                    fi
                fi
            done
        else
            echo "❌ config:decrypt failed; cannot load GitHub token"
        fi
    fi
fi



echo ""
echo "📦 Step $((STEP_COUNT++)): Updating dependencies..."
echo "================================================="
# build list of packages we can actually update (use the "wanted" column \3 instead of latest \4  so we stay inside semver)
UPDATES=$(npm outdated | awk 'NR>1 {print \$1"@"\$3}' || true)

if [ -n "$UPDATES" ]; then
    echo "Updating the following packages: $UPDATES"
	# removed --force from npm install to avoid unnecessary breaking updates
    echo "$UPDATES" | xargs npm install --save 2>/dev/null || true
    echo "✅ Successfully updated: $UPDATES"
else
    echo "✅ No dependency updates needed."
fi



echo ""
echo "📦 Step $((STEP_COUNT++)): Updating Audit Fixes..."
echo "================================================="
# remove --force to avoid breaking changes
npm audit fix 2>/dev/null || true



echo ""
echo "🔍 Step $((STEP_COUNT++)): Running lint..."
echo "================================================="
npm run lint



echo ""
echo "🔨 Step $((STEP_COUNT++)): Encrypting configuration..."
echo "================================================="
if grep -q "\"config:encrypt\":" package.json; then
    echo "🔒 Encrypting configuration..."
    npm run config:encrypt
    echo "✅ Encrypted configuration successfully."
else
    echo "❌ Encryption failed. Please add config:encrypt script to package.json."
    exit 1
fi



echo ""
echo "🔨 Step $((STEP_COUNT++)): Building project..."
echo "================================================="
npm run build



# Post-build: if a dist folder exists, ensure it does NOT contain plaintext config and that the .enc file is present
echo ""
echo "🔧 Step $((STEP_COUNT++)): Post-build config check: cleaning dist and verifying .enc..."
echo "================================================="
DIST_DIR="dist"
PLAIN_DIST_CFG="$DIST_DIR/config/pixelated.config.json"
ENC_DIST_CFG="$DIST_DIR/config/pixelated.config.json.enc"

if [ -d "$DIST_DIR" ]; then
    if [ -f "$PLAIN_DIST_CFG" ]; then
        echo "⚠️  Found plaintext config in dist at $PLAIN_DIST_CFG — removing it to avoid accidental publish."
        rm -f "$PLAIN_DIST_CFG"
        echo "✅ Removed $PLAIN_DIST_CFG"
    else
        echo "ℹ️  No plaintext config found in dist."
    fi

    if [ -f "$ENC_DIST_CFG" ]; then
        echo "✅ Found encrypted config at $ENC_DIST_CFG"
    else
        echo "❌ Missing encrypted config in dist: $ENC_DIST_CFG. Aborting release."
        exit 1
    fi
else
    echo "ℹ️  No dist directory found; skipping dist cleanup/verification."
fi



echo ""
echo "🏷️  Step $((STEP_COUNT++)): Version bump..."
echo "================================================="
# Function to prompt for version bump type
prompt_version_type() {
    echo "Current version: $(get_current_version)" >&2
    echo "Select version bump type:" >&2
    echo "1) patch (x.x.1)" >&2
    echo "2) minor (x.1.0)" >&2
    echo "3) major (1.x.x)" >&2
    echo "4) custom version" >&2
    echo "5) no version bump" >&2
    read -p "Enter choice (1-5) [default 1]: " choice >&2

    # Default to 1 (patch) when user presses Enter
    if [ -z "$choice" ]; then
        choice=1
    fi

    case $choice in
        1) version_type="patch" ;;
        2) version_type="minor" ;;
        3) version_type="major" ;;
        4)
            read -p "Enter custom version: " custom_version >&2
            version_type="$custom_version"
            ;;
        5) version_type="none" ;;
        *) version_type="patch" ;; # fallback default
    esac
}
prompt_version_type
if [ "$version_type" != "none" ]; then
    if [ "$version_type" = "patch" ] || [ "$version_type" = "minor" ] || [ "$version_type" = "major" ]; then
        npm version $version_type --force --no-git-tag-version
    else
        # Custom version
        npm version $version_type --force --no-git-tag-version
    fi
fi



echo ""
echo "💾 Step $((STEP_COUNT++)): Committing changes..."
echo "================================================="
# Function to prompt for commit message
prompt_commit_message() {
    read -p "Enter commit message (or press enter for default): " commit_msg
    if [ -z "$commit_msg" ]; then
        echo "chore: release $(get_current_version)"
    else
        echo "$commit_msg"
    fi
}
commit_message=$(prompt_commit_message)
git add . -v
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
else
    git commit -m "$commit_message"
fi



echo ""
# Prompt for release mode (default: both = push dev and update main, tag, and publish)
echo "🔀 Step $((STEP_COUNT++)): Choose release mode"
echo "================================================="
echo "1) Dev and Main (default - pushes dev, updates main, tags, creates release, and publishes)"
echo "2) Dev only (push dev only; skip main update, tagging, GitHub release, and npm publish)"
read -p "Enter choice (1-2) [default 1]: " release_choice
if [ -z "$release_choice" ] || [ "$release_choice" = "1" ]; then
    RELEASE_MODE="both"
else
    RELEASE_MODE="dev-only"
fi
echo "Selected release mode: $RELEASE_MODE"

echo ""
echo "📤 Step $((STEP_COUNT++)): Pushing dev branch..."
echo "================================================="
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


echo ""
echo "🔄 Step $((STEP_COUNT++)): Updating main branch..."
echo "================================================="
if [ "$RELEASE_MODE" = "dev-only" ]; then
	echo " 🔕 Skipping main update (RELEASE_MODE=dev-only)."
else
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
fi



echo ""
echo "🏷️  Step $((STEP_COUNT++)): Creating and pushing git tag and release..."
echo "================================================="
if [ "$RELEASE_MODE" = "dev-only" ]; then
    echo " 🔕 Skipping tag/release creation (RELEASE_MODE=dev-only)."
else
    new_version=$(get_current_version)
    release_tag="v${new_version}"
    # Use commit message as tag/release message when available, otherwise default
    tag_message="${commit_message:-"Release $release_tag"}"
    if ! git tag -l | grep -q "$release_tag"; then
        echo "🔖 Creating annotated tag $release_tag"
        git tag -a "$release_tag" -m "$tag_message"
        git push $REMOTE_NAME "$release_tag"
    else
        echo "ℹ️  Tag $release_tag already exists"
    fi
fi



# Create a published GitHub release for this tag (prefer gh CLI, fallback to API)
echo ""
echo "📣 Step $((STEP_COUNT++)): Creating GitHub release..."
echo "================================================="
if [ "$RELEASE_MODE" = "dev-only" ]; then
    echo " 🔕 Skipping GitHub release creation (RELEASE_MODE=dev-only)."
else
	REMOTE_URL=$(git remote get-url $REMOTE_NAME 2>/dev/null || true)
	# Use GitHub API only (no gh CLI). Ensure GITHUB_TOKEN is present
	if [ -z "$GITHUB_TOKEN" ]; then
		echo "⚠️  GITHUB_TOKEN not set; skipping GitHub release creation via API"
	else
		# Derive owner/repo from remote URL using shell-only parsing (robust across platforms)
		repo_path="${REMOTE_URL#git@github.com:}"
		repo_path="${repo_path#https://github.com/}"
		repo_path="${repo_path%.git}"
		repo_path="${repo_path%%/}"
		if [ -z "$repo_path" ]; then
			echo "⚠️  Unable to determine repo path from remote URL; skipping API-based release creation"
		else
			# Check if release exists
			# Diagnostic: show remote and derived repo path (non-secret)
			echo "Remote URL: $REMOTE_URL"
			echo "Derived repo_path: $repo_path"
		# Quick access check to see if token and repo path are valid
		access_resp=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$repo_path")
		if echo "$access_resp" | grep -q '"full_name"'; then
			echo "✅ Repo accessible via API: $(echo "$access_resp" | sed -n 's/.*"full_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
		else
			echo "❌ Repo not accessible via API. GitHub API response: $access_resp"
			echo "Make sure GITHUB_TOKEN has 'repo' scope and the repo path is correct; aborting release creation."
			# Do not attempt to create a release if the repo isn't accessible
			exit 1
		fi
		if curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$repo_path/releases/tags/$release_tag" | grep -q '"tag_name"'; then
				echo "ℹ️  Release for $release_tag already exists on GitHub (API)."
			else
				echo "🔔 Creating release via GitHub API for $release_tag"
				payload=$(printf '{"tag_name":"%s","name":"%s","body":"%s","draft":false,"prerelease":false}' "$release_tag" "$release_tag" "${tag_message//\"/\\\"}")
				resp=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Content-Type: application/json" -d "$payload" "https://api.github.com/repos/$repo_path/releases")
				if echo "$resp" | grep -q '"id"'; then
					echo "✅ Created GitHub release $release_tag"
				else
					echo "❌ Failed to create GitHub release: $resp"
				fi
			fi
		fi
	fi
fi



echo ""
echo "🔐 Step $((STEP_COUNT++)): Publishing to npm..."
echo "================================================="
if [ "$RELEASE_MODE" = "dev-only" ]; then
    echo "🔕 Skipping npm publish (RELEASE_MODE=dev-only)."
else
    # Function to prompt for publishing
    prompt_publish() {
        read -p "Do you want to publish to npm? (y/n): " should_publish
        if [ "$should_publish" = "y" ] || [ "$should_publish" = "Y" ]; then
            echo "yes"
        else
            echo "no"
        fi
    }
    # Function to prompt for OTP
    prompt_otp() {
        read -p "Enter npm OTP: " otp
        echo "$otp"
    }
    should_publish=$(prompt_publish)
    if [ "$should_publish" = "yes" ]; then
        npm login
        otp=$(prompt_otp)
        npm publish --loglevel warn --access public --otp=$otp
        echo "✅ Successfully published to npm!"
    else
        echo "ℹ️  Skipping npm publish"
        echo "You can publish manually with: npm publish --access public"
    fi
fi



if grep -q "\"config:decrypt\":" package.json; then
	echo ""
    echo "🔓 Step $((STEP_COUNT++)): Decrypting configuration for local development..."
	echo "================================================="
    npm run config:decrypt
fi



echo ""
echo ""
echo "================================================="
echo "✅ Release complete!"
echo "================================================="
if [ "$RELEASE_MODE" = "dev-only" ]; then
    echo "📦 Version: $(get_current_version)"
    echo "📋 Branches updated: dev"
    echo "🏷️  Tag created: (skipped)"
else
    echo "📦 Version: $(get_current_version)"
    echo "📋 Branches updated: dev, main"
    echo "🏷️  Tag created: v$(get_current_version)"
fi

if [ "$should_publish" = "yes" ]; then
    echo "🔗 https://www.npmjs.com/package/$PROJECT_NAME"
fi
