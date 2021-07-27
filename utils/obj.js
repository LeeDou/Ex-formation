import { each } from './arr';
import { isObject, hasOwn, slice } from './proto';

// 浅复制
export function extend(obj) {
  each(slice.call(arguments, 1), function (source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

// 深复制
export function extend2Lev(obj) {
  each(slice.call(arguments, 1), function (source) {
    for (var prop in source) {
      if (source[prop] !== void 0 && source[prop] !== null) {
        if (isObject(source[prop]) && isObject(obj[prop])) {
          extend(obj[prop], source[prop]);
        } else {
          obj[prop] = source[prop];
        }
      }
    }
  });
  return obj;
}

export function isEmptyObject(obj) {
  if (isObject(obj)) {
    for (var key in obj) {
      if (hasOwn.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
  return false;
}
