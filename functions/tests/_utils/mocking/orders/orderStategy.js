class MockOrderStrategy {
  getPage () {
    return {};
  }

  hasNext () {
    return true;
  }

  moveSourceCursorToTheNextPosition () {

  }

  updateCursorTotal () {

  }

  songsPostProcessing ({songs}) {
    return songs;
  }
}

module.exports = () => new MockOrderStrategy();
