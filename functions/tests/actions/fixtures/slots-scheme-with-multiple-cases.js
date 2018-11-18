module.exports = [{
  name: 'plates',

  slots: [
    'plate',
    'category',
    'year',
  ],

  condition: 'category == "plates"',

  prompts: [{
    confirm: [
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
    confirm: [
      'album'
    ],

    speech: [
      'Which album?',
    ],
  }],
}];
