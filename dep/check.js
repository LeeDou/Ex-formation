/**
 * author likang@sensorsdata.cn
 * data check
 */

import {
  isObject,
  isString,
  isNumber,
  isDate,
  isBoolean,
  isArray,
  each,
} from '../utils';
// 需单独引入 logger
import logger from 'logger';

export function stripProperties(p) {
  if (!isObject(p)) {
    return p;
  }
  each(p, function (v, k) {
    // 如果是数组，把值自动转换成string
    if (isArray(v)) {
      var temp = [];
      each(v, function (arrv) {
        if (isString(arrv)) {
          temp.push(arrv);
        } else {
          logger.info('您的数据-', v, '的数组里的值必须是字符串,已经将其删除');
        }
      });
      if (temp.length !== 0) {
        p[k] = temp;
      } else {
        delete p[k];
        logger.info('已经删除空的数组');
      }
    }
    // 只能是字符串，数字，日期,布尔，数组
    if (
      !(isString(v) || isNumber(v) || isDate(v) || isBoolean(v) || isArray(v))
    ) {
      logger.info('您的数据-', v, '-格式不满足要求，我们已经将其删除');
      delete p[k];
    }
  });
  return p;
}

// 去掉undefined和null
export function removeEmpty(p) {
  var ret = {};
  each(p, function (v, k) {
    if (v) {
      ret[k] = v;
    }
  });
  return ret;
}
