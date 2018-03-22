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

  /**
   * settings for aliases resolver
   * we could match value of any context parameter to some value
   */
  aliases: {
    collectionId: {
      etree: 'Live Concerts',
      georgeblood: '78s',
    },
  },

  dialog: {
    playSong: [{
      /**
       * choose this one if song is from collection 'etree'
       */
      condition: 'includes(collections, "etree")',

      description: 'Playing track - {{title}} of {{creator}}{{#coverage}} in {{coverage}}{{/coverage}}{{#year}}, {{year}}{{/year}}',
      // We should "say" something or play a sound between songs
      // official response:
      // https://github.com/actions-on-google/actions-on-google-nodejs/issues/103#issuecomment-373231791
      //
      // we can choose any sound from here
      // https://developers.google.com/actions/tools/sound-library/
      // [!] but we should use it for Google actions only
      speech: `
        <audio src="https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg"
               clipBegin="4.5s"
               clipEnd="5.5s"
               soundLevel="10db">
          <desc>Playing track - Breezin&amp;#39;, Northampton, MA, 2010</desc>
        </audio>
      `,
      title: '{{title}} by {{creator}}{{#year}}, {{year}}{{/year}}',
      suggestionLink: 'on Archive.org',
    }, {
      description: 'Playing track - {{title}} of {{creator}}{{#year}} {{year}}{{/year}}',
      // We should "say" something or play a sound between songs
      // official response:
      // https://github.com/actions-on-google/actions-on-google-nodejs/issues/103#issuecomment-373231791
      //
      // we can choose any sound from here
      // https://developers.google.com/actions/tools/sound-library/
      // [!] but we should use it for Google actions only
      speech: `
        <audio src="https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg"
               clipBegin="4.5s"
               clipEnd="5.5s"
               soundLevel="10db">
          <desc>Playing track - Breezin&amp;#39;, Northampton, MA, 2010</desc>
        </audio>
      `,
      title: '{{title}} by {{creator}} {{year}}',
      suggestionLink: 'on Archive.org',
    }],
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
        'creator',
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

      condition: 'collectionId == "georgeblood"',

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
        'Ok! Lets go with {{creator}} performer!',
        `You've selected {{alias.collectionId}}.`,
      ],

      prompts: [{
        /**
         * prompt for single slot
         */
        confirm: [
          'subject'
        ],

        /**
         * slots which we need for fulfillement
         */
        speech: [
          'What genre of music would you like to listen to? Please select a topic like {{short-options.suggestions}}?',
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
        'creator',
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
            creator: {skip: true},
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
        'Ok! Lets go with {{creator}}!',
        `You've selected {{alias.collectionId}}.`,
      ],

      /**
       * ask user about needed slots
       */
      prompts: [{
        /**
         * prompt for a single slot
         */
        confirm: [
          'collectionId'
        ],

        speech: [
          'Would you like to listen to music from our collections of {{short-options.suggestions}}?',
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
        confirm: [
          'creator'
        ],

        speech: [
          'What artist would you like to listen to? For example, {{short-options.suggestions}}?',
        ],

        /**
         * Template for creating suggestions
         */
        suggestionTemplate: 'the {{creator}}',
      }, {
        /**
         * we can prompt to give 2 slots in the same time
         */
        confirm: [
          'coverage',
          'year',
        ],

        speech: [
          'Do you have a specific city and year in mind, like {{suggestions.0}}, or would you like me to play something randomly?',
        ],

        /**
         * Template for creating suggestions
         */
        suggestionTemplate: '{{coverage}} {{year}}',
      }, {
        /**
         * prompt for single slot
         */
        confirm: [
          'year',
        ],

        speech: [
          'Ok, {{creator}} has played in {{coverage}} sometime {{years-interval.suggestions}}. Do you have a particular year in mind?',
        ],
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

    titleOption: {
      false: {
        speech: `Ok, muting song titles`,
      },
      true: {
        speech: `Excellent! I'll be saying title to each song`,
      },
    },

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
