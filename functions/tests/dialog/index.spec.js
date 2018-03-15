const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const mockApp = require('../_utils/mocking/app');
const mockAudio = require('../_utils/mocking/dialog');
const dialog = rewire('../../src/dialog');

describe('dialog', () => {
  it('should process options throw pipeline before apply to playsound', () => {
    const orgOptions = {
      name: 'org options',
    };
    const newOptions = {
      name: 'new options',
    };
    const mockPipeline = {
      process: sinon.stub().returns(newOptions),
    };
    const app = mockApp();
    const audio = mockAudio();
    dialog.use(mockPipeline);
    dialog.__set__('audio', audio);

    dialog.playSong(app, orgOptions);

    expect(mockPipeline.process).to.calledWith(app, orgOptions);
    expect(audio.playSong).to.calledWith(app, newOptions);
  });
});
