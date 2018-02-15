# Internet Archive Google Action [![Build Status](https://travis-ci.org/internetarchive/internet-archive-google-action.svg?branch=master)](https://travis-ci.org/internetarchive/internet-archive-google-action)

## How to make contributions?

:mag: get [one issue](https://github.com/internetarchive/internet-archive-google-action/issues/)
- create git branch `feature/<name-of-feature>`, [more](http://nvie.com/posts/a-successful-git-branching-model/)

:computer: working on it

Use [Mocha](https://mochajs.org/) for continuous checking of
your code quality and cover functionality by tests

```
npm run mocha -- --watch
```

:coffee: Complete checking of code by run unit tests and code style checking

```
npm test
```

:star2: We follow [standard javascript code style](https://standardjs.com/).

Automatic style fixing, it doesn't solve any problem but could be very helpful

```
npm run lint -- --fix
```

:tada: Finally make Pull Request and give complete description what have you done
and link the addressed issue.

Also it could be good practice to create your Pull Request earlier,
but add `WIP: ` at the beginning of its name! This way other developers
could see what are you working right now.
