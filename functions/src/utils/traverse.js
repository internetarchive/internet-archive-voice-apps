function traverseObject (o, callback) {
  for (const key in o) {
    const oldValue = o[key];
    const newValue = traverse(oldValue, callback);
    if (newValue !== oldValue) {
      // FIXME: shouldn't mutate
      o[key] = newValue;
    }
  }
  return o;
}

function traverseArray (a, callback) {
  for (let i = 0; i < a.length; i++) {
    const oldValue = a[i];
    const newValue = traverse(oldValue, callback);
    if (newValue !== oldValue) {
      // FIXME: shouldn't mutate
      a[i] = newValue;
    }
  }
  return a;
}

/**
 * traverse object o and run callback for all properties
 *
 * @param o
 * @param callback
 */
function traverse (o, callback) {
  if (Array.isArray(o)) {
    return traverseArray(o, callback);
  } else if (typeof o === 'object') {
    return traverseObject(o, callback);
  } else {
    return callback(o);
  }
}

module.exports = traverse;
