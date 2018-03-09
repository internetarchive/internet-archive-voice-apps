module.exports = {
  /**
   * v2
   */
  acknowledger: [
    'OK, ',
    'Got it, ',
    'Sure, ',
    'Alright, ',
    'Thanks, '
  ],

  dialog: {
    playSong: {
      description: 'Playing track - {{title}}{{#coverage}}, {{coverage}}{{/coverage}}{{#year}}, {{year}}{{/year}}',
      title: 'Playing track{{#track}} number - {{track}}{{/track}}{{^track}}{{title}}{{/track}}',
      suggestionLink: 'on Archive.org',
    }
  },

  /**
   * Template for actions for Dialog flow
   */
  intents: {
    /**
     * In one go actions for playback music
     */
    inOneGoMusicPlayback: {
      name: 'in one go music playback',

      /**
       * it tries to fill those slots
       */
      slots: [
        'collectionId',
        'coverage',
        'creatorId',
        'order',
        'subject',
        'year',
      ],

      /**
       * the rest gets from defaults
       */
      defaults: {
        'order': 'random',
        // restricted to the allowed collections
        // so user could ask
        // > play jazz
        // and we fetch all jazz from these collections
        'collectionId': ['etree', 'georgeblood'],
      },

      /**
       * and ask fulfillment for a feeder
       */
      fulfillment: 'albums-async',
    },

    /**
     * Action: with slots scheme for music search query
     */
    musicQuery: [{
      name: 'george blood collection',

      conditions: [
        'collectionId == "georgeblood"'
      ],

      slots: [
        'collectionId',
        'subject',
      ],

      /**
       * could be define in follow-up intent
       * which return preset argument
       */
      presets: {
        random: {
          defaults: {
            collectionId: {skip: true},
            subject: {skip: true},
            order: 'random',
          }
        },
      },

      /**
       * default values for slots
       */
      defaults: {
        order: 'random',
      },

      /**
       * Acknowledge recieved value and repeat to give user change
       * to check our undestanding
       */
      acknowledges: [
        'Ok! Lets go with {{__resolvers.creator.title}} performer!',
        `You've selected {{__resolvers.collection.title}} collection.`,
      ],

      prompts: [{
        /**
         * prompt for single slot
         */
        requirements: [
          'subject'
        ],

        /**
         * slots which we need for fulfillement
         */
        prompts: [
          'What genre of music would you like to listen to? Please select a topic like {{suggestions.humanized}}?',
        ],

        /**
         * Fixed set of suggestions
         */
        suggestions: [
          'Jazz',
          'Instrumental',
          'Dance',
        ],
      }],

      /**
       * feeder which we should call once we get all slots
       * (we could have a lot of songs here - because we filter by genre)
       */
      fulfillment: 'albums-async',
    }, {
      name: 'DEFAULT music search query',

      /**
       * slots which we need for fulfillement
       */
      slots: [
        'collectionId',
        'creatorId',
        'coverage',
        'year',
      ],

      /**
       * could be define in follow-up intent
       * which return preset argument
       */
      presets: {
        random: {
          defaults: {
            collectionId: {skip: true},
            creatorId: {skip: true},
            coverage: {skip: true},
            year: {skip: true},
            order: 'random',
          }
        },
      },

      /**
       * Acknowledge recieved value and repeat to give user change
       * to check our undestanding
       */
      acknowledges: [
        '{{coverage}} - good place!',
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
        'Ok! Lets go with {{__resolvers.creator.title}} band!',
        `You've selected {{__resolvers.collection.title}} collection.`,
      ],

      /**
       * ask user about needed slots
       */
      prompts: [{
        /**
         * prompt for a single slot
         */
        requirements: [
          'collectionId'
        ],

        prompts: [
          'Would you like to listen to music from our collections of {{suggestions.humanized}}?',
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
         * prompt for single slot
         */
        requirements: [
          'creatorId'
        ],

        prompts: [
          'What artist would you like to listen to? For example, {{suggestions.humanized}}?',
        ],

        /**
         * Template for creating suggestions
         */
        suggestionTemplate: 'the {{creator}}',
      }, {
        /**
         * we can prompt to give 2 slots in the same time
         */
        requirements: [
          'coverage',
          'year',
        ],

        prompts: [
          'Do you have a specific city and year in mind, like {{suggestions.values.0}}, or would you like me to play something randomly?',
        ],

        /**
         * Template for creating suggestions
         */
        suggestionTemplate: '{{coverage}} {{year}}',
      }],

      /**
       * feeder which we should call once we get all slots
       */
      fulfillment: 'albums',
    }],

    noInput: [{
      speech: "Sorry, I couldn't hear you.",
    }, {
      speech: 'Sorry, can you repeat that? {{reprompt}}',
    }, {
      speech: "I'm sorry I'm having trouble here. Maybe we should try this again later.",
    }],

    unknown: [{
      speech: "I'm not sure what you said. Can you repeat that?",
    }, {
      speech: "I still didn't get that. {{reprompt}}",
    }, {
      speech: "I'm sorry I'm having trouble here. Maybe we should try this again later.",
    }],

    welcome: {
      acknowledges: [
        'Welcome to music at the Internet Archive.'
      ],
      speech: 'Would you like to listen to music from our collections of 78s or Live Concerts?',
      suggestions: ['78s', 'Live Concerts']
    },
  },

  prompts: {
    select: {
      artist: [
        'What artist do you want to hear?',
        'What artist would you like to listen to?',
      ],
      city: 'Please select a city',
      collection: 'Please select a collection',
      topic: [
        'Please select a topic',
        'Please select a topic - like Jazz, Alternative, or Dance',
      ],
      year: 'Please select a year',
      yearAndCity: [
        'Please select a city and year',
        'Do you have a specific city and year in mind?',
      ],
    },
  },

  /**
   * v1
   *
   * @deprecated
   */
  appExit: "Okay, let's try this again later.",
  errors: {
    device: {
      mediaResponse: {
        speech: "Sorry, your device doesn't support media response.",
      },
    },
    noInput: {
      first: "Sorry, I couldn't hear you.",
      reprompt: 'Sorry, can you repeat that?'
    },
    unknownInput: {
      first: "I'm not sure what you said. Can you repeat that?",
      reprompt: "I still didn't get that."
    },
    collection: {
      notFound: 'has no available songs to play. Please choose a different artist, random is also an option'
    },
    topic: {
      notFound: "I couldn't find any songs. Please select another topic, random is also an option"
    },
    yearAndCity: {
      notFound: "I couldn't find any songs. Try a different city or year, random is also an option"
    },
    yearList: {
      notFound: "I wasn't able to find a year list. Please select random"
    }
  },
  fallback: {
    whatWasThat: 'Sorry, what was that?',
    didntCatchThat: "I didn't catch that.",
    misunderstand: "I'm having trouble understanding you",
    sayAgain: 'Sorry, can you say that again?',
    finalReprompt: "I'm sorry I'm having trouble here. Maybe we should try this again later."
  },
  suggestion: {
    artist: {
      gratefulDead: 'Grateful Dead',
      cowboyJunkies: 'Cowboy Junkies',
      dittyBops: 'Ditty Bops',
      discoBiscuits: 'Disco Biscuits',
      hotButteredRum: 'Hot Buttered Rum',
      kellerWilliams: 'Keller Williams'
    },
    artistsPrompt: 'I have some music from The Ditty Bops, Cowboy Junkies, and Grateful Dead, for example',
    artistsPromptAlternative: 'We also have music from Disco Biscuits, Hot Buttered Rum, and Keller Williams',
    randomPrompt: 'I can play something randomly'
  },
  statements: {
    salutation: {
      thankYou: {
        liveMusicCollection: 'Thanks for rocking with the Internet Archive’s live music collection!'
      }
    }
  }
};
