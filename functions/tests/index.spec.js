const {expect} = require('chai');
const rewire = require('rewire');
const sinon = require('sinon');

const {buildIntentRequest, MockResponse} = require('./_utils/mocking');
const index = rewire('..');

const {wait} = require('./_utils/wait');


describe('playMedia', () => {
  let res;

  beforeEach(() => {
    res = new MockResponse();
  });

  it('should be defined', () => {
    expect(index.playMedia).to.be.ok;
  });

  it('should store last used action', () => {
    index.playMedia(buildIntentRequest({
      action: 'welcome',
      lastSeen: null,
    }), res);
    expect(res.data()).to.have.property('actions').to.have.property('action', 'welcome');
  });

  it('should warn in case of missed action', () => {
    const action = 'on-definitely-uncovered-action';
    let warning = sinon.spy();
    index.__set__('warning', warning);
    index.playMedia(buildIntentRequest({
      action,
      lastSeen: null,
    }), res);

    return wait()
      .then(() => {
        expect(warning.getCall(0).args[0]).to.includes(action);
        expect(warning).to.be.calledOnce;
      });
  });
});
