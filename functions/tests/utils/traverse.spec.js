const { expect } = require('chai');

const traverse = require('../../src/utils/traverse');

const fixtureWithUndefined = {
  playlist:
    {
      feederName: 'albums-async',
      items:
        [{
          filename: 'Emilia Polka - Edward Krolikowski and His Orchestra.mp3',
          title: 'Emilia Polka',
          audioURL: 'https://archive.org/download/78_emilia-polka_edward-krolikowski-and-his-orchestra-louis-vitak_gbia0071442a/Emilia%20Polka%20-%20Edward%20Krolikowski%20and%20His%20Orchestra.mp3',
          collections:
            ['78rpm',
              '78rpm_bostonpubliclibrary',
              'georgeblood',
              'audio_music'],
          coverage: 'USA',
          creator: ['Edward Krolikowski and His Orchestra', 'Louis Vitak'],
          imageURL: 'https://archive.org/services/img/78_emilia-polka_edward-krolikowski-and-his-orchestra-louis-vitak_gbia0071442a',
          suggestions: ['Next'],
          album:
            {
              id: '78_emilia-polka_edward-krolikowski-and-his-orchestra-louis-vitak_gbia0071442a',
              title: 'Emilia Polka'
            },
          track: 1,
          year: undefined,
          cursor: { album: 0, song: 0 }
        },
        {
          filename: 'Hraval Kolovratek - Hudba Jiri Fenel - Vlasa Rohaneva.mp3',
          title: 'Hraval Kolovratek',
          audioURL: 'https://archive.org/download/78_hraval-kolovratek_hudba-jiri-fenel-vlasa-rohaneva-zpivaji-sestry-skovajsovy-hraje-l_gbia0002171b/Hraval%20Kolovratek%20-%20Hudba%20Jiri%20Fenel%20-%20Vlasa%20Rohaneva.mp3',
          collections:
              ['78rpm',
                'archiveofcontemporarymusic',
                'georgeblood',
                'audio_music'],
          coverage: 'USA',
          creator:
              ['Hudba Jiri Fenel',
                'Vlasa Rohaneva',
                'Zpivaji sestry Skovajsovy',
                'Hraje lidevy soubor Vaclava Berky'],
          imageURL: 'https://archive.org/services/img/78_hraval-kolovratek_hudba-jiri-fenel-vlasa-rohaneva-zpivaji-sestry-skovajsovy-hraje-l_gbia0002171b',
          suggestions: ['Next'],
          album:
              {
                id: '78_hraval-kolovratek_hudba-jiri-fenel-vlasa-rohaneva-zpivaji-sestry-skovajsovy-hraje-l_gbia0002171b',
                title: 'Hraval Kolovratek'
              },
          track: 1,
          year: undefined,
          cursor: { album: 0, song: 0 }
        }],
      current: 0,
      extra:
        {
          cursor:
            {
              total: { songs: 1, albums: 3391 },
              current: { album: 0, song: 0 }
            }
        }
    },
  query:
    {
      values:
        {
          collectionId: ['etree', 'georgeblood'],
          subject: 'Polka',
          order: 'random'
        }
    },
  updatedAt: 1544005704238,
  idx: 2,
  actions: { action: 'media-status-update', count: 2 },
  id: '1544004492005-1dec0418-b007-4add-81cc-8241fc824c5b',
  conversationId: '....',
  createdAt: 1544004492090,
  fsm: { history: ['playback'] }
};

const fixtureWithNull = {
  playlist:
    {
      feederName: 'albums-async',
      items:
        [{
          filename: 'Emilia Polka - Edward Krolikowski and His Orchestra.mp3',
          title: 'Emilia Polka',
          audioURL: 'https://archive.org/download/78_emilia-polka_edward-krolikowski-and-his-orchestra-louis-vitak_gbia0071442a/Emilia%20Polka%20-%20Edward%20Krolikowski%20and%20His%20Orchestra.mp3',
          collections:
            ['78rpm',
              '78rpm_bostonpubliclibrary',
              'georgeblood',
              'audio_music'],
          coverage: 'USA',
          creator: ['Edward Krolikowski and His Orchestra', 'Louis Vitak'],
          imageURL: 'https://archive.org/services/img/78_emilia-polka_edward-krolikowski-and-his-orchestra-louis-vitak_gbia0071442a',
          suggestions: ['Next'],
          album:
            {
              id: '78_emilia-polka_edward-krolikowski-and-his-orchestra-louis-vitak_gbia0071442a',
              title: 'Emilia Polka'
            },
          track: 1,
          year: null,
          cursor: { album: 0, song: 0 }
        },
        {
          filename: 'Hraval Kolovratek - Hudba Jiri Fenel - Vlasa Rohaneva.mp3',
          title: 'Hraval Kolovratek',
          audioURL: 'https://archive.org/download/78_hraval-kolovratek_hudba-jiri-fenel-vlasa-rohaneva-zpivaji-sestry-skovajsovy-hraje-l_gbia0002171b/Hraval%20Kolovratek%20-%20Hudba%20Jiri%20Fenel%20-%20Vlasa%20Rohaneva.mp3',
          collections:
              ['78rpm',
                'archiveofcontemporarymusic',
                'georgeblood',
                'audio_music'],
          coverage: 'USA',
          creator:
              ['Hudba Jiri Fenel',
                'Vlasa Rohaneva',
                'Zpivaji sestry Skovajsovy',
                'Hraje lidevy soubor Vaclava Berky'],
          imageURL: 'https://archive.org/services/img/78_hraval-kolovratek_hudba-jiri-fenel-vlasa-rohaneva-zpivaji-sestry-skovajsovy-hraje-l_gbia0002171b',
          suggestions: ['Next'],
          album:
              {
                id: '78_hraval-kolovratek_hudba-jiri-fenel-vlasa-rohaneva-zpivaji-sestry-skovajsovy-hraje-l_gbia0002171b',
                title: 'Hraval Kolovratek'
              },
          track: 1,
          year: null,
          cursor: { album: 0, song: 0 }
        }],
      current: 0,
      extra:
        {
          cursor:
            {
              total: { songs: 1, albums: 3391 },
              current: { album: 0, song: 0 }
            }
        }
    },
  query:
    {
      values:
        {
          collectionId: ['etree', 'georgeblood'],
          subject: 'Polka',
          order: 'random'
        }
    },
  updatedAt: 1544005704238,
  idx: 2,
  actions: { action: 'media-status-update', count: 2 },
  id: '1544004492005-1dec0418-b007-4add-81cc-8241fc824c5b',
  conversationId: '....',
  createdAt: 1544004492090,
  fsm: { history: ['playback'] }
};

describe('utils', () => {
  describe('traverse', () => {
    it('should traverse all children', () => {
      expect(traverse(fixtureWithUndefined, (value) => value !== undefined ? value : null)).to.be.deep.equal(fixtureWithNull);
    });
  });
});
