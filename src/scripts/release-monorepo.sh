#!/bin/bash

# Monorepo Release Deployment Script
# Handles git subtree push to individual app/tool remotes with interactive selection

set -e

MONOREPO_ROOT=$(git rev-parse --show-toplevel)
cd "$MONOREPO_ROOT"

echo ""
echo "================================================="
echo "🚀 Pixelated Tech Monorepo - Deploy to Apps/Tools"
echo "================================================="
echo ""

# Get list of available remotes from setup-remotes.sh
REMOTES=$(git remote | sort)
REMOTES_ARRAY=($REMOTES)
REMOTES_COUNT=${#REMOTES_ARRAY[@]}

if [ $REMOTES_COUNT -eq 0 ]; then
    echo "❌ No git remotes configured"
    echo "Run: ./setup-remotes.sh"
    exit 1
fi

echo "📦 Available remotes to deploy:"
echo ""
for i in "${!REMOTES_ARRAY[@]}"; do
    num=$((i+1))
    echo "$num) ${REMOTES_ARRAY[$i]}"
done
echo "$((REMOTES_COUNT+1))) All"
echo ""

read -p "Select remotes to deploy (comma-separated numbers, or enter for all): " selection
selection=${selection:-$((REMOTES_COUNT+1))}

# Parse selection and build array of remotes to deploy
DEPLOY_REMOTES=()

if [ "$selection" = "$((REMOTES_COUNT+1))" ]; then
    DEPLOY_REMOTES=("${REMOTES_ARRAY[@]}")
else
    IFS=',' read -ra INDICES <<< "$selection"
    for idx in "${INDICES[@]}"; do
        idx=$(echo $idx | xargs)  # trim whitespace
        if [[ $idx =~ ^[0-9]+$ ]] && [ $idx -gt 0 ] && [ $idx -le $REMOTES_COUNT ]; then
            DEPLOY_REMOTES+=("${REMOTES_ARRAY[$((idx-1))]}")
        fi
    done
fi

if [ ${#DEPLOY_REMOTES[@]} -eq 0 ]; then
    echo "❌ No valid remotes selected"
    exit 1
fi

echo ""
echo "🎯 Deploying to: ${DEPLOY_REMOTES[@]}"
echo ""

# Deploy each selected remote
FAILED=()
SUCCESS=()

for REMOTE in "${DEPLOY_REMOTES[@]}"; do
    echo "-------------------------------------------"
    echo "📤 Pushing to: $REMOTE"
    
    # Determine the app/tool type and name
    # Try to find matching folder in apps/, tools/, or packages/
    APP_PATH=""
    APP_NAME=""
    
    if [ -d "apps/$REMOTE" ]; then
        APP_PATH="apps/$REMOTE"
        APP_NAME=$REMOTE
    elif [ -d "tools/$REMOTE" ]; then
        APP_PATH="tools/$REMOTE"
        APP_NAME=$REMOTE
    elif [ -d "packages/$REMOTE" ]; then
        APP_PATH="packages/$REMOTE"
        APP_NAME=$REMOTE
    else
        echo "❌ Could not find app/tool folder for '$REMOTE'"
        FAILED+=("$REMOTE (folder not found)")
        continue
    fi
    
    # Perform git subtree push
    if git subtree push --prefix="$APP_PATH" "$REMOTE" main 2>/dev/null; then
        echo "✅ Successfully deployed $REMOTE"
        SUCCESS+=("$REMOTE")
    else
        echo "⚠️  Git subtree push encountered an issue for $REMOTE"
        echo "   This might be normal if there are no changes to push."
        SUCCESS+=("$REMOTE (with warnings)")
    fi
    echo ""
done

# Summary
echo "================================================="
echo "📊 Deployment Summary"
echo "================================================="
echo "✅ Successful: ${#SUCCESS[@]}"
for item in "${SUCCESS[@]}"; do
    echo "   - $item"
done

if [ ${#FAILED[@]} -gt 0 ]; then
    echo "❌ Failed: ${#FAILED[@]}"
    for item in "${FAILED[@]}"; do
        echo "   - $item"
    done
fi

echo ""
