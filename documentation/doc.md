
git remote add pixelated-components https://github.com/brianwhaley/pixelated-components.git
npm config set registry https://registry.npmjs.org
npm login --scope=@brianwhaley --registry=https://registry.npmjs.org

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save

eslint --fix --ext .jsx --ext .js --ext .tsx --ext .ts . 
npm run build
npm version patch
git add * -v
git commit -m "module type fix"
git push pixelated-components dev
npm publish
git push pixelated-components dev:main -f
https://www.npmjs.com/package/@brianwhaley/pixelated-components


https://www.dhiwise.com/post/how-to-structure-and-organize-react-css-modules
