const {expect} = require('chai');
const advancedSearch = require('../../provider/advanced-search');

describe('provider', () => {
  describe('advanced search', () => {
    describe('buildQueryCondition', () => {
      it('should ..', () => {
        const condition = advancedSearch.buildQueryCondition({
          coverage: 'london',
          creatorId: 'theband',
          collectionId: '80s',
          year: '2020',
        });
        expect(condition).to.be.equal(
          'coverage:(london) AND collection:(theband) AND collection:(80s) AND year:(2020)'
        );
      });
    });
  });
});
