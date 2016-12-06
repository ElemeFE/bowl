set -e

if [[ -z $1 ]]; then
  echo "Enter new version: "
  read VERSION
else
  VERSION=$1
fi

read -p "Releasing v$VERSION - are you sure? (y/n)" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Releasing v$VERSION ..."

  # build
  VERSION=$VERSION npm run build

  # commit
  git add -A
  git commit -m "[build] v$VERSION"
  npm version $VERSION --message "[release] $VERSION"

  # publish
  git push eleme refs/tags/v$VERSION
  git push eleme master
  npm publish
fi
