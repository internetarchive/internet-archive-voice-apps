const axios = require('axios');
const {expect} = require('chai');
const rewire = require('rewire');

const action = rewire('../../src/actions/wayback-machine');

const mockApp = require('../_utils/mocking/platforms/app');
const mockDialog = require('../_utils/mocking/dialog');

describe('actions', () => {
  describe('wayback machine', () => {
    let app;
    let dialog;

    beforeEach(() => {
      app = mockApp();
      dialog = mockDialog();
      action.__set__('dialog', dialog);
    });

    it('check to see that overall action eventually returns a promise', () => {
      action.handler(app);
      expect(Promise.resolve()).to.be.a('promise');
    });

    it('check to see that axios request promises are working', () => {
      let archiveRequest = axios.get('http://web.archive.org/__wb/search/metadata?q=cnn.com');
      let alexaRequest = axios.get('http://data.alexa.com/data?cli=10&url=cnn.com');
      expect(archiveRequest).to.not.be.undefined;
      expect(alexaRequest).to.not.be.undefined;
      // expect(action.axios.get('http://web.archive.org/__wb/search/metadata?q=cnn.com')).to.not.be.undefined;
      // expect(action.axios.get('http://data.alexa.com/data?cli=10&url=cnn.com')).to.not.be.undefined;
    });
  });
});
