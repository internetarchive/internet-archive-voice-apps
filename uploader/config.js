module.exports = {
  books: {
    endpoint: 'http://archive.org/advancedsearch.php?q=collection:librivoxaudio&fl[]=creator,year,title,subject,identifier&rows={{pageSize}}&page={{pageIndex}}&output=json',

    // load only 3 pages
    // numOfPages: 3,

    // size of page
    pageSize: 50,

    fields: [
      'title',
    ],

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
      quoted: true,
    },
  },
};
