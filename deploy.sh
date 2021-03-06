#!/usr/bin/env sh

# abort on errors
set -e

rm -rf dist

# build
npm run build

cd dist
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:fazendadosoftware/bc-map-landing-page.git master:gh-pages
cd -
