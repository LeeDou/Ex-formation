import { forEach, hasOwn } from './proto';

export function each(obj, iterator, context) {
  if (obj == null) {
    return false;
  }
  if (forEach && obj.forEach === forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
        return false;
      }
    }
  } else {
    for (var key in obj) {
      if (hasOwn.call(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) {
          return false;
        }
      }
    }
  }
}

export function toArray(iterable) {
  if (!iterable) {
    return [];
  }
  if (iterable.toArray) {
    return iterable.toArray();
  }
  if (isArray(iterable)) {
    return slice.call(iterable);
  }
  if (isArguments(iterable)) {
    return slice.call(iterable);
  }
  return values(iterable);
}

export function isArguments(obj) {
  return !!(obj && hasOwnProperty.call(obj, 'callee'));
}

export function values(obj) {
  var results = [];
  if (obj == null) {
    return results;
  }
  each(obj, function (value) {
    results[results.length] = value;
  });
  return results;
}

export function include(obj, target) {
  var found = false;
  if (obj == null) {
    return found;
  }
  if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
    return obj.indexOf(target) != -1;
  }
  each(obj, function (value) {
    if (found || (found = value === target)) {
      return breaker;
    }
  });
  return found;
}
