#!/usr/bin/env bash

set -e

# Version key/value should be on his own line
PACKAGE_VERSION=$(grep -m1 version ./functions/package.json | awk -F: '{ print $2 }' | sed 's/[", ]//g')

# TODO: NPM install without libs of Google Actions
# by using something like https://www.npmjs.com/package/install-subset

checkit='\xE2\x9C\x85'
echo -e "$checkit  deploy alexa skill"

rm -fdr ./deploy/alexa
mkdir -p ./deploy/alexa

cp -r ./functions/src ./deploy/alexa/
cp ./functions/index-alexa.js ./deploy/alexa/index-alexa.js
cp ./functions/package.json ./deploy/alexa/package.json
# aws-sdk is already available in AWS Lambda running the app, we delete it to
# reduce the filesize because the unzipped code must be < 250MB
# `npm install -g node-prune` is required
(cd ./deploy/alexa/; npm install --production; rm -rf node_modules/aws-sdk; node-prune node_modules)
# TODO show size of unzipped (it should be less then 250M)

# zip files
echo -e "$checkit  zip files"
FILE_NAME=skill-${PACKAGE_VERSION}.zip
(cd ./deploy/alexa/; zip --quiet -r ../${FILE_NAME} *)

# Disabled auto upload to s3 for now.
# echo -e "$checkit  upload to S3"
# aws --debug s3 cp "./deploy/alexa/${FILE_NAME}" s3://internet-archive-repo/

echo -e "$checkit  well done!"
