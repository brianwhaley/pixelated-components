# ===== PixelVivid APP NOTES =====

## ===== CREATE APP =====

## install nvm

### get bash profile working 

## ===== COMMON NPM COMMANDS =====

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
npm audit fix --force
npm install @pixelated-tech/components@latest --force --save

rm -rf node_modules && rm -rf package-lock.json && npm install --force

git config --list
git config --global user.name "Brian Whaley"
git config --global user.email brian.whaley@gmail.com
git config --global remote.informationfocus.url https://github.com/brianwhaley/informationfocus.git
git config --global core.editor "code --wait"
git fetch

eslint --fix --ext .jsx --ext .js .
[//]: # npm --no-git-tag-version version patch
npm version major
npm version minor

eslint --fix


## ===== CREATE NEW DEV BRANCH =====

git branch -a
git checkout -b dev

## ===== BUILD INFORMATIONFOCUS APP =====

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
npm audit fix --force
npm version patch --force
git add * -v
git commit -m "fix for missing proxy file"
git push informationfocus dev --tags
git push informationfocus dev:main

## ===== AWS AMPLIFY CHANGES =====

https://github.com/aws-amplify/amplify-hosting/issues/3398

aws amplify update-app --app-id d1p5oldpldjwqc --platform WEB_DYNAMIC --region us-east-2

aws amplify update-branch --app-id d1p5oldpldjwqc --branch-name dev --framework 'Next.js - SSR' --region us-east-2

aws amplify update-branch --app-id d1p5oldpldjwqc --branch-name main --framework 'Next.js - SSR' --region us-east-2

REVERT COMMAND: 
aws amplify update-app --appId d1p5oldpldjwqc --region us-east-2 --platform WEB_DYNAMIC

, {
    "source": "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>",
    "status": "200",
    "target": "/index.html"
  }

# ===== GOOGLE ANALYTICS =====

# ===== GOOGLE PROGRAMMABLE SEARCH =====