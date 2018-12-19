const { expect } = require('chai');
const path = require('path');
const rewire = require('rewire');

const actions = rewire('../../src/actions');

const defaultFixture = {
  next: require('./fixtures/fsm-structure/next'),
  play: require('./fixtures/fsm-structure/play'),
  stop: require('./fixtures/fsm-structure/stop'),
};
const playbackFixture = {
  next: require('./fixtures/fsm-structure/playback/next'),
  stop: require('./fixtures/fsm-structure/playback/stop'),
};
const searchFixture = {
  next: require('./fixtures/fsm-structure/search/next'),
};
const searchAndHelpFixture = {
  next: require('./fixtures/fsm-structure/search/help/next'),
};

describe('actions', () => {
  beforeEach(() => {
    actions.__set__('__dirname', path.join(__dirname, 'fixtures', 'fsm-structure'));
  });

  describe('fromFiles', () => {
    it('should extract all available actions', () => {
      const a = actions.fromFiles();
      expect(a).to.have.any.key([
        'next',
        'play',
        'stop',
      ]);
    });

    it('should extract flat structure', () => {
      const a = actions.fromFiles();
      expect(a)
        .to.have.property('play')
        .which.have.property('default', defaultFixture.play.handler);

      expect(a)
        .to.have.property('stop')
        .which.have.property('default', defaultFixture.stop.handler);

      expect(a)
        .to.have.property('stop')
        .which.have.property('playback').to.have.property('default', playbackFixture.stop.handler);
    });

    it('should extract hierarchy structure', () => {
      const a = actions.fromFiles();
      expect(a)
        .to.have.property('next')
        .which.property('default', defaultFixture.next.handler);
      expect(a)
        .to.have.property('next')
        .which.have.property('playback').to.have.property('default', playbackFixture.next.handler);
      expect(a)
        .to.have.property('next')
        .which.have.property('search').to.have.property('default', searchFixture.next.handler);
      expect(a)
        .to.have.property('next')
        .which.property('search').to.have.property('help').to.have.property('default', searchAndHelpFixture.next.handler);
    });
  });

  describe('fromScheme', () => {
    it('should fail if we have not pass json scheme', () => {
      expect(() => {
        actions.fromJSON();
      }).throw();
    });

    it('should fail with erro when handler does not have build function', () => {
      const previous = {
        name: 'previous',
        action: 'stop'
      };

      const a = actions.fromJSON({
        previous,
        qwerty: {
          name: 'qwerty'
        }
      });

      expect(() => {
        const app = {};
        a.previous.default(app);
      }).throw(actions.MissedHandlerBuild);
    });

    it('should find action handler and map it', () => {
      const previousSong = {
        name: 'previous song',
        action: 'next'
      };

      const a = actions.fromJSON({
        previousSong,
        qwerty: {
          name: 'qwerty'
        }
      });

      expect(a)
        .to.have.property('previous-song')
        .which.have.property('default').is.a('function');

      expect(a)
        .to.not.have.property('qwerty');

      const app = {};
      a['previous-song'].default(app);

      expect(defaultFixture.next.build).to.have.been.calledWith(app);
    });
  });
});
