const mediaStatusUpdate = require('./media-status-update');

module.exports = {
  handler: mediaStatusUpdate.handleFinished,
};
