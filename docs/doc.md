# ===== PixelVivid APP NOTES =====

## ===== CREATE APP =====

## install nvm

### get bash profile working 

## ===== COMMON NPM COMMANDS =====

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
npm audit fix --force
npm install @brianwhaley/pixelated-components@latest --force --save

rm -rf node_modules && rm -rf package-lock.json && npm install --force

git config --list
git config --global user.name "Brian Whaley"
git config --global user.email brian.whaley@gmail.com
git config --global remote.informationfocus.url https://github.com/brianwhaley/informationfocus.git
git config --global core.editor "code --wait"
git fetch

## ===== CREATE NEW DEV BRANCH =====

git branch -a
git checkout -b dev

## ===== BUILD PIXELATED APP =====

eslint --fix --ext .jsx --ext .js .
[//]: # npm --no-git-tag-version version patch
npm version major
npm version minor

eslint --fix
npm version patch --force
git add * -v
git commit -m "upgrade to nextjs, reorg home page, fix resume data, bump pixelated-components for micro animations, fix sitemap ebay ref"
git push informationfocus dev --tags
git push informationfocus dev:main

# ===== GOOGLE ANALYTICS =====

# ===== GOOGLE PROGRAMMABLE SEARCH =====