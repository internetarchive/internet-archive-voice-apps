const books = require('./lib/books-dataset');

const config = require('./config');

books.fetchAllAndSaveToFile(config.books);
