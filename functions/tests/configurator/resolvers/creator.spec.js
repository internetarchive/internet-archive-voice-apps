const {expect} = require('chai');
const rewire = require('rewire');

const mockApp = require('../../_utils/mocking/platforms/app');

const creator = rewire('../../../src/configurator/resolvers/creator');

const mockSearchCollection = require('../../_utils/mocking/provider/collection');

describe('slots', () => {
  let app;
  let collection;

  beforeEach(() => {
    app = mockApp();
    collection = mockSearchCollection({
      fetchDetailsResponse: {
        title: 'Cool Band',
      },
    });
    creator.__set__('collection', collection);
  });

  describe('extensions', () => {
    describe('resolver', () => {
      describe('creator', () => {
        it('should have requirements', () => {
          expect(creator).to.have.property('requirements').to.not.empty;
        });

        describe('handler', () => {
          it('should return promise', () => {
            expect(creator.handler()).to.have.property('then');
          });

          it('should fetch metadata from IA and return object with title', () => {
            return creator.handler({
              app,
              slots: {
                creatorId: 'cool-band',
              },
            }).then((res) => {
              expect(collection.fetchDetails).to.be.calledWith(app, 'cool-band');
              expect(res).to.have.property('title').to.equal('Cool Band');
            });
          });
        });
      });
    });
  });
});
