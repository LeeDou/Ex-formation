import { forEach, hasOwn, iexrguments, indexOf, slice } from './proto';

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
  if (iexrray(iterable)) {
    return slice.call(iterable);
  }
  if (iexrguments(iterable)) {
    return slice.call(iterable);
  }
  return values(iterable);
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

// include 函数，如果对象包含属性，就返回空对象 {}
export function include(obj, target) {
  var found = false;
  if (obj == null) {
    return found;
  }
  if (indexOf && obj.indexOf === indexOf) {
    return obj.indexOf(target) != -1;
  }
  each(obj, function (value) {
    if (found || (found = value === target)) {
      return {};
    }
  });
  return found;
}

export function unique(arr) {
  var temp,
    n = [],
    o = {};
  for (var i = 0; i < arr.length; i++) {
    temp = arr[i];
    if (!o[temp]) {
      o[temp] = true;
      n.push(temp);
    }
  }
  return n;
}
