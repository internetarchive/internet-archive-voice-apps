class MockOrderStrategy {
  getPage () {
    return {};
  }

  getNextCursorPosition ({ current }) {
    return current;
  }

  hasNext () {
    return true;
  }

  updateCursorTotal () {

  }

  songsPostProcessing ({ songs }) {
    return songs;
  }
}

module.exports = () => new MockOrderStrategy();
