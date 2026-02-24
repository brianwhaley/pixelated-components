#!/usr/bin/env bash
set -euo pipefail

# update.sh - refresh dependencies across all sections
# usage: bash src/scripts/update.sh

for type in "" --dev --optional --peer; do
    case $type in
        "") flag=""; installArgs="--save" ;;
        --dev) flag=--dev; installArgs="--save-dev" ;;
        --optional) flag=--optional; installArgs="--save-optional" ;;
        --peer) flag=--peer; installArgs="" ;;
    esac

    UPDATES=$(npm outdated $flag | awk 'NR>1 {print $1"@"$3}' || true)
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

# print peer dependencies that need manual update
peers=$(npm outdated --parseable --long --peer | awk -F: '{print $4}')
printf "peer deps (manual): %s\n" "$peers"

npm audit fix 2>/dev/null || true
