# ===== PALMETTO-EPOXY APP NOTES =====

## ===== CREATE APP =====

npx create-next-app@latest

npm run dev

https://localhost:3000

## ===== COMMON NPM COMMANDS =====

git remote add palmetto-epoxy https://github.com/brianwhaley/palmetto-epoxy.git

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
npm audit fix --force
npm install @pixelated-tech/components@latest --force --save

rm -rf node_modules && rm -rf package-lock.json && npm install --force

npm version major
npm version minor

eslint --fix



## ===== BUILD PALMETTO-EPOXY APP =====

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
npm audit fix --force
npm run lint
npm version patch --force
git add * -v
git commit -m "https://www.cve.org/CVERecord?id=CVE-2025-55184"
git push palmetto-epoxy dev --tags
git push palmetto-epoxy dev:main


## ===== ARTWORK =====
https://www.freepik.com/free-vector/rainbow-coloured-watercolour-splatter-design-0307_58525796.htm#fromView=keyword&page=1&position=1&uuid=368642c7-d47f-457a-876f-a35218120abf&query=Watercolor+Splatter

## ===== SET UP GODADDY TO POINT TO AMPLIFY =====
https://www.google.com/search?q=how+to+set+up+godaddy+nameservers+to+point+to+amplify&oq=how+to+set+up+godaddy+nameservers+to+point+to+amplify+&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCTEyNjI5ajBqMagCALACAA&sourceid=chrome&ie=UTF-8