const {expect} = require('chai');

const extractor = require('../../../src/configurator/parsers/extract-requirements');

describe('configurator', () => {
  describe('parsers', () => {
    describe('extractRequrements', () => {
      it('should extract plain slot requrements', () => {
        const templates = [
          'Album {{coverage}} {{year}}!',
          '{{coverage}} - good place!',
          '{{coverage}} {{year}} - great choice!',
          '{{year}} - it was excellent year!',
          'I love {{collection}} collection too',
        ];

        const res = extractor.extractRequrements(templates);
        expect(res).to.have.length(templates.length);
        expect(res[0]).to.have.property('requirements')
          .to.have.members(['coverage', 'year']);
        expect(res[4]).to.have.property('requirements')
          .to.have.members(['collection']);
      });

      it('should respect dot notation', () => {
        const templates = [
          'Ok! Lets go with {{creator.title}} band!',
        ];

        const res = extractor.extractRequrements(templates);
        expect(res).to.have.length(templates.length);
        expect(res[0]).to.have.property('requirements')
          .to.have.members(['creator']);
      });

      it('should fetch const requirements from resolvers', () => {
        const templates = [
          'Ok! Lets go with {{__resolvers.creator.title}} band!',
        ];

        const res = extractor.extractRequrements(templates);
        expect(res).to.have.length(templates.length);
        expect(res[0]).to.have.property('requirements')
          .to.have.members(['creatorId']);
      });

      it('should fetch callback requirements from resolvers', () => {
        const templates = [
          `You've selected {{__resolvers.alias.collectionId}} collection.`,
        ];

        const res = extractor.extractRequrements(templates);
        expect(res).to.have.length(templates.length);
        expect(res[0]).to.have.property('requirements')
          .to.have.members(['collectionId']);
      });
    });

    describe('getListOfRequiredSlots', () => {
      it('should return list of names of needed slots', () => {
        expect(
          extractor.getListOfRequiredSlots('{{coverage}} {{year}} - great choice!')
        ).to.have.members([
          'coverage',
          'year',
        ]);
      });
    });
  });
});
