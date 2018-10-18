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

describe('actions', () => {
  describe('withState', () => {
    beforeEach(() => {
      actions.__set__('__dirname', path.join(__dirname, 'fixtures', 'fsm-structure'));
    });

    it('should extract all available actions', () => {
      const a = actions.withStates();
      expect(a).to.have.any.key([
        'next',
        'play',
        'stop',
      ]);
    });

    it('should extract fsm states', () => {
      const a = actions.withStates();
      expect(a.get('next')).to.have.property('default', defaultFixture.next.handler);
      expect(a.get('next')).to.have.property('playback', playbackFixture.next.handler);
      expect(a.get('next')).to.have.property('search', searchFixture.next.handler);

      expect(a.get('play')).to.have.property('default', defaultFixture.play.handler);

      expect(a.get('stop')).to.have.property('default', defaultFixture.stop.handler);
      expect(a.get('stop')).to.have.property('playback', playbackFixture.stop.handler);
    });
  });
});
