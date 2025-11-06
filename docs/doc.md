# ===== BRIANWHALEY APP NOTES =====

## ===== CREATE APP =====

## install nvm

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash

### get bash profile working 

export NVM_DIR="$HOME/.nvm"                
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

touch ~/./Users/btwhaley/.bash_profile:source:1: no such file or directory: /Users/btwhaley/.profile
open -a TextEdit ~/.zshrc
Add : 
source /Users/btwhaley/.bash_profile
export PATH="$HOME/.npm-packages/bin:$PATH"

npx create-next-app@latest

npm run dev

https://localhost:3000

## ===== COMMON NPM COMMANDS =====

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
npm audit fix --force
npm install @brianwhaley/pixelated-components@latest --force --save

rm -rf node_modules && rm -rf package-lock.json && npm install --force

git config --list
git config --global user.name "Brian Whaley"
git config --global user.email brian.whaley@gmail.com
git config --global remote.brianwhaley.url https://github.com/brianwhaley/brianwhaley.git
git config --global core.editor "code --wait"
git fetch


## ===== CREATE NEW DEV BRANCH =====

git branch -a
git checkout -b dev

## ===== BUILD BRIANWHALEY APP =====

eslint --fix --ext .jsx --ext .js .
[//]: # npm --no-git-tag-version version patch
npm version major
npm version minor

eslint --fix
npm version patch --force
git add * -v
git commit -m "perf fixes in microinteractions, imgs"
git push brianwhaley dev --tags
git push brianwhaley dev:main

## ===== Hydration Error =====
https://www.reddit.com/r/nextjs/comments/1gabiqn/hydration_error_when_installing_nextjs_15/?rdt=34262
https://nextjs.org/docs/messages/react-hydration-error


## ===== AWS AMPLIFY CHANGES =====

https://github.com/aws-amplify/amplify-hosting/issues/3398

aws amplify update-app --app-id d1bwvapspanbnf --platform WEB_DYNAMIC --region us-east-2

aws amplify update-branch --app-id d1bwvapspanbnf --branch-name dev --framework 'Next.js - SSR' --region us-east-2

## ===== REMOVE REDIRECTS AND REWRITES FOR REACT APP =====
Source Address: </^[^c.]+$|\.(?!(css|gif|ico|jpg|jpeg|json|js|less|map|md|png|svg|txt|ttf|woff)$)([^.]+$)/>
Target Address: /index.html
Type: 200 Rewrite

Source Address: /<*>
Target Address: /
Type: 404 Rewrite

## ===== RESUME MICRO FORMATS =====
http://microformats.org/wiki/h-resume
http://microformats.org/wiki/h-card
http://microformats.org/wiki/h-event


## ===== RECIPE MICRO FORMATS =====
https://microformats.org/wiki/h-recipe



## ===== EMAIL FORWARDING =====
https://app.improvmx.com/
*@brianwhaley.tech => brian.whaley@gmail.com


# ===== IMAGE CDN WITH CLOUDINARY =====
https://cloudinary.com/blog/transparent_webp_format_cdn_delivery_based_on_visitors_browsers
https://cloudinary.com/blog/delivering_all_your_websites_images_through_a_cdn

# ===== EMAIL LIST MANAGEMENT WITH HUBSPOT =====

# ===== CALENDAR AND APPOINTMENT MANAGEMENT WITH HUBSPOT =====

# ===== CHECKOUT WITH PAYPAL ===== 
https://www.freecodecamp.org/news/integrate-paypal-into-html-css-js-product-pages/
https://dev.to/evansifyke/how-to-integrate-paypal-with-html-css-and-javascript-2mnb