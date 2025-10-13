
https://docs.github.com/en/get-started/start-your-journey/uploading-a-project-to-github

git config --list
git config --global remote.leadscraper.url https://github.com/brianwhaley/leadscraper.git
git init
git branch -a
git checkout -b dev

npm install axios cheerio
npm install papaparse
npm install puppeteer

eslint --fix
npm version patch --force
git add * -v
git commit -m "initial version"
git push pixelvivid dev --tags
git push pixelvivid dev:main
