class DynamoDbPersistenceAdapterMock {
  constructor () {
    this.attributes = {};
  }

  getAttributes (requestEnvelope) {
    return Promise.resolve(this.attributes);
  }

  saveAttributes () {
    return Promise.resolve();
  }
}

module.exports = DynamoDbPersistenceAdapterMock;
