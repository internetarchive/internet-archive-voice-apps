const {expect} = require('chai');

const query = require('../../src/state/query');

const mockApp = require('../_utils/mocking/app');

describe('state', () => {
  let app;

  beforeEach(() => {
    app = mockApp();
  });

  describe('query', () => {
    it('should fill slot', () => {
      const collection = 'the-best-collection-ever';
      query.setSlot(app, 'collection', collection);
      expect(query.getSlot(app, 'collection')).to.be.equal(collection);
    });

    describe('resetSlot(s)', () => {
      it('should reset defined slot', () => {
        query.setSlot(app, 'name', 'hello world');
        query.resetSlot(app, 'name');
        expect(query.hasSlot(app, 'name')).to.be.false;
      });

      it('should reset skipped slot', () => {
        query.skipSlot(app, 'name');
        query.resetSlot(app, 'name');
        expect(query.hasSlot(app, 'name')).to.be.false;
      });

      it('should reset all defined slots', () => {
        query.setSlot(app, 'name1', 'hello world here!');
        query.setSlot(app, 'name2', 'hello world there!');
        query.skipSlot(app, 'name3');
        query.resetSlots(app);
        expect(query.hasSlot(app, 'name1')).to.be.false;
        expect(query.hasSlot(app, 'name2')).to.be.false;
        expect(query.hasSlot(app, 'name3')).to.be.false;
      });
    });

    describe('hasSlot', () => {
      it('should return true when we have setup slot before', () => {
        expect(query.hasSlot(app, 'collection')).to.be.false;
        query.setSlot(app, 'collection', 'the-best-collection-ever');
        expect(query.hasSlot(app, 'collection')).to.be.true;
      });
    });

    describe('hasSlots', () => {
      it('should return true for list of setup slots', () => {
        expect(query.hasSlots(app, ['collection', 'creator'])).to.be.false;
        query.setSlot(app, 'collection', 'the-best-collection-ever');
        expect(query.hasSlots(app, ['collection', 'creator'])).to.be.false;
        query.setSlot(app, 'creator', 'the-best-band');
        expect(query.hasSlots(app, ['collection', 'creator'])).to.be.true;
      });
    });

    describe('getSlots', () => {
      it('should return all stored slots', () => {
        query.setSlot(app, 'collection', 'Stoner Rock');
        query.setSlot(app, 'band', 'Red Scalp');
        query.setSlot(app, 'album', 'Lost Ghosts');
        expect(query.getSlots(app)).to.be.deep.equal({
          collection: 'Stoner Rock',
          band: 'Red Scalp',
          album: 'Lost Ghosts',
        });
      });
    });

    describe('skipped slot', () => {
      describe(`we haven't defined it before`, () => {
        it(`should have it`, () => {
          query.setSlot(app, 'slot1', 'value-1');
          query.skipSlot(app, 'slot2');
          expect(query.hasSlot(app, 'slot2')).to.be.true;
        });

        it(`shouldn't get it in get slots function`, () => {
          query.setSlot(app, 'slot1', 'value-1');
          query.skipSlot(app, 'slot2');
          expect(query.getSlots(app)).to.be.deep.equal({
            slot1: 'value-1',
          });
        });

        it(`shouldn't forget skipped slots after upcoming updates`, () => {
          query.setSlot(app, 'slot1', 'value-1');
          query.skipSlot(app, 'slot2');
          query.setSlot(app, 'slot3', 'value-3');
          expect(query.hasSlot(app, 'slot2')).to.be.true;
        });
      });

      describe(`we have defined it before`, () => {
        it(`should be defined even`, () => {
          query.setSlot(app, 'slot1', 'value-1');
          query.setSlot(app, 'slot2', 'value-2');
          query.skipSlot(app, 'slot2');
          expect(query.hasSlot(app, 'slot2')).to.be.true;
        });

        it(`shouldn't get it in get slots function`, () => {
          query.setSlot(app, 'slot1', 'value-1');
          query.setSlot(app, 'slot2', 'value-2');
          query.skipSlot(app, 'slot2');
          expect(query.getSlots(app)).to.be.deep.equal({
            slot1: 'value-1',
          });
        });
      });
    });
  });
});
