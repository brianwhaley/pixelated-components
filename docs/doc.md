Competitors

https://lakelandlandscaping.com/

https://professionallandscapellc.net/

https://www.brightview.com/local/bluffton-sc/landscape-services
https://www.ruppertlandscape.com/locations/hilton-head-sc/
https://www.palmettocoastal.net/
https://fathernatureinc.com/


## ===== FIRST TIME =====
git remote add oaktreelandscaping https://github.com/brianwhaley/oaktreelandscaping.git
git branch -M dev
git push -u oaktreelandscaping dev
git branch -M main
git push -u oaktreelandscaping main


## ===== ALL OTHER TIMESS
echo "Updating packages..." && npm outdated | awk 'NR>1 {print $1"@"$4}' | while read pkg; do echo "$pkg" >> /tmp/npm-updates.log && printf "." && npm install --force --save "$pkg" > /dev/null 2>&1; done && echo "\n\n✓ Updated packages:" && cat /tmp/npm-updates.log && rm /tmp/npm-updates.log
npm audit fix --force
npm version patch --force
git add * -v
git commit -m "basic information architecture, security fix"
git push -u oaktreelandscaping dev --tags
git push oaktreelandscaping dev:main