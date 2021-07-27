import ex from '../core/instance';
import { isObject } from './proto';
import { each } from './arr';
export function formatString(str) {
  if (str.length > ex.para.max_string_length) {
    ex.log('字符串长度超过限制，已经做截取--' + str);
    return str.slice(0, ex.para.max_string_length);
  } else {
    return str;
  }
}

export function searchObjString(o) {
  if (isObject(o)) {
    each(o, function (a, b) {
      if (isObject(a)) {
        searchObjString(o[b]);
      } else {
        if (isString(a)) {
          o[b] = formatString(a);
        }
      }
    });
  }
}
