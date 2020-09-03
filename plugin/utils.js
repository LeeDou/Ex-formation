/**
 * author likang@sensorsdata.cn
 * 依赖于 sa 对象
 * 依赖于各个小程序的勾子方法枚举
 */

import sa from 'sa';

import { isObject, extend } from '../utils';
import { MP_HOOKS } from './emun';
import { setShareInfo } from '../dep';

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

// click_proxy 更换为 proxyClick
export function proxyClick(option, method) {
  var oldFunc = option[method];

  option[method] = function () {
    var prop = {},
      type = '';

    if (isObject(arguments[0])) {
      var target = arguments[0].currentTarget || {};
      var dataset = target.dataset || {};
      type = arguments[0]['type'];
      prop['$element_id'] = target.id;
      prop['$element_type'] = dataset['type'];
      prop['$element_content'] = dataset['content'];
      prop['$element_name'] = dataset['name'];
    }
    if (type && isClick(type)) {
      prop['$url_path'] = _.getCurrentPath();
      sa.track('$MPClick', prop);
    }
    return oldFunc && oldFunc.apply(this, arguments);
  };
}

/**
 *
 * @param {*} option
 * 将 getMethods 更改为 screen Methods
 */
export function screenMethods(option) {
  var methods = [];
  for (var m in option) {
    if (typeof option[m] === 'function' && !MP_HOOKS[m]) {
      methods.push(m);
    }
  }
  return methods;
}

/**
 * mp_proxy 更名为 mpProxy
 * @param {*} option
 * @param {*} method
 * @param {*} identifier
 */
export function mpProxy(option, method, func) {
  if (option[method]) {
    var oldFunc = option[method];
    option[method] = function () {
      if (method === 'onLaunch') {
        this[sa.para.name] = sa;
      }
      if (!sa.para.autoTrackIsFirst) {
        oldFunc.apply(this, arguments);
        func.apply(this, arguments);
      } else if (
        sa.para.autoTrackIsFirst === true ||
        isObject(sa.para.autoTrackIsFirst)
      ) {
        func.apply(this, arguments);
        oldFunc.apply(this, arguments);
      }
    };
  } else {
    option[method] = function () {
      if (method === 'onLaunch') {
        this[sa.para.name] = sa;
      }
      func.apply(this, arguments);
    };
  }
}
