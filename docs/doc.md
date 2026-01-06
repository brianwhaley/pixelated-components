
## SETUP INFORMATION
git remote add pixelated-components https://github.com/brianwhaley/pixelated-components.git
npm config set registry https://registry.npmjs.org
npm login --scope=@brianwhaley --registry=https://registry.npmjs.org

https://www.npmjs.com/package/@pixelated-tech/components

https://www.npmjs.com/package/@pixelated-tech/components



## MIGRATION SCRIPT
npm uninstall @pixelated-tech/components
npm install @pixelated-tech/components --save --force 

npm deprecate "@brianwhaley/pixelated-components@*" "DEPRECATED: Package renamed to @pixelated-tech/components; migrate to @pixelated-tech/components (see https://github.com/brianwhaley/pixelated-components)"

npm unpublish @brianwhaley/pixelated-components --force



## DEPLOYMENT SCRIPT
# New improved release script that properly syncs dev and main branches
npm run release
# Or run directly:
./scripts/release.sh

# Features:
# - Interactive version bumping (patch/minor/major/custom/none)
# - Proper dev->main branch synchronization
# - Optional npm publishing with OTP prompts
# - Works with any Pixelated project
# - Automatic git tagging

# Old script (deprecated - doesn't properly sync branches):
# npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
# npm audit fix --force
# npm run lint
# npm run build
# npm version patch --force
# git add . -v
# git commit -m "remove tailwind, add new seo metrics to on-site seo component, smartimage fallback error handling"
# git push -u pixelated-components dev --tags --force
# git push pixelated-components dev:main -f
# npm login
# npm publish --access public --otp=000000



https://www.dhiwise.com/post/how-to-structure-and-organize-react-css-modules


## Building for web and node modules
https://www.totaltypescript.com/concepts/mjs-cjs-mts-and-cts-extensions

package.json main vs module:
https://www.google.com/search?q=what+is+package.json+main+field+vs+module+field&oq=what+is+package.json+main+field+vs+module+field&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRigATIHCAIQIRigATIHCAMQIRigAdIBCDkzMzFqMWo3qAIAsAIA&sourceid=chrome&ie=UTF-8

how to get typescript to work with esm and cjs:
https://www.google.com/search?q=how+to+get+typescript+to+work+with+esm+and+cjs&num=10&sca_esv=fee75db914028769&sxsrf=AHTn8zqTwjKaSycv2DPzgapkwA96gEFmPA%3A1747832570507&ei=-s4taJXZHsqs5NoP2K-foAg&ved=0ahUKEwiVvvfbz7SNAxVKFlkFHdjXB4QQ4dUDCBA&uact=5&oq=how+to+get+typescript+to+work+with+esm+and+cjs&gs_lp=Egxnd3Mtd2l6LXNlcnAiLmhvdyB0byBnZXQgdHlwZXNjcmlwdCB0byB3b3JrIHdpdGggZXNtIGFuZCBjanMyCBAAGIAEGKIEMggQABiABBiiBDIIEAAYgAQYogRIxB9Q6w9Ynx1wAXgBkAEAmAFfoAGCBaoBATi4AQPIAQD4AQGYAgmgAqcFwgIKEAAYsAMY1gQYR8ICChAhGKABGMMEGArCAgUQIRirAsICCBAhGKABGMMEmAMAiAYBkAYIkgcDOC4xoAftF7IHAzcuMbgHogU&sclient=gws-wiz-serp 

## MULTIPLE WEBPACK CONFIGS
https://www.google.com/search?q=webpack+for+client+and+server+bundles&oq=webpack+for+client+and+server+bundles&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRigATIHCAIQIRigATIHCAMQIRigATIHCAQQIRifBTIHCAUQIRifBTIHCAYQIRifBTIHCAcQIRifBTIHCAgQIRifBTIHCAkQIRifBdIBCDk1ODBqMWo3qAIAsAIA&sourceid=chrome&ie=UTF-8

https://www.google.com/search?q=can+you+configure+webpack+for+both+client+and+server+components&num=10&sca_esv=8b5461fdae76c1f4&sxsrf=AHTn8zppxYpeAooyTFmfOVbeUXl0-NtmKA%3A1747580616602&ei=yPYpaNyfJPyxptQP5vaXUA&ved=0ahUKEwjco_mOpa2NAxX8mIkEHWb7BQoQ4dUDCBA&uact=5&oq=can+you+configure+webpack+for+both+client+and+server+components&gs_lp=Egxnd3Mtd2l6LXNlcnAiP2NhbiB5b3UgY29uZmlndXJlIHdlYnBhY2sgZm9yIGJvdGggY2xpZW50IGFuZCBzZXJ2ZXIgY29tcG9uZW50c0j6TlC_TFi_THADeAGQAQCYAVegAVeqAQExuAEDyAEA-AEBmAIDoAIMwgIKEAAYsAMY1gQYR5gDAIgGAZAGApIHATOgB3OyBwC4BwA&sclient=gws-wiz-serp

## MULTIPLE ENTRY POINTS : 
https://stackoverflow.com/questions/63058081/package-json-with-multiple-entrypoints
https://webpack.js.org/configuration/module/#rule


## Shields.io MD Badges
https://github.com/inttter/md-badges?tab=readme-ov-file 


# ===== IMAGE CDN WITH CLOUDINARY =====
https://cloudinary.com/blog/transparent_webp_format_cdn_delivery_based_on_visitors_browsers
https://cloudinary.com/blog/delivering_all_your_websites_images_through_a_cdn
