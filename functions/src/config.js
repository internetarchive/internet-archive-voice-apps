module.exports = {
  endpoints: {
    ALBUM_DETAIL: 'https://{{platformSubDomain}}.archive.org/proxy/details/{{album.id}}',
    ALBUMS_OF_CREATOR_URL: 'https://{{platformSubDomain}}.archive.org/advancedsearch.php' +
    '?q=collection:({{creatorId}})' +
    '&fl[]={{fields}}' +
    '&sort[]={{order}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    COLLECTION_ITEMS_URL: 'https://{{platformSubDomain}}.archive.org/advancedsearch.php' +
    '?q=collection:({{id}})' +
    '&fl[]={{fields}}' +
    '&sort[]={{order}}' +
    '&rows={{limit}}' +
    '&page={{page}}' +
    '&output=json',
    COLLECTION_URL: 'https://{{platformSubDomain}}.archive.org/metadata/{{id}}',
    QUERY_COLLECTIONS_URL: 'https://{{platformSubDomain}}.archive.org/advancedsearch.php' +
    '?q={{condition}}' +
    '&fl[]={{fields}}' +
    '{{#order}}&sort[]={{order}}{{/order}}' +
    '&rows={{limit}}' +
    '{{#page}}&page={{page}}{{/page}}' +
    '&output=json',
    SONG_URL: 'https://{{platformSubDomain}}.archive.org/proxy/download/{{albumId}}/{{filename}}',
  },

  media: {
    POSTER_OF_ALBUM: 'https://{{platformSubDomain}}.archive.org/proxy/services/img/{{id}}',
    DEFAULT_SONG_IMAGE: 'http://archive.org/images/notfound.png',
  },

  metrics: {
    skip_song: 'https://{{platformSubDomain}}.archive.org/event/skip/{{albumId}}/{{filename}}.mp3'
  },

  /**
   * settings specific for supported platforms
   */
  platforms: {
    alexa: {
      /**
       * substitute to endpoint
       */
      endpoint: {
        platformSubDomain: 'askills-api',
      },

      appName: 'The Internet Archive Skill',
    },

    assistant: {
      /**
       * substitute to endpoint
       */
      endpoint: {
        platformSubDomain: 'gactions-api',
      },

      appName: 'The Internet Archive Action',

      minimalSpeechForMediaResponse: `<speak>
          <audio src="https://actions.google.com/sounds/v1/foley/cassette_tape_button.ogg"
                 clipBegin="4.5s"
                 clipEnd="5.5s"
                 soundLevel="10db">
            <desc>User's session is missed</desc>
          </audio>
        </speak>`
    },
  },

  request: {
    userAgent: '{{name}} ({{platform}}) / {{version}}',
  },

  feeders: {
    'albums-async': {
      chunk: {
        size: 4,
      },

      defaults: {
        chunk: {
          // how many albums we would fetch in one chunk
          albums: 1,
          // how many songs we would sample in one chunk
          songs: 2,
        },
      },

      random: {
        chunk: {
          // how many albums we would fetch in one chunk
          albums: 2,
          // how many songs we would sample in one chunk
          songs: 2,
        }
      },
    }
  },
};
