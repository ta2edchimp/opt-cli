if [ "$TRAVIS_BRANCH" != "master" ]; then
  exit 0
fi
./node_modules/.bin/all-contributors generate
README="README.md"
GH_TOKEN="GH_TOKEN"
GH_REF="GH_REF"
if [[ $(env 2> /dev/null | grep "$GH_TOKEN" | cut -d'=' -f1) != "$GH_TOKEN" ]] &&
  [[ $(env 2> /dev/null | grep "$GH_REF" | cut -d'=' -f1) != "$GH_REF" ]]; then
  exit 0
fi
if [[ $(git status 2> /dev/null | grep README | cut -d' ' -f4) == "$README" ]]; then
  ( git add "$README"
    git commit -m "docs(readme): updated contributors" -n
    git push --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
  )
fi
