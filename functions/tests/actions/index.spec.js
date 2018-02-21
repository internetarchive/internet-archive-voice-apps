const {expect} = require('chai');
const {defaultActions} = require('../../actions');

describe('actions', () => {
  describe('defaultActions', () => {
    it('should grab all actions and map to file name', () => {
      const actions = defaultActions();
      expect(actions).to.have.any.key(['repeat', 'welcome']);
    });
  });
});
