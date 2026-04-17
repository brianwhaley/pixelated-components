# Detect changed workspaces (apps/packages/tools) since a base ref
get_changed_workspaces() {
    # Usage: get_changed_workspaces <base_ref>
    local base_ref="$1"

    if ! git rev-parse --verify --quiet "$base_ref" >/dev/null; then
        if git rev-parse --verify --quiet "main" >/dev/null; then
            echo "⚠️  Warning: base ref '$base_ref' not found. Falling back to 'main'." >&2
            base_ref="main"
        elif git rev-parse --verify --quiet "HEAD^" >/dev/null; then
            echo "⚠️  Warning: base ref '$base_ref' not found. Falling back to 'HEAD^'." >&2
            base_ref="HEAD^"
        else
            echo "⚠️  Warning: base ref '$base_ref' not found. Falling back to 'HEAD'." >&2
            base_ref="HEAD"
        fi
    fi

    {
        git diff --name-only "$base_ref"...HEAD
        git diff --name-only --cached
        git diff --name-only
        git ls-files --others --exclude-standard
    } | \
        grep -E '^(apps|packages|tools)/' | \
        awk -F/ '{print $1"/"$2}' | sort -u
}

collect_changed_workspaces() {
    local base_ref="${REMOTE_NAME}/main"
    CHANGED_WORKSPACES=()
    while IFS= read -r workspace; do
        if [ -n "$workspace" ]; then
            CHANGED_WORKSPACES+=("$workspace")
        fi
    done < <(get_changed_workspaces "$base_ref")

    if [ ${#CHANGED_WORKSPACES[@]} -eq 0 ]; then
        echo "ℹ️  No changed workspaces detected relative to $base_ref"
    else
        echo "✅ Changed workspaces (${#CHANGED_WORKSPACES[@]}):"
        for workspace in "${CHANGED_WORKSPACES[@]}"; do
            echo "  - $workspace"
        done
    fi
}
#!/bin/bash

# Universal Release Script for Pixelated Projects
# Usage: 
#   bash release.sh              (full release process)

set -e

# ============================================================
# GLOBAL STATE (shared across all steps & workflows)
# ============================================================
STEP_COUNT=1
declare -a SUCCESSFUL_WORKSPACES
declare -a PUSH_ERRORS
declare -a CHANGED_WORKSPACES
REMOTE_NAME=""
VERSION_TYPE=""
COMMIT_MESSAGE=""
NEW_VERSION=""
MONOREPO_ROOT=$(git rev-parse --show-toplevel)
PROJECT_NAME=""
CONTEXT_TYPE="unknown"
WORKSPACE_ROOT=""
WORKSPACE_TYPE=""
WORKSPACE_NAME=""
WORKSPACE_DIRS=()
APP_NAME=""
GITHUB_TOKEN=""
GITHUB_TOKEN_SOURCE=""
RELEASE_MODE="both"
MONOREPO_MODE=false

# Detect flags
if [[ "$*" == *"--monorepo"* ]]; then
    MONOREPO_MODE=true
fi

# ============================================================
# CONTEXT DETECTION (run early to populate CONTEXT_TYPE, WORKSPACE_ROOT)
# ============================================================

find_workspace_root() {
    local dir="$CURRENT_DIR"
    while [ "$dir" != "$MONOREPO_ROOT" ] && [ "$dir" != "/" ]; do
        if [ -f "$dir/package.json" ]; then
            echo "$dir"
            return 0
        fi
        dir=$(dirname "$dir")
    done

    if [ -f "$MONOREPO_ROOT/package.json" ]; then
        echo "$MONOREPO_ROOT"
        return 0
    fi

    echo "$CURRENT_DIR"
}

detect_context() {
    CURRENT_DIR=$(pwd)
    WORKSPACE_ROOT=$(find_workspace_root)
    local relative_path="${WORKSPACE_ROOT#$MONOREPO_ROOT/}"

    if [ "$WORKSPACE_ROOT" = "$MONOREPO_ROOT" ]; then
        CONTEXT_TYPE="root"
        WORKSPACE_TYPE="root"
        WORKSPACE_NAME=$(basename "$MONOREPO_ROOT")
    elif [[ "$relative_path" == apps/* ]]; then
        CONTEXT_TYPE="app"
        WORKSPACE_TYPE="app"
        WORKSPACE_NAME=$(basename "$WORKSPACE_ROOT")
        APP_NAME="$WORKSPACE_NAME"
    elif [[ "$relative_path" == tools/* ]]; then
        CONTEXT_TYPE="tool"
        WORKSPACE_TYPE="tool"
        WORKSPACE_NAME=$(basename "$WORKSPACE_ROOT")
        APP_NAME="$WORKSPACE_NAME"
    elif [[ "$relative_path" == packages/* ]]; then
        WORKSPACE_TYPE="package"
        WORKSPACE_NAME=$(basename "$WORKSPACE_ROOT")
        if [[ "$relative_path" == packages/pixelated-components* ]]; then
            CONTEXT_TYPE="component"
        else
            CONTEXT_TYPE="package"
        fi
    else
        CONTEXT_TYPE="standalone"
        WORKSPACE_TYPE="standalone"
        WORKSPACE_NAME=$(basename "$WORKSPACE_ROOT")
    fi

    if [ "$CONTEXT_TYPE" = "root" ]; then
        WORKSPACE_DIRS=("$MONOREPO_ROOT" "$MONOREPO_ROOT/packages/*" "$MONOREPO_ROOT/apps/*" "$MONOREPO_ROOT/tools/*")
    else
        WORKSPACE_DIRS=("$WORKSPACE_ROOT")
    fi
}

# ============================================================
# HELPER FUNCTIONS (pure utilities, no state modification)
# ============================================================

get_current_version() {
    node -p "require('./package.json').version"
}

check_dev_branch() {
    local current_branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "dev" ]; then
        echo "❌ Error: Must be on dev branch to run this script"
        echo "Current branch: $current_branch"
        echo "Please switch to dev branch: git checkout dev"
        exit 1
    fi
}

prompt_remote_selection() {
    echo "Available git remotes:" >&2
    local remotes=($(git remote))
    local count=${#remotes[@]}
    local i=1
    local default_idx=""

    # If in an app/tool context, find matching remote name
    # If we have an APP_NAME, find matching remote name
    if [ -n "$APP_NAME" ]; then
        for idx in "${!remotes[@]}"; do
            if [ "${remotes[$idx]}" = "$APP_NAME" ]; then
                default_idx=$((idx + 1))
                break
            fi
        done
    fi

    for remote in "${remotes[@]}"; do
        if [ -n "$default_idx" ] && [ $((i)) -eq "$default_idx" ]; then
            echo "$i) $remote (default)" >&2
        else
            echo "$i) $remote" >&2
        fi
        ((i++))
    done

    # Prompt with default if found
    local choice
    if [ -n "$default_idx" ]; then
        read -p "Select remote (1-$count) [default $default_idx]: " choice >&2
        # Use default if empty input
        if [ -z "$choice" ]; then
            choice=$default_idx
        fi
    else
        read -p "Select remote (1-$count): " choice >&2
    fi

    if [ -z "$choice" ]; then
        echo "❌ Remote selection required" >&2
        exit 1
    fi

    case $choice in
        [1-9]|[1-9][0-9])
            if [ "$choice" -le "$count" ]; then
                echo "${remotes[$((choice-1))]}"
            else
                echo "❌ Invalid choice" >&2
                exit 1
            fi
            ;;
        *) 
            echo "❌ Invalid choice" >&2
            exit 1
            ;;
    esac
}

get_workspace_repository_url() {
    local package_json="$WORKSPACE_ROOT/package.json"
    if [ ! -f "$package_json" ]; then
        return 1
    fi

    node -e '
const fs = require("fs");
const file = process.argv[1];
let data;
try {
  data = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (err) {
  process.exit(1);
}
const repo = data.repository;
if (!repo) process.exit(1);
if (typeof repo === "string") {
  console.log(repo);
  process.exit(0);
}
if (repo && typeof repo.url === "string") {
  console.log(repo.url);
  process.exit(0);
}
process.exit(1);
' "$package_json"
}

normalize_git_repo_path() {
    local repo_url="$1"
    repo_url="${repo_url%/}"
    repo_url="${repo_url#git@github.com:}"
    repo_url="${repo_url#ssh://git@github.com/}"
    repo_url="${repo_url#https://github.com/}"
    repo_url="${repo_url#http://github.com/}"
    repo_url="${repo_url#git://github.com/}"
    repo_url="${repo_url%.git}"
    echo "${repo_url%%/}"
}

find_remote_by_repository_url() {
    local repository_url="$1"
    local target_repo
    target_repo=$(normalize_git_repo_path "$repository_url")
    if [ -z "$target_repo" ]; then
        return 1
    fi

    local remote
    for remote in $(git remote); do
        local remote_url
        remote_url=$(git remote get-url "$remote" 2>/dev/null || true)
        if [ -z "$remote_url" ]; then
            continue
        fi

        local remote_repo
        remote_repo=$(normalize_git_repo_path "$remote_url")
        if [ "$remote_repo" = "$target_repo" ]; then
            echo "$remote"
            return 0
        fi
    done

    return 1
}

prompt_version_type() {
    echo "Current version: $(get_current_version)" >&2
    echo "Select version bump type:" >&2
    echo "1) patch (x.x.1)" >&2
    echo "2) minor (x.1.0)" >&2
    echo "3) major (1.x.x)" >&2
    echo "4) custom version" >&2
    echo "5) no version bump" >&2
    read -p "Enter choice (1-5) [default 1]: " choice >&2

    if [ -z "$choice" ]; then
        choice=1
    fi

    case $choice in
        1) echo "patch" ;;
        2) echo "minor" ;;
        3) echo "major" ;;
        4)
            read -p "Enter custom version: " custom_version >&2
            echo "$custom_version"
            ;;
        5) echo "none" ;;
        *) echo "patch" ;;
    esac
}

prompt_commit_message() {
    read -p "Enter commit message (or press enter for default): " commit_msg >&2
    if [ -z "$commit_msg" ]; then
        echo "chore: release $(get_current_version)"
    else
        echo "$commit_msg"
    fi
}

bump_version() {
    local version_type="$1"
    if [ "$version_type" != "none" ]; then
        npm version "$version_type" --force --no-git-tag-version
    fi
}

git_push_dev_with_retry() {
    local remote="$1"
    if ! git push "$remote" dev; then
        echo "⚠️  Push failed, fetching remote changes and rebasing..."
        git fetch "$remote"
        if git rebase "$remote/dev"; then
            echo "✅ Rebased successfully, pushing..."
            git push "$remote" dev || {
                PUSH_ERRORS+=("dev push failed after rebase")
                return 1
            }
        else
            echo "❌ Rebase failed. Please resolve conflicts and run 'git rebase --continue'"
            PUSH_ERRORS+=("dev rebase failed")
            return 1
        fi
    fi
}

git_push_tags() {
    local remote="$1"
    local new_version="$2"
    local tag_message="$3"
    
    local release_tag="v${new_version}"
    if ! git tag -l | grep -q "$release_tag"; then
        echo "🔖 Creating annotated tag $release_tag"
        git tag -a "$release_tag" -m "$tag_message"
        git push "$remote" "$release_tag" || {
            PUSH_ERRORS+=("tag push failed")
            return 1
        }
        echo "✅ Pushed tag $release_tag"
    else
        echo "ℹ️  Tag $release_tag already exists, skipping tag creation"
    fi
}

git_push_to_main() {
    local remote="$1"
    git push "$remote" dev:main --force
    echo "✅ Pushed dev to main"
}

# ============================================================
# STEP FUNCTIONS (atomic operations, modify global state)
# ============================================================

step_check_dev_branch() {
    echo ""
    echo "🔑 Step $((STEP_COUNT++)): Checking branch..."
    echo "================================================="
    check_dev_branch
    echo "✅ On dev branch"
}

step_select_remote() {
    echo ""
    echo "🔑 Step $((STEP_COUNT++)): Select remote..."
    echo "================================================="
    REMOTE_NAME=$(prompt_remote_selection)
    echo "✅ Selected remote: $REMOTE_NAME"
    
    # Verify remote matches repo name
    local remote_url
    remote_url=$(git remote get-url "$REMOTE_NAME" 2>/dev/null || true)
    local remote_repo
    remote_repo=$(basename -s .git "${remote_url##*/}")
    local local_repo
    if [ "$WORKSPACE_ROOT" != "$MONOREPO_ROOT" ]; then
        local_repo=$(basename "$WORKSPACE_ROOT")
    else
        local_repo=$(basename "$MONOREPO_ROOT")
    fi
    
    if [ -n "$remote_repo" ] && [ "$remote_repo" != "$local_repo" ]; then
        echo "⚠️  Warning: Remote '$REMOTE_NAME' points to '$remote_repo' but you're in '$local_repo'"
        read -p "Proceed anyway? (y/N): " proceed
        proceed=${proceed:-n}
        if [[ ! "$proceed" =~ ^[Yy] ]]; then
            echo "Aborting."
            exit 1
        fi
    fi
}

generate_sitemap_images_for_workspace() {
    local workspace_name="$1"
    local workspace_dir="$2"

    echo "  📦 Generating sitemap images for $workspace_name..."
    if ! node $(node -e 'console.log(require.resolve("@pixelated-tech/components/scripts/generate-site-images.js"))') > /tmp/generate_site_images_output.log 2>&1; then
        echo "❌ Sitemap image generation failed for $workspace_name at $workspace_dir"
        cat /tmp/generate_site_images_output.log
        return 1
    fi
    return 0
}

step_generate_sitemap_images() {
    echo ""
    echo "🔄 Step $((STEP_COUNT++)): Sitemap image generation ..."
    echo "================================================="
    echo " * ONLY FOR WORKSPACES WITH CHANGES * "
    echo ""

    if [ ${#CHANGED_WORKSPACES[@]} -eq 0 ]; then
        echo "ℹ️  No changed workspaces to generate sitemap images for"
        return
    fi

    for workspace_dir in "${CHANGED_WORKSPACES[@]}"; do
        if [ -d "$workspace_dir" ] && [ -f "$workspace_dir/package.json" ]; then
            local workspace_name
            workspace_name=$(node -p "require('$workspace_dir/package.json').name" 2>/dev/null || basename "$workspace_dir")
            local workspace_path
            workspace_path=$(basename "$workspace_dir")

            echo ""
            echo "📍 Generating sitemap images: $workspace_name"
            echo "================================================="
            pushd "$workspace_dir" >/dev/null

            if ! generate_sitemap_images_for_workspace "$workspace_name" "$workspace_path"; then
                IMAGE_FAILURES+=("$workspace_name")
            fi

            popd >/dev/null
        fi
    done
}

step_prompt_version() {
    echo ""
    echo "🏷️  Step $((STEP_COUNT++)): Version bump..."
    echo "================================================="
    VERSION_TYPE=$(prompt_version_type)
}

step_bump_version() {
    if [ "$VERSION_TYPE" != "none" ]; then
        bump_version "$VERSION_TYPE"
        NEW_VERSION=$(get_current_version)
        echo "✅ Bumped to version $NEW_VERSION"
    fi
}

bump_workspace_package() {
    local workspace_dir="$1"
    local workspace_name
    workspace_name=$(node -p "require('$workspace_dir/package.json').name" 2>/dev/null || basename "$workspace_dir")
    echo "🔖 Bumping $workspace_name"
    pushd "$workspace_dir" >/dev/null
    npm version "$VERSION_TYPE" --force --no-git-tag-version
    popd >/dev/null
}

bump_all_workspaces() {
    if [ "$VERSION_TYPE" = "none" ]; then
        echo "ℹ️  Skipping version bump for all workspaces"
        return
    fi

    echo ""
    echo "🏷️  Step $((STEP_COUNT++)): Bump all changed apps with '$VERSION_TYPE'..."
    echo "================================================="
    if [ ${#CHANGED_WORKSPACES[@]} -eq 0 ]; then
        echo "ℹ️  No changed apps detected. Skipping bump."
        return
    fi
    for workspace_dir in "${CHANGED_WORKSPACES[@]}"; do
        if [ -f "$MONOREPO_ROOT/$workspace_dir/package.json" ]; then
            bump_workspace_package "$MONOREPO_ROOT/$workspace_dir"
        fi
    done
    NEW_VERSION="$VERSION_TYPE"
    echo "✅ Applied '$VERSION_TYPE' bump to changed apps"
}

step_commit_changes() {
    echo ""
    echo "💾 Step $((STEP_COUNT++)): Commit..."
    echo "================================================="
    COMMIT_MESSAGE=$(prompt_commit_message)
    git add . -v
    if git diff --cached --quiet; then
        echo "ℹ️  No changes to commit"
    else
        git commit -m "$COMMIT_MESSAGE"
        echo "✅ Committed: $COMMIT_MESSAGE"
    fi
}

step_push_dev() {
    echo ""
    echo "📤 Step $((STEP_COUNT++)): Push dev..."
    echo "================================================="
    git_push_dev_with_retry "$REMOTE_NAME"
    echo "✅ Dev pushed successfully"
}

step_push_tags() {
    echo ""
    echo "🏷️  Step $((STEP_COUNT++)): Push tags..."
    echo "================================================="
    if [ -z "$NEW_VERSION" ] || [[ "$NEW_VERSION" =~ ^(patch|minor|major|none)$ ]]; then
        NEW_VERSION=$(get_current_version)
    fi
    git_push_tags "$REMOTE_NAME" "$NEW_VERSION" "$COMMIT_MESSAGE"
}

step_push_to_main() {
    echo ""
    echo "📤 Step $((STEP_COUNT++)): Push to main..."
    echo "================================================="
    git_push_to_main "$REMOTE_NAME"
}

step_verify_github_token() {
    echo ""
    echo "🔑 Step $((STEP_COUNT++)): Locating GitHub token in config..."
    echo "================================================="
    local config_paths=("src/app/config/pixelated.config.json" "src/config/pixelated.config.json" "src/pixelated.config.json")
    for cfg in "${config_paths[@]}"; do
        if [ -f "$cfg" ]; then
            local token
            token=$(node -e "try{const fs=require('fs');const p=process.argv[1];const d=JSON.parse(fs.readFileSync(p,'utf8'));const v=d.GITHUB_TOKEN||(d.github&&d.github.token)||d.github_token||(d.tokens&&d.tokens.github&&d.tokens.github.token); if(v) console.log(v)}catch(e){}" "$cfg" 2>/dev/null || true)
            if [ -n "$token" ]; then
                export GITHUB_TOKEN="$token"
                GITHUB_TOKEN_SOURCE="$cfg"
                echo "✅ GITHUB token loaded from $cfg"
                return
            fi
        fi
    done
    
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "⚠️  GITHUB_TOKEN not set; GitHub release creation will be skipped"
    fi
}

step_verify_dist_config() {
    echo ""
    echo "📋 Step $((STEP_COUNT++)): Verifying dist config..."
    echo "================================================="
    # Check for dist/pixelated.config.json or dist/pixelated.config.json.enc
    if [ -f "dist/pixelated.config.json" ]; then
        echo "✅ Found plaintext config at dist/pixelated.config.json"
    elif [ -f "dist/pixelated.config.json.enc" ]; then
        echo "✅ Found encrypted config at dist/pixelated.config.json.enc"
    else
        echo "⚠️  No dist config found (this may be expected)"
    fi
}

step_create_github_release() {
    echo ""
    echo "📣 Step $((STEP_COUNT++)): Creating GitHub release..."
    echo "================================================="
    if [ -z "$GITHUB_TOKEN" ]; then
        echo "⚠️  GITHUB_TOKEN not set; skipping GitHub release creation"
        return
    fi
    
    if [ -z "$NEW_VERSION" ]; then
        NEW_VERSION=$(get_current_version)
    fi
    
    local release_tag="v${NEW_VERSION}"
    local remote_url
    remote_url=$(git remote get-url "$REMOTE_NAME" 2>/dev/null || true)
    
    # Derive owner/repo from remote URL
    local repo_path
    repo_path="${remote_url#git@github.com:}"
    repo_path="${repo_path#https://github.com/}"
    repo_path="${repo_path%.git}"
    repo_path="${repo_path%%/}"
    
    if [ -z "$repo_path" ]; then
        echo "⚠️  Unable to determine repo path from remote URL; skipping release"
        return
    fi
    
    echo "Repo: $repo_path, Tag: $release_tag"
    
    # Check if release exists
    if curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$repo_path/releases/tags/$release_tag" | grep -q '"tag_name"'; then
        echo "ℹ️  Release for $release_tag already exists"
    else
        echo "🔔 Creating GitHub release for $release_tag"
        local payload
        payload=$(printf '{"tag_name":"%s","name":"%s","body":"%s","draft":false,"prerelease":false}' "$release_tag" "$release_tag" "${COMMIT_MESSAGE//\"/\\\"}")
        local resp
        resp=$(curl -s -X POST -H "Authorization: token $GITHUB_TOKEN" -H "Content-Type: application/json" -d "$payload" "https://api.github.com/repos/$repo_path/releases")
        if echo "$resp" | grep -q '"id"'; then
            echo "✅ Created GitHub release $release_tag"
        else
            echo "❌ Failed to create GitHub release: $resp"
        fi
    fi
}

step_npm_publish() {
    echo ""
    echo "📚 Step $((STEP_COUNT++)): Publishing to npm..."
    echo "================================================="
    if [ "$CONTEXT_TYPE" != "component" ]; then
        echo "ℹ️  Not a component library; skipping npm publish"
        return
    fi
    
    read -p "Publish to npm? (y/N): " publish_npm
    publish_npm=${publish_npm:-n}
    
    if [[ "$publish_npm" =~ ^[Yy] ]]; then
        if npm publish --access public; then
            echo "✅ Published to npm"
        else
            echo "❌ Failed to publish to npm"
            return 1
        fi
    else
        echo "ℹ️  Skipping npm publish"
    fi
}

step_git_subtree_deploy() {
    echo ""
    echo "🚀 Step $((STEP_COUNT++)): Git Subtree Push (if applicable)..."
    echo "================================================="
    if [ "$CONTEXT_TYPE" != "app" ] && [ "$CONTEXT_TYPE" != "tool" ]; then
        echo "ℹ️  Not an app/tool - skipping git subtree push"
        return
    fi
    
    local APP_TYPE
    if [[ "$WORKSPACE_ROOT" == "$MONOREPO_ROOT"/apps/* ]]; then
        APP_TYPE="apps"
    elif [[ "$WORKSPACE_ROOT" == "$MONOREPO_ROOT"/tools/* ]]; then
        APP_TYPE="tools"
    else
        return
    fi
    
    echo "📤 Deploying app/tool via git subtree push..."
    
    local repository_url
    repository_url=$(get_workspace_repository_url 2>/dev/null || true)
    local MATCHING_REMOTE=""

    if [ -n "$repository_url" ]; then
        echo "ℹ️  Resolving remote from package.json repository metadata..."
        MATCHING_REMOTE=$(find_remote_by_repository_url "$repository_url" 2>/dev/null || true)
    fi

    if [ -z "$MATCHING_REMOTE" ] && [ -n "$APP_NAME" ]; then
        MATCHING_REMOTE=$(git remote | grep -x "$APP_NAME" | head -1 || true)
    fi

    if [ -z "$MATCHING_REMOTE" ]; then
        if [ -n "$repository_url" ]; then
            echo "⚠️  No git remote found matching repository.url '$repository_url'; skipping subtree push"
        else
            echo "⚠️  No repository metadata found in package.json and no remote found matching app name '$APP_NAME'; skipping subtree push"
        fi
        return
    fi
    
    if git subtree push --prefix="$APP_TYPE/$APP_NAME" "$MATCHING_REMOTE" main; then
        echo "✅ Git subtree push successful"
    else
        echo "⚠️  Git subtree push had an issue - this may be normal if there are no new changes"
    fi
}

# ============================================================
# SUMMARY FUNCTIONS (print final status)
# ============================================================

print_summary_full() {

    echo ""
    echo "================================================="
    echo "✅ FULL RELEASE COMPLETE"
    echo "   Version: $NEW_VERSION"
    echo "   Remote: $REMOTE_NAME"
    echo "   Published to npm: $([ "$CONTEXT_TYPE" = "component" ] && echo "Yes" || echo "N/A")"
    echo "   Git subtree deployed: $([ "$CONTEXT_TYPE" = "app" ] && echo "Yes" || echo "N/A")"
    echo "================================================="
}

# ============================================================
# WORKFLOW DEFINITIONS (sequences of steps)
# ============================================================

run_full_workflow() {

    echo ""
    echo "================================================="
    echo "🚀 FULL RELEASE: Complete release cycle"
    echo "================================================="
    
    if [ "$CONTEXT_TYPE" = "root" ]; then
        cd "$MONOREPO_ROOT"
    else
        cd "$WORKSPACE_ROOT"
    fi

    PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "unknown-project")
    CURRENT_DIR=$(pwd)

    echo "📦 Context: $PROJECT_NAME ($CONTEXT_TYPE)"
    echo ""
    
    # Run full workflow steps
    step_check_dev_branch
    step_select_remote
    echo ""
    collect_changed_workspaces
    step_generate_sitemap_images
    step_verify_github_token
    step_verify_dist_config
    step_prompt_version
    if [ "$CONTEXT_TYPE" = "root" ]; then
        bump_all_workspaces
    else
        step_bump_version
    fi
    step_commit_changes
    step_push_dev
    step_push_tags
    step_push_to_main
    step_create_github_release
    step_npm_publish
    step_git_subtree_deploy
    print_summary_full
}

run_monorepo_workflow() {
    echo ""
    echo "================================================="
    echo "🚀 MONOREPO RELEASE: Deploy apps/tools via git subtree"
    echo "================================================="

    cd "$MONOREPO_ROOT"

    local remotes
    remotes=$(git remote | sort)
    local remotes_array=($remotes)
    local remotes_count=${#remotes_array[@]}

    if [ $remotes_count -eq 0 ]; then
        echo "❌ No git remotes configured"
        echo "Run: ./setup-remotes.sh"
        exit 1
    fi

    echo "📦 Available remotes to deploy:"
    echo ""
    for i in "${!remotes_array[@]}"; do
        num=$((i+1))
        echo "$num) ${remotes_array[$i]}"
    done
    echo "$((remotes_count+1))) All"
    echo ""

    read -p "Select remotes to deploy (comma-separated numbers, or enter for all): " selection
    selection=${selection:-$((remotes_count+1))}

    local deploy_remotes=()
    if [ "$selection" = "$((remotes_count+1))" ]; then
        deploy_remotes=("${remotes_array[@]}")
    else
        IFS=',' read -ra indices <<< "$selection"
        for idx in "${indices[@]}"; do
            idx=$(echo $idx | xargs)
            if [[ $idx =~ ^[0-9]+$ ]] && [ $idx -gt 0 ] && [ $idx -le $remotes_count ]; then
                deploy_remotes+=("${remotes_array[$((idx-1))]}")
            fi
        done
    fi

    if [ ${#deploy_remotes[@]} -eq 0 ]; then
        echo "❌ No valid remotes selected"
        exit 1
    fi

    echo ""
    echo "🎯 Deploying to: ${deploy_remotes[@]}"
    echo ""

    local failed=()
    local success=()

    for remote in "${deploy_remotes[@]}"; do
        echo "-------------------------------------------"
        echo "📤 Pushing to: $remote"

        local app_path=""
        if [ -d "apps/$remote" ]; then
            app_path="apps/$remote"
        elif [ -d "tools/$remote" ]; then
            app_path="tools/$remote"
        elif [ -d "packages/$remote" ]; then
            app_path="packages/$remote"
        else
            echo "❌ Could not find app/tool folder for '$remote'"
            failed+=("$remote (folder not found)")
            continue
        fi

        if git subtree push --prefix="$app_path" "$remote" main 2>/dev/null; then
            echo "✅ Successfully deployed $remote"
            success+=("$remote")
        else
            echo "⚠️  Git subtree push encountered an issue for $remote"
            echo "   This might be normal if there are no changes to push."
            success+=("$remote (with warnings)")
        fi
        echo ""
    done

    echo "================================================="
    echo "📊 Deployment Summary"
    echo "================================================="
    echo "✅ Successful: ${#success[@]}"
    for item in "${success[@]}"; do
        echo "   - $item"
    done

    if [ ${#failed[@]} -gt 0 ]; then
        echo "❌ Failed: ${#failed[@]}"
        for item in "${failed[@]}"; do
            echo "   - $item"
        done
    fi

    echo ""
}

# ============================================================
# MAIN DISPATCHER
# ============================================================

# Detect context early (sets CONTEXT_TYPE, APP_NAME)
detect_context

#if [ "$MONOREPO_MODE" = true ]; then
#    run_monorepo_workflow
#fi

#if [ "$MONOREPO_MODE" = true ]; then
#    echo "⚠️  --monorepo flow is currently disabled."
#    exit 1
#fi

run_full_workflow
