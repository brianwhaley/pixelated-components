#!/usr/bin/env bash
set -euo pipefail

# Centralized build script for pixelated-components
# Replaces the inline build command in package.json

echo ""
echo "================================================="
echo "🔨 Starting centralized build process"
echo "================================================="
echo ""

step=1

echo ""
echo "Step $((step++)): Validate Exports"
echo "================================================="
# directly run the validate script instead of npm wrapper
npx tsx src/scripts/validate-exports.js

echo ""
echo "Step $((step++)): Clean previous build"
echo "================================================="
rm -rf dist
echo "✅ Removed previous dist/ directory"

echo ""
echo "Step $((step++)): TypeScript build"
echo "================================================="
npx tsc --project tsconfig.json
echo "✅ TypeScript compilation completed"

echo ""
echo "Step $((step++)): Copy assets (rsync equivalent)"
echo "================================================="
# Copy CSS/SCSS/JSON and scripts from src into dist preserving structure
(cd src && tar -cf - $(find . -name "*.css" -o -name "*.scss" -o -name "*.json") scripts/) | tar -C dist -xf - || true
echo "✅ Copied assets to dist/ completed"

echo ""
echo "Step $((step++)): Prune unnecessary tsc output"
echo "================================================="
rm -rf dist/{images,stories,test,tests} || true
echo "✅ Pruned unnecessary files from dist/"

# Ensure encrypted config is present in dist (if available in src)
# This moves the responsibility of placing pixelated.config.json.enc into the build step
echo ""
echo "Step $((step++)): Ensure encrypted config is in dist (if available)"
echo "================================================="
DIST_DIR="dist"
ENC_DEST="$DIST_DIR/config/pixelated.config.json.enc"
PLAIN_DIST_CFG="$DIST_DIR/config/pixelated.config.json"

config_paths=("src/app/config/pixelated.config.json" "src/config/pixelated.config.json" "src/pixelated.config.json")
found_enc=false
for src in "${config_paths[@]}"; do
  if [ -f "${src}.enc" ]; then
    mkdir -p "$(dirname "${ENC_DEST}")"
    cp "${src}.enc" "$ENC_DEST"
    echo "✅ Copied ${src}.enc -> $ENC_DEST"
    found_enc=true
    break
  fi
done

# Remove plaintext config from dist if present (avoid shipping plaintext)
if [ -f "$PLAIN_DIST_CFG" ]; then
  echo "⚠️  Found plaintext config in dist at $PLAIN_DIST_CFG — removing it to avoid accidental publish."
  rm -f "$PLAIN_DIST_CFG"
  echo "✅ Removed $PLAIN_DIST_CFG"
else
  echo "ℹ️  No plaintext config found in dist."
fi

if [ "$found_enc" = false ]; then
  echo "ℹ️  No source .enc found in src; build did not place encrypted config. If you expect an encoded config, run 'npm run config:encrypt' and re-run build."
else
  echo "✅ Encrypted config ensured in dist"
fi

echo ""
echo "================================================="
echo "✅ Build finished"
echo "================================================="
echo ""
