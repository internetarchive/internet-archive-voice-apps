# Internet Archive Google Action [![Build Status](https://travis-ci.org/internetarchive/internet-archive-voice-apps.svg?branch=master)](https://travis-ci.org/internetarchive/internet-archive-voice-apps) [![Coverage Status](https://coveralls.io/repos/github/internetarchive/internet-archive-google-action/badge.svg?branch=master)](https://coveralls.io/github/internetarchive/internet-archive-google-action?branch=master)

## Watch Setup Tutorial video 
[Setup Tutorial - Internet Archive Voice Apps Google Action](https://youtu.be/YmNf6sWxT38)

## Setup Instructions
See the developer guide and release notes at https://developers.google.com/actions/ for more details.

### Steps for cloning project to your local machine
1. Fork repository.
2. Go to directory ::`git clone <repository link>`

### Steps for testing with Google Assistant
#### Create and setup project in Actions Console
1. Use the [Actions on Google](https://console.actions.google.com/) Console to add a new project with a name of your choosing and click Create Project.
2. Click `skip` ["Actions Console" label on top left]
3. Go to actions under build, and click `Add your first action`
4. select custom intent, then `build`
#### Create Action for the project
1. Click `CREATE` (continued from above step)
2. Go to `settings` and click `export and import`, then click `restore from zip`.
3. zip the contents of `dialogflow` in `models/dialogflow/` and use that zip to restore the project. 
#### Run Local Server
0. Run server local with colorful logs
0. Install node js if not installed before(Check for correct version of node by `node -v`.if not `nvm install 8.16.0` and `nvm use 8.16.0`)
1. `npm install -g firebase-tools` 
1. `firebase login`[On the opened tab in your browser,login with the same account you created project on google actions]
2. `touch functions/.runtimeconfig.json` (For windows cli clone touch repository to use it `git clone https://www.github.com/zacharyjbaldwin/touch-for-windows.git`)
2. `firebase init` (remove .firebaserc first)
3. `firebase projects:list`[displays projects list with your account]
3. `firebase use --add` (choose the project you created in actions console, give an alias name)
3. add fake keys (temporary workaround) refer [this](https://github.com/internetarchive/internet-archive-voice-apps/issues/434#issuecomment-453114249)
3.`firebase deploy --only functions`
4. `cd functions` and `npm install`
4. `DEBUG=ia:* npm start` (In windows `set debug=<project alias name>`then `npm start`)
#### Expose local server
To expose server to google assistant use [ngrok](https://ngrok.com/)
its free plan should be enough.

To publish 5000 port use:

```bash
ngrok http 5000
```

you should find url `https://<id>.ngrok.io/`.

#### Connect webhook to dialogflow
Go to the fullfillment section of your dialogflow draft copy of our app and after that you should use this url:

```bash
https://<id>.ngrok.io/<your project name>/us-central1/assistant
```

### Steps for testing with Alexa
The Alexa app workflow for dev/production is the following:
* We create a zip file with the app code.
* We upload the zip to an AWS S3 bucket.
* We edit the AWS Lambda app to load the new app zip file.
* In case the AWS Lambda app changes a lot (e.g. we upgrade Node version), its Lambda ID will change.
In that case, we need to edit the Alexa skill in https://developer.amazon.com/alexa/console/ask# to load the new Lambda app.
This final step is not required most of the times.
* We use https://developer.amazon.com/alexa/console/ask# to test the app.

More details follow.

Node 12 is required. There is a problem with newer Node versions, `bespoken-tools`
which is a key dependency, is not supporting it. Use `nvm install 12` and `nvm use 12`
to switch to Node 12 before running any other command.

The general idea is that there are 2 AWS S3 buckets, `dev` and `production`.
You can access them via https://aws.amazon.com/ -> sign in -> S3.
You need to create a `zip` with the app, you upload it to the relevant S3 bucket
and then you go to AWS Lambda `dev` / `production` to select which app
should be loaded via its S3 URL.
(AWS -> Lambda -> edit app -> "upload from S3 .zip file").

S3 buckets have multiple app versions. This way, you can also easily rollback to a previous version if needed.

The script that produces the `app.zip` that we upload to S3 is `bin/deploy-to-alexa-skill.sh`.
An important AWS Lambda limitation is that the unzip code filesize should be < 250MB.
To achieve that, we do:
```
(cd ./deploy/alexa/; npm install --production; rm -rf node_modules/aws-sdk; node-prune node_modules)
```
`aws-sdk` is already preinstalled in AWS Lambda, so we don't need it.

`npm install -g node-prune` is a pre-requisite. This tool removes files that are useless in production
and reduces the total filesize a lot.

After deploying to dev or production, use https://developer.amazon.com/alexa/console/ask#
`ACTIONS -> Test` for testing.

### Setup Env

#### Options

 - profile performance of requests
   Env Variable: `PROFILE_REQUESTS=true` (`false` by default)
   `firebase functions:config:set performance.requests=true`
## How to check if the project is sucessfully synced

type welcome in google assistant test
It reponds  <speak>Welcome to the music at the Internet Archive. Want to listen to 78s, Live concerts, Unlocked Recordings or Christmas music?</speak>

Now go to 

internet-archive-voice-apps\functions\src\strings.js
Find the text: welcome change acknowledge >Welcome to music at the Internet Archive(removing the)
type welcome in google assistant test
You will find the changes reflected as:<speak>Welcome to  music at the Internet Archive. Want to listen to 78s, Live concerts, Unlocked Recordings or Christmas music?</speak>

### How to make contributions?

:mag: get [one good first issue](https://github.com/internetarchive/internet-archive-google-action/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
assign yourself (if you have access) or write comment that you'd like to work on this issue.
That's help to prevent work overlapping.

_create git branch `feature/<name-of-feature>`, [more](http://nvie.com/posts/a-successful-git-branching-model/)_

:computer: working on it

_Use [Mocha](https://mochajs.org/) for continuous checking of
your code quality and cover functionality by tests_

```
npm run mocha -- --watch
```

:coffee: Complete checking of code by run unit tests and code style checking

```
npm test
```

:star2: We follow [standard javascript code style](https://standardjs.com/).

_Automatic style fixing, it doesn't solve all problems but could be very helpful_

```
npm run lint -- --fix
```

:tada: Finally make Pull Request and give complete description what have you done
and link the addressed issue.

_Also it could be good practice to create your Pull Request earlier,
but add `WIP:` at the beginning of its name! This way other developers
could see what are you working right now._
