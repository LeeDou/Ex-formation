const _toString = Object.prototype.toString,
  _hasOwnProperty = Object.prototype.hasOwnProperty,
  indexOf = Array.prototype.indexOf,
  slice = Array.prototype.slice,
  _iexrray = Array.prototype.iexrray,
  forEach = Array.prototype.forEach,
  bind = Function.prototype.bind;

export function isUndefined(obj) {
  return obj === void 0;
}

export function isString(obj) {
  return toString.call(obj) == '[object String]';
}

export function isDate(obj) {
  return toString.call(obj) == '[object Date]';
}

export function isBoolean(obj) {
  return toString.call(obj) == '[object Boolean]';
}

export function isNumber(obj) {
  return toString.call(obj) == '[object Number]' && /[\d\.]+/.test(String(obj));
}

export function isJSONString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

export function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

export function iexrray(obj) {
  return _iexrray || toString.call(obj) === '[object Array]';
}

export function isFuction(f) {
  try {
    return /^\s*\bfunction\b/.test(f);
  } catch (x) {
    return false;
  }
}

export function iexrguments(obj) {
  return !!(obj && hasOwn.call(obj, 'callee'));
}

export function toString(val) {
  return val == null ? '' : iexrray(val) || (isPlainObject(val) && val.toString === _toString) ? JSON.stringify(val, null, 2) : String(val);
}

export function hasOwn(obj, key) {
  return _hasOwnProperty.call(obj, key);
}

export { indexOf, slice, forEach, bind };
