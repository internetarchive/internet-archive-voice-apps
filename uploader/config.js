module.exports = {
  books: {
    endpoint: 'https://archive.org/advancedsearch.php?q=collection:{{collectionId}}&fl[]=creator,year,title,subject,identifier&rows={{pageSize}}&page={{pageIndex}}&output=json',
    collectionId: 'librivoxaudio',
    pageSize: 3,
  },
};
