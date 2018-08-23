module.exports = {
  books: {
    endpoint: 'https://archive.org/advancedsearch.php?q=collection:{{collectionId}}&fl[]=creator,year,title,subject,identifier&rows={{pageSize}}&page={{pageIndex}}&output=json',
    collectionId: 'librivoxaudio',

    // load only 3 pages
    numOfPages: 3,

    // size of page
    pageSize: 50,

    // save to json

    // output: {
    //   format: 'json',
    //   filename: 'datasets/audio-books.json',
    //   encoding: 'utf8',
    // },

    // save to csv

    output: {
      format: 'csv',
      filename: 'datasets/audio-books.csv',
      encoding: 'utf8',
    },
  },
};
