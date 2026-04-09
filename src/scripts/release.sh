#!/bin/bash

# Universal Release Script for Pixelated Projects
# Three modes: --prep (validate all), --simple (monorepo commit), default (full release)
# Usage: 
#   bash release.sh              (full release process)
#   bash release.sh --prep       (validate: update → lint → build per-workspace)
#   bash release.sh --simple     (monorepo: version → commit → push with tags)

set -e

# ============================================================
# GLOBAL STATE (shared across all steps & workflows)
# ============================================================
PREP_MODE=false
SIMPLE_MODE=false
STEP_COUNT=1
declare -a LINT_FAILURES
declare -a BUILD_FAILURES
declare -a SUCCESSFUL_WORKSPACES
declare -a PUSH_ERRORS
UPDATE_FAILED=false
REMOTE_NAME=""
VERSION_TYPE=""
COMMIT_MESSAGE=""
NEW_VERSION=""
MONOREPO_ROOT=$(git rev-parse --show-toplevel)
PROJECT_NAME=""
CONTEXT_TYPE="unknown"
APP_NAME=""
GITHUB_TOKEN=""
GITHUB_TOKEN_SOURCE=""
RELEASE_MODE="both"

# Detect flags
if [[ "$*" == *"--prep"* ]]; then
    PREP_MODE=true
fi
if [[ "$*" == *"--simple"* ]]; then
    SIMPLE_MODE=true
fi

# ============================================================
# CONTEXT DETECTION (run early to populate CONTEXT_TYPE, APP_NAME)
# ============================================================

detect_context() {
    local current_dir=$(pwd)
    PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "")
    
    if [[ "$PROJECT_NAME" == "@pixelated-tech/components" ]] || [[ "$current_dir" == *"pixelated-components"* ]]; then
        CONTEXT_TYPE="component"
    elif [[ "$current_dir" == *"apps/"* ]] || [[ "$current_dir" == *"tools/"* ]]; then
        CONTEXT_TYPE="app"
        APP_NAME=$(basename "$current_dir")
    else
        CONTEXT_TYPE="standalone"
        # Try to use current directory name as app name for remote matching
        APP_NAME=$(basename "$current_dir")
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
    local_repo=$(basename "$(git rev-parse --show-toplevel)")
    
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

step_update_globally() {
    echo ""
    echo "📦 Step $((STEP_COUNT++)): Updating dependencies (once globally)..."
    echo "================================================="
    if ! npm run update > /tmp/update_output.log 2>&1; then
        echo "❌ Update failed"
        UPDATE_FAILED=true
        cat /tmp/update_output.log
    else
        echo "✅ Update completed"
    fi
}

step_lint_build_per_workspace() {
    echo ""
    echo "🔄 Running lint + build for each workspace..."
    echo "================================================="
    echo ""
    
    for workspace_dir in "$MONOREPO_ROOT"/packages/* "$MONOREPO_ROOT"/apps/* "$MONOREPO_ROOT"/tools/*; do
        if [ -d "$workspace_dir" ] && [ -f "$workspace_dir/package.json" ]; then
            local workspace_name
            workspace_name=$(node -p "require('$workspace_dir/package.json').name" 2>/dev/null || basename "$workspace_dir")
            local workspace_path
            workspace_path=$(basename "$workspace_dir")
            
            echo ""
            echo "================================================="
            echo "📍 Processing: $workspace_name"
            echo "================================================="
            cd "$workspace_dir"
            
            local workspace_failed=false
            
            # Lint
            echo ""
            echo "  🔍 Linting $workspace_name..."
            if ! npm run lint > /tmp/lint_output.log 2>&1; then
                echo "❌ Lint failed for $workspace_name at $workspace_path"
                LINT_FAILURES+=("$workspace_name")
                workspace_failed=true
                cat /tmp/lint_output.log
            fi
            
            # Build (only if lint passed)
            if [ "$workspace_failed" = false ]; then
                echo "  🔨 Building $workspace_name..."
                if ! npm run build > /tmp/build_output.log 2>&1; then
                    echo "❌ Build failed for $workspace_name at $workspace_path"
                    BUILD_FAILURES+=("$workspace_name")
                    workspace_failed=true
                    cat /tmp/build_output.log
                fi
            fi
            
            if [ "$workspace_failed" = false ]; then
                echo "  ✅ $workspace_name complete"
                SUCCESSFUL_WORKSPACES+=("$workspace_name")
            fi
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
    if [ -z "$NEW_VERSION" ]; then
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
    if [ "$CONTEXT_TYPE" != "app" ]; then
        echo "ℹ️  Not an app/tool - skipping git subtree push"
        return
    fi
    
    local APP_TYPE
    if [[ "$CURRENT_DIR" == *"apps/"* ]]; then
        APP_TYPE="apps"
    elif [[ "$CURRENT_DIR" == *"tools/"* ]]; then
        APP_TYPE="tools"
    else
        return
    fi
    
    echo "📤 Deploying app/tool via git subtree push..."
    
    local MATCHING_REMOTE
    MATCHING_REMOTE=$(git remote | grep "$APP_NAME" | head -1)
    
    if [ -z "$MATCHING_REMOTE" ]; then
        echo "⚠️  No remote found matching app name '$APP_NAME'; skipping subtree push"
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

print_summary_prep() {
    echo ""
    echo "================================================="
    echo "📊 PREP MODE SUMMARY"
    echo "================================================="
    echo ""
    
    if [ "$UPDATE_FAILED" = true ]; then
        echo "❌ Update Phase: FAILED"
        echo ""
    else
        echo "✅ Update Phase: Completed"
        echo ""
    fi
    
    echo "✅ Successful Workspaces: ${#SUCCESSFUL_WORKSPACES[@]}"
    for ws in "${SUCCESSFUL_WORKSPACES[@]}"; do
        echo "   ✓ $ws"
    done
    echo ""
    
    if [ ${#LINT_FAILURES[@]} -gt 0 ]; then
        echo "❌ Lint Failures: ${#LINT_FAILURES[@]}"
        for ws in "${LINT_FAILURES[@]}"; do
            echo "   ✗ $ws"
        done
        echo ""
    fi
    
    if [ ${#BUILD_FAILURES[@]} -gt 0 ]; then
        echo "❌ Build Failures: ${#BUILD_FAILURES[@]}"
        for ws in "${BUILD_FAILURES[@]}"; do
            echo "   ✗ $ws"
        done
        echo ""
    fi
    
    echo "================================================="
    
    if [ "$UPDATE_FAILED" = true ] || [ ${#LINT_FAILURES[@]} -gt 0 ] || [ ${#BUILD_FAILURES[@]} -gt 0 ]; then
        echo "❌ PREP MODE FAILED: See errors above"
        exit 1
    else
        echo "✅ PREP MODE COMPLETE: All workspaces ready"
        exit 0
    fi
}

print_summary_simple() {
    echo ""
    echo "================================================="
    echo "✅ SIMPLE MODE COMPLETE"
    echo "   Version: $NEW_VERSION"
    echo "   Remote: $REMOTE_NAME"
    echo "   All changes pushed to dev and main with tags"
    echo "================================================="
}

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

run_prep_workflow() {
    echo ""
    echo "================================================="
    echo "🚀 PREP MODE: Update → Lint → Build per-workspace"
    echo "================================================="
    
    cd "$MONOREPO_ROOT"
    step_update_globally
    step_lint_build_per_workspace
    print_summary_prep
}

run_simple_workflow() {
    echo ""
    echo "================================================="
    echo "📦 SIMPLE MODE: Monorepo Version → Commit → Push"
    echo "================================================="
    
    step_check_dev_branch
    step_select_remote
    step_prompt_version
    step_bump_version
    step_commit_changes
    step_push_dev
    step_push_tags
    step_push_to_main
    print_summary_simple
}

run_full_workflow() {
    echo ""
    echo "================================================="
    echo "🚀 FULL RELEASE: Complete release cycle"
    echo "================================================="
    
    # Initialize project context
    PROJECT_NAME=$(node -p "require('./package.json').name" 2>/dev/null || echo "unknown-project")
    CURRENT_DIR=$(pwd)
    
    if [[ "$PROJECT_NAME" == "@pixelated-tech/components" ]] || [[ "$CURRENT_DIR" == *"pixelated-components"* ]]; then
        CONTEXT_TYPE="component"
    elif [[ "$CURRENT_DIR" == *"apps/"* ]] || [[ "$CURRENT_DIR" == *"tools/"* ]]; then
        CONTEXT_TYPE="app"
        APP_NAME=$(basename "$CURRENT_DIR")
    else
        CONTEXT_TYPE="standalone"
    fi
    
    echo "📦 Context: $PROJECT_NAME ($CONTEXT_TYPE)"
    echo ""
    
    # Run full workflow steps
    step_check_dev_branch
    step_select_remote
    step_verify_github_token
    step_verify_dist_config
    step_prompt_version
    step_bump_version
    step_commit_changes
    step_push_dev
    step_push_tags
    step_push_to_main
    step_create_github_release
    step_npm_publish
    step_git_subtree_deploy
    print_summary_full
}

# ============================================================
# MAIN DISPATCHER
# ============================================================

# Detect context early (sets CONTEXT_TYPE, APP_NAME)
detect_context

if [ "$PREP_MODE" = true ]; then
    run_prep_workflow
elif [ "$SIMPLE_MODE" = true ]; then
    run_simple_workflow
else
    run_full_workflow
fi
