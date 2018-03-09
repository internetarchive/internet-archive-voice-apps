const {expect} = require('chai');
const advancedSearch = require('../../provider/advanced-search');

describe('provider', () => {
  describe('advanced search', () => {
    describe('buildQueryCondition', () => {
      it('should build query string', () => {
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

      it('should build query string for multiple values', () => {
        const condition = advancedSearch.buildQueryCondition({
          collectionId: ['etree', 'georgeblood'],
        });
        expect(condition).to.be.equal(
          '(collection:(etree) OR collection:(georgeblood))'
        );
      });
    });
  });
});
