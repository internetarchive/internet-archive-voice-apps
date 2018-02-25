const debug = require('debug')('ia:actions:select-creator:debug');

const dialog = require('../dialog');

const creatorProvider = require('../provider/creator');
const querySlots = require('../state/query');

function handler (app) {
  debug('Handle select coverage and date');
  const coverage = app.getArgument('coverages');
  if (coverage) {
    debug(`get coverages ${coverage}`);
    querySlots.setSlot(app, 'converage', coverage);
  }

  const year = app.getArgument('date');
  if (year) {
    debug(`get year ${year}`);
    querySlots.setSlot(app, 'date', year);
  }

  // TODO: if we have coverage, date, and creator
  // we could get album id

  // TODO: maybe we can catch album with less information
  // for example when only one artist was played in this town
  // at that year.

  const creatorId = querySlots.getSlot(app, 'creator');
  creatorProvider
    .fetchAlbumsByQuery({
      coverage,
      creatorId,
      year,
    })
    .then(albums => {
      debug('get albums');
      debug(albums.items);
      switch (albums.items.length) {
        case 0:
          // TODO: there is no such album
          // suggest other albums
          dialog.ask(app, {speech: 'DEBUG: there is no such album'});
          break;
        case 1:
          // TODO: play it!
          dialog.ask(app, {
            speech: `DEBUG: play album: ${albums.items[0].title}`,
          });
          break;
        default:
          // TODO: we get more than 1 album
          // maybe we should ask user to clarify which album
          // to play.

          // TODO: of if we pretty sure they are very close like:
          // - https://archive.org/details/gd73-06-09.sbd.hollister.172.sbeok.shnf
          // - https://archive.org/details/gd73-06-10.sbd.hollister.174.sbeok.shnf
          // we should play they are together.
          const names = albums.items
            .slice(0, 10)
            .map(album => `${album.coverage} ${album.year}`)
            .join(', ');

          dialog.ask(app, {
            speech: `DEBUG: we get ${albums.items.length} albums: ${names}`,
          });
          break;
      }
    });
}

module.exports = {
  handler,
};
