#!/usr/bin/env bash
set -euo pipefail

# update.sh - refresh dependencies across all sections
# usage: bash src/scripts/update.sh

# Dynamically build skip list from packages with pinned versions (no ^, ~, or *)
if command -v jq &> /dev/null; then
    SKIP_PACKAGES=$(jq -r '.devDependencies // {} | to_entries[] | select(.value | test("^[0-9]")) | .key' package.json 2>/dev/null | paste -sd '|' - || echo "")
else
    SKIP_PACKAGES=""
fi

for type in "" --dev --optional; do
    case $type in
        "") flag=""; installArgs="--save" ;;
        --dev) flag="--include=dev"; installArgs="--save-dev" ;;
        --optional) flag="--include=optional"; installArgs="--save-optional" ;;
    esac

    if [ -n "$SKIP_PACKAGES" ]; then
        UPDATES=$(npm outdated $flag | awk 'NR>1 {print $1"@"$4}' | grep -vE "^($SKIP_PACKAGES)@" || true)
    else
        UPDATES=$(npm outdated $flag | awk 'NR>1 {print $1"@"$4}' || true)
    fi
    if [ -n "$UPDATES" ]; then
        echo "Updating $type packages: $UPDATES"
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

# Handle peer dependencies
echo ""
echo "Checking peer dependencies for updates..."
{
if command -v jq &> /dev/null; then
    peers=$(jq -r '.peerDependencies // {} | to_entries[] | "\(.key)=\(.value)"' package.json 2>/dev/null)
    if [ -n "$peers" ]; then
        while IFS='=' read -r pkgname current_constraint; do
            if [ -n "$pkgname" ]; then
                # Extract installed version from node_modules
                installed=$(npm ls "$pkgname" --depth=0 2>/dev/null | grep "$pkgname" | sed 's/.*@\([0-9.]*\).*/\1/' | head -1)
                # Get latest version
                latest=$(npm view "$pkgname" version 2>/dev/null)
                if [ -n "$latest" ] && [ -n "$installed" ]; then
                    # Only update if installed version is different from latest
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

npm audit fix 2>/dev/null || true
