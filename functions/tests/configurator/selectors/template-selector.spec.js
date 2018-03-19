const {expect} = require('chai');

const extractor = require('../../../src/configurator/parsers/extract-requirements');
const selectors = require('../../../src/configurator/selectors');
const selector = require('../../../src/configurator/selectors/template-selector');

describe('configurator', () => {
  describe('selectors', () => {
    const options = [
      '{{coverage}} - good place!',
      '{{coverage}} {{year}} - great choice!',
      '{{year}} - it was excellent year!',
      'Ok! Lets go with {{creator}} band!',
    ];

    describe('index', () => {
      xit('should choose template selector and process result on it', () => {
        expect(selectors.find(options, {
          prioritySlots: ['coverage', 'year'],
        })).to.be.equal(options[1]);
      });
    });

    describe('template selector', () => {
      it('should choose matched by keys', () => {
        expect(selector.find(options, {
          prioritySlots: ['coverage', 'year'],
        })).to.be.equal(options[1]);
      });

      describe('getMatchedTemplates', () => {
        it('should find list of all templates which match provides slots', () => {
          const templates = [
            'Album {{coverage}} {{year}}!',
            '{{coverage}} - good place!',
            '{{coverage}} {{year}} - great choice!',
            '{{year}} - it was excellent year!',
            'I love {{collection}} collection too',
          ];
          const slots = [
            'coverage',
            'year',
          ];
          expect(
            selector.getMatchedTemplates(extractor.extractRequrements(templates), slots)
          ).to.have.members([
            'Album {{coverage}} {{year}}!',
            '{{coverage}} - good place!',
            '{{coverage}} {{year}} - great choice!',
            '{{year}} - it was excellent year!',
          ]);
        });
      });

      describe('getMatchedTemplatesExactly', () => {
        it('should find list of all templates which match provides slots', () => {
          const templates = [
            'Album {{coverage}} {{year}}!',
            '{{coverage}} - good place!',
            '{{coverage}} {{year}} - great choice!',
            '{{year}} - it was excellent year!',
            'I love {{collection}} collection too',
          ];
          const slots = [
            'coverage',
            'year',
          ];
          expect(
            selector.getMatchedTemplatesExactly(extractor.extractRequrements(templates), slots)
          ).to.have.members([
            'Album {{coverage}} {{year}}!',
            '{{coverage}} {{year}} - great choice!',
          ]);
        });

        it('should match exactly templates which has all needed slots', () => {
          const templates = [
            'Album {{coverage}} {{year}}!',
            '{{coverage}} - good place!',
            '{{coverage}} {{year}} - great choice!',
            '{{year}} - it was excellent year!',
            'I love {{collection}} collection too',
          ];
          const slots = [
            'coverage',
          ];
          expect(
            selector.getMatchedTemplatesExactly(extractor.extractRequrements(templates), slots)
          ).to.have.members([
            '{{coverage}} - good place!',
          ]);
        });

        it('should also respect dot notation', () => {
          const templates = [
            'Ok! Lets go with {{creator.title}} band!',
          ];

          const slots = [
            'creator',
          ];

          expect(
            selector.getMatchedTemplatesExactly(extractor.extractRequrements(templates), slots)
          ).to.have.members([
            'Ok! Lets go with {{creator.title}} band!',
          ]);
        });
      });
    });
  });
});
