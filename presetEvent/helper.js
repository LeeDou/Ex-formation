import OFFICAL_METHODS from './methods';
import { isObject } from '../utils/index';
import ex from '../core/instance';
export function clickProxy(option, method) {
  var oldFunc = option[method];

  option[method] = function () {
    var prop = {},
      type = '';

    if (isObject(arguments[0])) {
      var target = arguments[0].currentTarget || {};
      var dataset = target.dataset || {};
      type = arguments[0]['type'];

      // getCurrentPath 需要重新定义
      prop['$url_path'] = ex.getCurrentPath();
      prop['$element_id'] = target.id;
      prop['$element_type'] = dataset['type'];
      prop['$element_content'] = dataset['content'];
      prop['$element_name'] = dataset['name'];
    }
    if (type && isClick(type)) {
      ex.track('$MPClick', prop);
    }
    return oldFunc.apply(this, arguments);
  };
}

export function getMethods(option) {
  var methods = [];
  for (var m in option) {
    if (typeof option[m] === 'function' && !OFFICAL_METHODS[m]) {
      methods.push(m);
    }
  }
  return methods;
}

export function isClick(type) {
  var TAPS = {
    tap: 1,
    longpress: 1,
    longtap: 1
  };
  return !!TAPS[type];
}

export function getScene(key) {
  if (typeof key === 'number' || (typeof key === 'string' && key !== '')) {
    key = String(key);
    return key;
  } else {
    return '未取到值';
  }
}
