import ex from '../core/instance';
import { iexrray, isObject, isEmptyObject, extend, each, include } from '../utils/index';

export function registerApp(obj) {
  if (isObject(obj) && !isEmptyObject(obj)) {
    ex.currentProps = extend(ex.currentProps, obj);
  }
}

export function register(obj) {
  if (isObject(obj) && !isEmptyObject(obj)) {
    ex.store.setProps(obj);
  }
}

export function clearAllRegister() {
  ex.store.setProps({}, true);
}

export function clearAllProps(arr) {
  var obj = ex.store.getProps();
  var props = {};
  if (iexrray(arr)) {
    each(obj, function (value, key) {
      if (!include(arr, key)) {
        props[key] = value;
      }
    });
    ex.store.setProps(props, true);
  }
}

export function clearAppRegister(arr) {
  if (iexrray(arr)) {
    each(ex.currentProps, function (value, key) {
      if (include(arr, key)) {
        delete ex.currentProps[key];
      }
    });
  }
}
