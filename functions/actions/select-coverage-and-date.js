const debug = require('debug')('ia:actions:select-creator:debug');

const dialog = require('../dialog');

const albumsProvider = require('../provider/albums');
const search = require('../provider/audio');
const playlist = require('../state/playlist');
const querySlots = require('../state/query');

function handler (app) {
  debug('Handle select coverage and date');

  const coverage = app.getArgument('coverages');
  if (coverage) {
    debug(`get coverages ${coverage}`);
    querySlots.setSlot(app, 'converage', coverage);
  }

  const date = app.getArgument('date');
  debug(`get date ${date}`);

  let year = app.getArgument('year');
  debug(`get year ${year}`);

  if (date && !year) {
    // extract year
    year = (new Date(date)).getFullYear();
  }

  querySlots.setSlot(app, 'year', year);

  // TODO: maybe we can catch album with less information
  // for example when only one artist was played in this town
  // at that year. Thus Town and year could be enough.

  // If we have coverage, date, and creator
  // we could get album id
  const creatorId = querySlots.getSlot(app, 'creator');
  albumsProvider
    .fetchAlbumsByQuery({
      coverage,
      creatorId,
      year,
    })
    .then(albums => {
      debug(`get ${albums.items.length} albums`);
      debug(albums.items);
      let albumId = null;
      switch (albums.items.length) {
        case 0:
          // TODO: there is no such album
          // suggest other albums
          dialog.ask(app, {speech: 'DEBUG: there is no such album'});
          break;
        case 1:
          // TODO: play it!
          // dialog.ask(app, {
          //   speech: `DEBUG: play album: ${albums.items[0].title}`,
          // });
          albumId = albums.items[0].identifier;
          break;
        default:
          // TODO: we get more than 1 album
          // maybe we should ask user to clarify which album
          // to play.

          // TODO: of if we pretty sure they are very close like:
          // - https://archive.org/details/gd73-06-09.sbd.hollister.172.sbeok.shnf
          // - https://archive.org/details/gd73-06-10.sbd.hollister.174.sbeok.shnf
          // we should play they are together.
          // const names = albums.items
          //   .slice(0, 10)
          //   .map(album => `${album.coverage} ${album.year}`)
          //   .join(', ');

          // dialog.ask(app, {
          //   speech: `DEBUG: we get ${albums.items.length} albums: ${names}`,
          // });

          // TODO: for the moment just play 1st album
          // but we should make playlist from all albums
          albumId = albums.items[0].identifier;
          break;
      }

      if (albumId) {
        search.fetchAlbumDetails(albumId)
          .then(album => {
            debug(`We get album ${JSON.stringify(album)}`);
            const songs = album.songs
              .map((song, idx) => Object.assign({}, song, {
                audioURL: search.getSongUrlByAlbumIdAndFileName(albumId, song.filename),
                coverage: album.coverage,
                imageURL: `https://archive.org/services/img/${albumId}`,
                // TODO : add recommendations
                suggestions: ['TODO'],
                track: idx + 1,
                year: album.year,
              }));

            playlist.create(app, songs);

            dialog.playSong(app, playlist.getCurrentSong(app));
          })
          .catch(err => {
            dialog.ask(app, {
              speech: `We got an error: ${JSON.stringify(err)}. Do you want to try again?`
            });
          });
      }
    });
}

module.exports = {
  handler,
};
