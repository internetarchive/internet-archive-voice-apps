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

    prompts: [
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

    prompts: [
      'Which album?',
    ],
  }],
}];
