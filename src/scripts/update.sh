#!/usr/bin/env bash
set -euo pipefail

MONOREPO_ROOT=$(git rev-parse --show-toplevel)
CURRENT_DIR=$(pwd)
WORKSPACE_ROOT=""
CONTEXT_TYPE=""
WORKSPACE_DIRS=()

find_workspace_root() {
    local dir="$CURRENT_DIR"
    while [ "$dir" != "$MONOREPO_ROOT" ] && [ "$dir" != "/" ]; do
        if [ -f "$dir/package.json" ]; then
            echo "$dir"
            return 0
        fi
        dir=$(dirname "$dir")
    done

    echo "$CURRENT_DIR"
}

detect_context() {
    WORKSPACE_ROOT=$(find_workspace_root)
    if [ "$WORKSPACE_ROOT" = "$MONOREPO_ROOT" ]; then
        CONTEXT_TYPE="root"
        WORKSPACE_DIRS=("$MONOREPO_ROOT" "$MONOREPO_ROOT/packages/*" "$MONOREPO_ROOT/apps/*" "$MONOREPO_ROOT/tools/*")
    else
        CONTEXT_TYPE="workspace"
        WORKSPACE_DIRS=("$WORKSPACE_ROOT")
    fi
}

run_update_in_dir() {
    local workspace_dir="$1"
    if [ ! -f "$workspace_dir/package.json" ]; then
        return
    fi

    echo ""
    echo "================================================="
    echo "📦 Updating dependencies in: $workspace_dir"
    echo "================================================="
    pushd "$workspace_dir" > /dev/null || return

    local SKIP_PACKAGES=""
    local OPTIONAL_PACKAGES=""
    if command -v jq &> /dev/null; then
        SKIP_PACKAGES=$(jq -r '.devDependencies // {} | to_entries[] | select(.value | test("^[0-9]")) | .key' package.json 2>/dev/null | paste -sd '|' - || echo "")
        OPTIONAL_PACKAGES=$(jq -r '.optionalDependencies // {} | keys[]' package.json 2>/dev/null | paste -sd '|' - || echo "")
    fi

    for type in "" --dev --optional; do
        case $type in
            "") flag=""; installArgs="--save" ;;
            --dev) flag="--include=dev"; installArgs="--save-dev" ;;
            --optional) flag="--include=optional"; installArgs="--save-optional" ;;
        esac

        if [ "$type" = "--optional" ]; then
            if [ -z "$OPTIONAL_PACKAGES" ]; then
                UPDATES=""
            elif [ -n "$SKIP_PACKAGES" ]; then
                UPDATES=$(npm outdated $flag | awk 'NR>1 {print $1"@"$4}' | grep -E "^($OPTIONAL_PACKAGES)@" | grep -vE "^($SKIP_PACKAGES)@" || true)
            else
                UPDATES=$(npm outdated $flag | awk 'NR>1 {print $1"@"$4}' | grep -E "^($OPTIONAL_PACKAGES)@" || true)
            fi
        elif [ -n "$SKIP_PACKAGES" ]; then
            UPDATES=$(npm outdated $flag | awk 'NR>1 {print $1"@"$4}' | grep -vE "^($SKIP_PACKAGES)@" || true)
        else
            UPDATES=$(npm outdated $flag | awk 'NR>1 {print $1"@"$4}' || true)
        fi

        if [ -n "$UPDATES" ]; then
            echo ""
            echo "================================================="
            echo "Updating $type packages in $workspace_dir..."
            echo "================================================="
            echo "Packages to install:"
            printf '%s\n' $UPDATES
            if [ "$type" = "--peer" ]; then
                echo "peer deps need manual bumping: $UPDATES"
            else
                echo "$UPDATES" | xargs npm install --force $installArgs 2>/dev/null || true
            fi
            echo "✅ Updated $type packages"
        else
            echo "✅ No $type updates needed"
        fi
    done

    echo ""
    echo "================================================="
    echo "Checking peer dependencies for updates in $workspace_dir..."
    echo "================================================="
    {
        if command -v jq &> /dev/null; then
            peers=$(jq -r '.peerDependencies // {} | to_entries[] | "\(.key)=\(.value)"' package.json 2>/dev/null)
            if [ -n "$peers" ]; then
                while IFS='=' read -r pkgname current_constraint; do
                    if [ -n "$pkgname" ]; then
                        installed=$(npm ls "$pkgname" --depth=0 2>/dev/null | grep "$pkgname" | sed 's/.*@\([0-9.]*\).*/\1/' | head -1)
                        latest=$(npm view "$pkgname" version 2>/dev/null)
                        if [ -n "$latest" ] && [ -n "$installed" ]; then
                            if [ "$latest" != "$installed" ]; then
                                echo "📦 Updating peer dependency: $pkgname from $installed to $latest"
                                npm install "$pkgname@$latest" --save-peer 2>/dev/null || npm install "$pkgname@$latest" --save-dev 2>/dev/null || true
                            else
                                echo "✅ $pkgname is up to date ($latest)"
                            fi
                        fi
                    fi
                done <<< "$peers"
            else
                echo "✅ No peer dependencies to update"
            fi
        else
            echo "⚠️  jq not found - skipping peer dependency updates"
            echo "   Run 'npm ls --peer' to check peer dependencies manually"
        fi
    } || true

    echo ""
    echo "================================================="
    echo "Updating Audit Fixes in $workspace_dir..."
    echo "================================================="
    npm audit fix 2>/dev/null || true

    popd > /dev/null || true
}

main() {
    detect_context
    shopt -s nullglob

    if [ "$CONTEXT_TYPE" = "root" ]; then
        for workspace_pattern in "${WORKSPACE_DIRS[@]}"; do
            for workspace_dir in $workspace_pattern; do
                if [ -d "$workspace_dir" ]; then
                    run_update_in_dir "$workspace_dir"
                fi
            done
        done
    else
        run_update_in_dir "$WORKSPACE_ROOT"
    fi
}

main
