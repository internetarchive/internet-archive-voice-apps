const {expect} = require('chai');
const creators = require('../../provider/creators');

describe('providers', () => {
  describe('creators', () => {
    describe('fetchCreators', () => {
      return creators.fetchCreators({

      })
        .then((res) => {
          expect(res).to.have.property('item').with.deep.members([{
          }])
        });
    });
  });
});
