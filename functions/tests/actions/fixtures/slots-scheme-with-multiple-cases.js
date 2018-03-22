module.exports = [{
  name: 'plates',

  slots: [
    'plate',
    'category',
  ],

  condition: 'category == "plates"',

  prompts: [{
    requirements: [
      'plate'
    ],

    speech: [
      'Which plate?',
    ],
  }]
}, {
  name: 'albums',

  slots: [
    'album',
    'category',
  ],

  prompts: [{
    requirements: [
      'album'
    ],

    speech: [
      'Which album?',
    ],
  }],
}];
