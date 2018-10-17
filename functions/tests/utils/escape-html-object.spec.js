const { expect } = require('chai');

const escapeHTMLObject = require('../../src/utils/escape-html-object');

describe('utils', () => {
  describe('escape html object', () => {
    it('should skip fields', () => {
      const res = escapeHTMLObject({
        filename: 'jfjo2009-10-02d1t02.mp3',
        title: 'David',
        audioURL: 'https://archive.org/download/jfjo2009-10-02.superlux.flac16/jfjo2009-10-02d1t02.mp3',
        collections: [],
        coverage: 'Toronto, ON',
        creator: 'Jacob Fred Jazz Odyssey',
        imageURL: 'https://archive.org/services/img/jfjo2009-10-02.superlux.flac16',
        suggestions: [],
        album: [],
        track: 2,
        year: 2009
      }, { skipFields: ['audioURL', 'imageURL'] });

      expect(res).to.have.property('audioURL', 'https://archive.org/download/jfjo2009-10-02.superlux.flac16/jfjo2009-10-02d1t02.mp3');
      expect(res).to.have.property('imageURL', 'https://archive.org/services/img/jfjo2009-10-02.superlux.flac16');
    });
  });
});
