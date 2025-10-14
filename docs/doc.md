
https://docs.github.com/en/get-started/start-your-journey/uploading-a-project-to-github

git config --list
git config --global remote.leadscraper.url https://github.com/brianwhaley/leadscraper.git
git init
git branch -a
git checkout -b dev

npm install puppeteer

npm outdated | awk 'NR>1 {print $1"@"$4}' | xargs npm install --force --save
npm audit fix --force

eslint --fix
npm version patch --force
git add * -v
git commit -m "initial version"
git push leadscraper dev --tags
git push leadscraper dev:main
