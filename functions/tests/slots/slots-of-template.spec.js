const {expect} = require('chai');

const {getListOfRequiredSlots, getMatchedTemplates, getMatchedTemplatesExactly} = require('../../slots/slots-of-template');

describe('slots', () => {
  describe('getListOfRequiredSlots', () => {
    it('should return list of names of needed slots', () => {
      expect(
        getListOfRequiredSlots('{{coverage}} {{year}} - great choice!')
      ).to.have.members([
        'coverage',
        'year',
      ]);
    });
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
        getMatchedTemplates(templates, slots)
      ).to.have.members([
        'Album {{coverage}} {{year}}!',
        '{{coverage}} - good place!',
        '{{coverage}} {{year}} - great choice!',
        '{{year}} - it was excellent year!',
      ])
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
        getMatchedTemplatesExactly(templates, slots)
      ).to.have.members([
        'Album {{coverage}} {{year}}!',
        '{{coverage}} {{year}} - great choice!',
      ]);
    });
  });
});