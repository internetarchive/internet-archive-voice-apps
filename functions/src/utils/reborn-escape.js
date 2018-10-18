/**
 * Original escape was depricated so we can't use it
 *
 * To be more stringent in adhering to RFC 3986
 *
 * from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
 *
 * @param str
 */
module.exports = str => encodeURIComponent(str)
  .replace(
    /[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16)
  );
