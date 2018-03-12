module.exports = {
  name: 'one dialog',

  /**
   * slots which we need for fulfillement
   */
  slots: [
    'collection',
    'creatorId',
    'coverage',
    'year',
    'order',
  ],

  /**
   * default values for slots
   */
  defaults: {
    order: 'random',
  },

  presets: {
    'your-favourite-album': {
      acknowledges: [
        `Cool! You've chosen my favourite album.`,
      ],

      defaults: {
        creatorId: 'one-band',
        coverage: 'NY',
        year: 1999,
      },
    },

    'your-favourite-albums': {
      defaults: {
        creatorId: 'one-band',
        // we will explicitly skip this slot
        coverage: {skip: true},
        year: 1999,
      },
    },
  },

  acknowledges: [
    '{{coverage}} - good place!',
    '{{coverage}} {{year}} - great choice!',
    '{{year}} - it was excellent year!',
    'Ok! Lets go with {{__resolvers.creator.title}} band!',
    `You've selected {{__resolvers.collection.title}}`,
  ],

  prompts: [{
    /**
     * prompt for a single slot
     */
    requirements: [
      'collection'
    ],

    prompts: [
      'Would you like to listen to music from our collections of {{__resolvers.short-options.suggestions}}?',
    ],

    /**
     * Fixed set of suggestions
     */
    suggestions: [
      '78s',
      'Live Concerts',
    ],
  }, {
    /**
     * prompt for a single slot
     */
    requirements: [
      'creatorId'
    ],

    prompts: [
      'What artist would you like to listen to, e.g. {{__resolvers.short-options.suggestions}}?',
    ],
  }, {
    /**
     * prompt for a single slot
     */
    requirements: [
      'coverage',
      'year',
    ],

    prompts: [
      'Do you have a specific city and year in mind, like {{suggestions.0}}, or would you like me to play something randomly?',
    ],
  }],

  /**
   * feeder which we should call once we get all slots
   */
  fulfillment: 'albums',
};
