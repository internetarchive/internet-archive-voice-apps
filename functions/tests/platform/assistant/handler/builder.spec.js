const {expect} = require('chai');
const sinon = require('sinon');

const builder = require('../../../../src/platform/assistant/handler/builder');

describe('platform', () => {
  describe('assistant', () => {
    it('should populate intent handlers without states', () => {
      const actionsMap = new Map([
        ['welcome', {default: sinon.spy}],
        ['hello', {default: sinon.spy}],
      ]);
      const res = builder({actionsMap});
      expect(res).to.have.lengthOf(2);
      expect(res[0]).to.have.property('intent', 'welcome');
      expect(res[1]).to.have.property('intent', 'hello');
    });

    describe('with state', () => {
      let actionsMap;
      let app;
      let helloHandlers;
      let welcomeHandlers;

      beforeEach(() => {
        app = {};

        helloHandlers = {
          default: sinon.spy(),
        };

        welcomeHandlers = {
          default: sinon.spy(),
          playback: sinon.spy(),
        };

        actionsMap = new Map([
          ['welcome', welcomeHandlers],
          ['hello', helloHandlers],
        ]);
      });

      it('should populate intent handlers with states', () => {
        const res = builder({actionsMap});
        expect(res).to.have.lengthOf(2);
        expect(res[0]).to.have.property('intent', 'welcome');
        expect(res[1]).to.have.property('intent', 'hello');
      });

      it('should run default handler when state', () => {
        const res = builder({actionsMap});
        return res[0].handler({
          app,
        })
          .then(() => {
            expect(welcomeHandlers.default).to.have.been.calledWith(app);
          });
      });
    });
  });
});
