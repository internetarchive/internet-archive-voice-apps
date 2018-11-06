module.exports = {
  /**
   * settings for aliases resolver
   * we could match value of any context parameter to some value
   *
   * Usage:
   *
   * "In any message you can substitute {{alias.collectionId}}"
   *
   * and if collectionId == 'etree' you would get
   *
   * "In any message you can substitute Live Concerts"
   *
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

      description: 'Track - {{title}} of {{creator}}{{#coverage}} in {{coverage}}{{/coverage}}{{#year}}, {{year}}{{/year}}',
      // We should "say" something or play a sound between songs
      // official response:
      // https://github.com/actions-on-google/actions-on-google-nodejs/issues/103#issuecomment-373231791
      //
      // we can choose any sound from here
      // https://developers.google.com/actions/tools/sound-library/
      // [!] but we should use it for Google actions only
      wordless: [{
        condition: 'equal(platform, "assistant")',
        speech: `
          <audio src="https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg"
                 clipBegin="4.5s"
                 clipEnd="5.5s"
                 soundLevel="10db">
            <desc>Track - {{title}} of {{creator}}{{#coverage}} in {{coverage}}{{/coverage}}{{#year}}, {{year}}{{/year}}</desc>
          </audio>
        `,
      }],
      title: '{{title}} by {{creator}}{{#year}}, {{year}}{{/year}}',
      suggestionLink: 'on Archive.org',
    }, {
      description: 'Track - {{title}} of {{creator}}{{#year}} {{year}}{{/year}}',
      // We should "say" something or play a sound between songs
      // official response:
      // https://github.com/actions-on-google/actions-on-google-nodejs/issues/103#issuecomment-373231791
      //
      // we can choose any sound from here
      // https://developers.google.com/actions/tools/sound-library/
      // [!] but we should use it for Google actions only
      wordless: [{
        condition: 'equal(platform, "assistant")',
        speech: `
          <audio src="https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg"
                 clipBegin="4.5s"
                 clipEnd="5.5s"
                 soundLevel="10db">
            <desc>Track - {{title}} of {{creator}}{{#year}} {{year}}{{/year}}</desc>
          </audio>
        `,
      }],
      title: '{{title}} by {{creator}} {{year}}',
      suggestionLink: 'on Archive.org',
    }],
  },

  /**
   * Template for actions for Dialog flow
   */
  intents: {
    /**
     * Exit intent
     */
    exit: [{
      speech: `Alright, see you next time!`,
    }, {
      speech: `Sure, see you later!`,
    }, {
      speech: `Sure, have a nice day!`,
    }],

    fallback: {
      // TODO: fix actually we shoudl substitute app name here
      // because in alexa it is The Internet Archive Skill
      // but on Google Assistant it would be The Internet Archive Action
      speech:
        '<s>{{platform.appName}} can not help with that.</s> ' +
        '<s>But I can help you to find music record <break strength="weak"/> and play it.</s> ' +
        '<s>{{last.reprompt}}</s>'
    },

    getFSMState: {
      speech: 'State of <say-as interpret-as="characters">FSM</say-as> is {{state}}',
    },

    globalError: {
      speech: 'We had some problems performing your request. Please rephrase it.',
      suggestions: ['reset'],
    },

    help: {
      default: {
        speech:
          '<s>You are using Internet Archive service. </s>' +
          '<s>Here we have collections of Live Concerts and 78 <say-as interpret-as="characters">rpm</say-as> records. </s>' +
          '<s>You can ask to playback music of specific genre by asking: </s>' +
          '<s>play jazz music <break strength="weak"/> or play classic music. </s>' +
          '<s>As well you can ask me to play specific artist. </s>' +
          '<s>For example by saying: </s>' +
          '<s>play Grateful Dead <break strength="weak"/> or play the Cowboy Junkies. </s>' +
          '<s>And finally you can just answer on my questions </s>' +
          '<s>and I will pick the right music for you. </s>' +
          '<s>{{last.reprompt}}</s>'
      },

      playback: {
        default: {
          speech:
            '<s>You are listening <break strength="weak"/> {{playback.title}} <break strength="weak"/> of {{playback.creator}}{{#playback.year}} <break strength="weak"/> {{playback.year}}{{/playback.year}}.</s> ' +
            '<s>But you can select any music which I have in my Internet Archive collection, </s>' +
            '<s>by asking ' +
            '<break strength="weak"/> play jazz music ' +
            '<break strength="weak"/> or <break strength="weak"/> randomly play grateful dead' +
            '<break strength="weak"/> or play any other genre or artist. </s> ' +
            '<s>And finally you can just answer my questions so I would help you to find right records. </s>' +
            '<s>Do you want to continue payback {{playback.creator}} record?</s>',
          suggestions: ['yes', 'no'],
        },
      },
    },

    /**
     * we got 4xx, 5xx response from a server
     */
    httpRequestError: {
      speech: 'We are currently experiencing some technical difficulties on the Archive server. Please try again later or try saying something else.',
    },

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
      fulfillment: {
        feeder: 'albums-async',
        speech: [
          `I've got {{total}} {{subject}} albums. Let's listen to them.`,
          `I've got {{total}} albums from {{creator}} here. Let's start listening to them.`,
          `I found {{total}} albums. Let's listen to them.`,
          `I found {{total}} {{subject}} albums. Let's listen to them.`,
          `Let's play {{subject}} music.`,
          `Let's play music from {{creator}}.`,
          `Let's play music from {{coverage}}.`,
          `Let's dive into {{year}}.`,
          `I have {{total}} albums from {{year}}. Let's dive into them.`,
        ],
      },

      /**
       * When user missed the available range
       * we should help them to find alternative.
       *
       * Hints:
       * - gets group of speeches with the most intersection with existing slots
       *   and get random
       * - doesn't match to empty suggestions
       */
      repair: {
        speech: [
          `I don’t have anything for {{year}}. Try {{suggestions.0}}, for example.`,
          `I don't have {{creator}} albums for {{year}}. Try {{suggestions.0}}, for example.`,
          `I don't have any albums for {{year}}. Try {{suggestions.0}}, for example.`,
          `I don't have that. Try {{suggestions.0}}, for example.`,
          `I don't have {{subject}} for {{year}}. Try {{suggestions.0}}, for example.`,
          `I don't have {{subject}} for {{year}}. Maybe you would like to listen something else?`,
        ],
        default: {
          speech: `I haven't found music matched your request, maybe you would like to listen something else?`,
        },
      },
    },

    /**
     * Action: with slots scheme for music search query
     */
    musicQuery: [{
      name: 'george blood collection',

      /**
       * engine chooses this scheme when have met that condition
       */
      condition: 'equal(collectionId, "georgeblood")',

      /**
       * slots which we need for fulfillement
       */
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
            collectionId: { skip: true },
            subject: { skip: true },
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
        'Okay! Lets go with the artist {{creator}}!',
        `You've selected {{alias.collectionId}}.`,
        `Okay! You've selected {{alias.collectionId}}.`,
        `Got it! You've selected {{alias.collectionId}}.`,
        `Alright! You've selected {{alias.collectionId}}.`,
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
          'What genre of music would you like to listen to? Please select a genre like {{short-options.suggestions}}?',
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
      // fulfillment: 'albums-async',
      fulfillment: {
        feeder: 'albums-async',
        speech: [
          `I found {{total}} albums. Let's listen to them.`,
          `I've got {{total}} {{subject}} albums. Let's listen to them.`,
          `Here are some {{subject}} albums.`,
          `Let's play some {{subject}} music.`,
          `Let's play music from {{creator}}.`,
          `Let's play music from {{coverage}}.`,
          `Let's dive into {{year}}.`,
        ],
      },
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
            collectionId: { skip: true },
            creator: { skip: true },
            coverage: { skip: true },
            year: { skip: true },
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
        '{{year}} - it was an excellent year!',
        'Okay! Lets go with {{creator}}!',
        'Alright! Lets go with {{creator}}!',
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

        /**
         * When user missed the available range
         * we should help them to find alternative.
         */
        repair: {
          speech: [
            `We don't have concerts by {{creator}}. Maybe you would like to listen to {{short-options.suggestions}}?`,
          ],
          default: {
            speech: `I haven't found music matched your request, maybe you would like to listen something else?`,
          },
        },
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

        /**
         * When user missed the available range
         * we should help them to find alternative.
         */
        repair: {
          speech: [
            `I don't have {{creator}} concerts for {{year}} in {{coverage}}. What about {{suggestions.0}}?`,
            `I don't have any concerts for {{year}} in {{coverage}}. But we do have {{suggestions.0}}.`,
            `I don't have that concert. Maybe you would like {{suggestions.0}}?`,
            `I don't have that concert in {{coverage}}. Maybe you would like {{suggestions.0}}?`,
          ],
          default: {
            speech: `I don't have that concert. Maybe you would like to try something else?`,
          }
        },
      }, {
        /**
         * prompt for single slot
         */
        confirm: [
          'year',
        ],

        speech: [
          'Okay, {{creator}} has played in {{coverage}} sometime in {{years-interval.suggestions}}. Do you have a particular year in mind?',
        ],

        /**
         * When user missed the available range
         * we should help them to find alternative.
         */
        repair: {
          speech: [
            `I don’t have anything for {{year}}. Available years for {{coverage}} are {{years-interval.suggestions}}.`,
            `I don't have {{creator}} concerts from {{year}}. Try {{years-interval.suggestions}}.`,
            `I don't have any concerts for {{year}}. Try {{years-interval.suggestions}}.`,
            `I don't have that concert. Try {{years-interval.suggestions}}.`,
            `I don't have any concert in {{coverage}}. Maybe you would like to try something else?`,
            `I don't have concerts of {{creator}} in {{coverage}}. Maybe you would like to try something else?`,
          ],
          default: {
            speech: `I haven't found music matched your request, maybe you would like to listen something else?`,
          },
        },
      }],

      /**
       * feeder which we should call once we get all slots
       */
      // fulfillment: 'albums',
      fulfillment: {
        feeder: 'albums',
        speech: [
          `I found {{total}} albums. Let's listen to them.`,
          `Let's play this concert that {{creator}} played in {{year}}, in {{coverage}}.`,
          `Let's play {{creator}} concerts.`,
          `Let's play concerts from {{creator}}.`,
          `Let's play {{subject}} concerts.`,
          `Let's play concerts from {{coverage}}.`,
          `Let's dive into {{year}}.`,
        ],
      },
    }],

    noInput: [{
      speech: "Sorry, I couldn't hear you.",
    }, {
      speech: 'Sorry, can you repeat that? {{reprompt}}',
    }, {
      speech: "I'm sorry I'm having trouble here. Maybe we should try this again later.",
    }],

    order: {
      speech: 'Sorry, can you repeat that? {{reprompt}}',
    },

    repeat: {
      empty: {
        speech: `I don't see anything here to repeat.`,
      },
    },

    resume: {
      fail: {
        speech: 'Fail to resume.',
      },

      empty: {
        speech: 'Nothing to resume.',
      },
    },

    songsDetails: {
      action: {
        speech: 'It is record <break strength="weak"/> {{title}} <break strength="weak"/> of {{creator}}{{#year}} <break strength="weak"/> {{year}}{{/year}}.',
        resumePlayback: true,
      },

      fail: {
        speech: 'Fail to resume playback.',
      },

      nothing: {
        speech: 'Nothing is playing right now.',
      },
    },

    titleOption: {
      false: {
        speech: `Excellent! I'll be saying the title to each song.`,
      },
      true: {
        speech: `Okay, muting song titles.`,
      },
    },

    unknown: [{
      speech: "I'm not sure what you said. Can you repeat that?",
    }, {
      speech: "I still didn't get that. {{reprompt}}",
    }, {
      speech: "I'm sorry I'm having trouble here. Maybe we should try this again later.",
    }],

    unhandled: [{
      speech: "Sorry, I'm afraid I don't follow you.",
    }],

    version: {
      default: {
        speech: '<s>Version is <say-as interpret-as="number">{{version}}</say-as>.</s> ' +
          '<s>{{last.reprompt}}</s>',
      },

      playback: {
        speech: 'Version is <say-as interpret-as="number">{{version}}</say-as>.',
      }
    },

    welcome: {
      default: {
        acknowledges: [
          'Welcome to music at the Internet Archive.'
        ],
        speech: 'You can listen to our collections of 78s or live concerts. Which would you like to listen to?',
        suggestions: ['78s', 'Live Concerts'],
      },

      yes: {
        speech: 'You need to select <break strength="weak"/>78s <break strength="weak"/>or Live Concerts',
        suggestions: ['78s', 'Live Concerts'],
      },
    },

    playback: {
      noInput: {
        speech: `Sorry, I couldn't hear you. If you don't mind I will continue playback.`,
      },

      unknown: {
        speech: `I'm not sure what you said. If you don't mind I will continue playback.`,
      },
    },

    no: [{
      speech: '<s>Hm, <break strength="weak"/>Okey!</s> ' +
        '<s>But however,</s> ' +
        '<s>{{last.reprompt}}</s>',
    }, {
      speech: '<s>Hm, <break strength="weak"/>Okey!</s> ' +
        '<s>But at any rate,</s> ' +
        '<s>{{last.reprompt}}</s>',
    }],

    yes: [{
      speech: '<s>Hm, <break strength="weak"/>Okey!</s> ' +
        '<s>But anyway,</s> ' +
        '<s>{{last.reprompt}}</s>',
    }, {
      speech: '<s>Sure!</s> ' +
        '<s>But however,</s> ' +
        '<s>{{last.reprompt}}</s>',
    }, ],
  },

  events: {
    playlistIsEnded: {
      speech: 'Playlist has ended. Would you like to continue listening?',
    },

    nothingToSay: {
      speech: `I'm not sure what you said. Could you rephrase?`,
    }
  }
};
