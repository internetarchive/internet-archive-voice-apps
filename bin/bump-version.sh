#!/usr/bin/env bash

#
# Automatic script to bump version of repository
#
# - update git tag
# - regenerate changelog
# - push all changes to repository
#

checkit='\xE2\x9C\x85'
echo -e "$checkit  bump new version of repository"

echo -e "$checkit  pull master"
git checkout master
git pull

echo -e "$checkit  bump version"
(cd functions; npm version ${1:-patch})

PACKAGE_VERSION=$(cd functions; cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

echo -e "$checkit  new version is $PACKAGE_VERSION"

echo -e "$checkit  commit new version"
git commit -am ":rocket: bump to $PACKAGE_VERSION"

echo -e "$checkit  update tag"
git tag $PACKAGE_VERSION

echo -e "$checkit  push commit"
git push

echo -e "$checkit  push tag"
git push --tags

echo -e "$checkit  regenerate changeslog"
git-generate-changelog

echo -e "$checkit  commit changelog"
git commit -am ":scroll: changelog $PACKAGE_VERSION"

echo -e "$checkit  push change log"
git push

echo -e "$checkit  well done!"
