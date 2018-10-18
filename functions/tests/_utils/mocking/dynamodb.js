class DynamoDbPersistenceAdapterMock {
  constructor () {
    this.attributes = {};
  }

  getAttributes (requestEnvelope) {
    return Promise.resolve(this.attributes);
  }

  saveAttributes (requestEnvelope, attributes) {
    this.attributes = attributes;
    return Promise.resolve();
  }
}

module.exports = DynamoDbPersistenceAdapterMock;
