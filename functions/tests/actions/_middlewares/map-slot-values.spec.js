const { expect } = require('chai');

const middleware = require('../../../src/actions/_middlewares/map-slot-values');

describe('actions / middleware / map-slot-values', () => {
  const rules = {
    genre: {
      'christmas music': 'christmas',
    },
  };

  it('should do nothing if new values have not hit rules', () => {
    const ctx = {
      newValues: {
        album: 'the album',
        band: 'the band',
      },
    };
    const res = middleware(rules)(ctx);
    expect(res).to.be.equal(ctx);
    expect(res).to.be.deep.equal(ctx);
  });

  it('should do nothing even if slot has rule but value does not match', () => {
    const ctx = {
      newValues: {
        album: 'the album',
        band: 'the band',
        genre: 'drum and bass'
      },
    };
    const res = middleware(rules)(ctx);
    expect(res).to.be.equal(ctx);
    expect(res).to.be.deep.equal(ctx);
  });

  it('should do nothing even if slot has rule but value does not match', () => {
    const ctx = {
      newValues: {
        album: 'the album',
        band: 'the band',
        genre: ['drum and bass']
      },
    };
    const res = middleware(rules)(ctx);
    expect(res).to.be.equal(ctx);
    expect(res).to.be.deep.equal(ctx);
  });

  it('should map value of each element of array and collapse if equal results', () => {
    const ctx = {
      newValues: {
        album: 'the album',
        band: 'the band',
        genre: ['Christmas Music', 'Christmas'],
      },
    };
    const res = middleware(rules)(ctx);
    expect(res).to.be.not.equal(ctx);
    expect(res).to.be.deep.equal({
      newValues: {
        ...ctx.newValues,
        genre: ['christmas'],
      },
    });
  });

  it('should map value of slot to if we met some of rules', () => {
    const ctx = {
      newValues: {
        album: 'The album',
        band: 'The band',
        genre: 'Christmas Music'
      },
    };
    const res = middleware(rules)(ctx);
    expect(res).to.be.not.deep.equal(ctx);
    expect(res).to.be.deep.equal({
      newValues: {
        ...ctx.newValues,
        genre: 'christmas',
      },
    });
  });
});
