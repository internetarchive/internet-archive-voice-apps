const {expect} = require('chai');
const {defaultActions} = require('../../src/actions');

describe('actions', () => {
  describe('defaultActions', () => {
    it('should grab all actions and map to file name', () => {
      const actions = defaultActions();
      expect(actions).to.have.any.key([
        'media-status-update', 'repeat', 'welcome',
      ]);
    });
  });
});
