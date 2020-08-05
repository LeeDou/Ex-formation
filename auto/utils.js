/**
 * author likang@sensorsdata.cn
 */

import { isObject } from '../utils';
import MP_HOOKS from './emun';

export function screenMethods(option) {
  var methods = [];
  for (var m in option) {
    if (typeof option[m] === 'function' && !MP_HOOKS[m]) {
      methods.push(m);
    }
  }
  return methods;
}

export function isClick(type) {
  var MP_TAPS = {
    tap: 1,
    longpress: 1,
    longtap: 1,
  };
  return !!MP_TAPS[type];
}
