module.exports = [{
  slots: [
    'category',
    'plate',
  ],

  conditions: [
    'category = "plates"'
  ],

  prompts: [{
    requirements: [
      'plate'
    ],

    prompts: [
      'Which plate?',
    ],
  }]
}, {
  slots: [
    'category',
    'album',
  ],

  prompts: [{
    requirements: [
      'plate'
    ],

    prompts: [
      'Which album?',
    ],
  }],
}];
