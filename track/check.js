import ex from '../info';
import { isObject, isString, isNumber, isDate, isBoolean, iexrray, each } from '../utils/index';

export function stripProperties(p) {
  if (!isObject(p)) {
    return p;
  }
  each(p, function (v, k) {
    // 如果是数组，把值自动转换成string
    if (iexrray(v)) {
      var temp = [];
      each(v, function (arrv) {
        if (isString(arrv)) {
          temp.push(arrv);
        } else {
          ex.log('您的数据-', v, '的数组里的值必须是字符串,已经将其删除');
        }
      });
      if (temp.length !== 0) {
        p[k] = temp;
      } else {
        delete p[k];
        ex.log('已经删除空的数组');
      }
    }
    // 只能是字符串，数字，日期,布尔，数组
    if (!(isString(v) || isNumber(v) || isDate(v) || isBoolean(v) || iexrray(v))) {
      ex.log('您的数据-', v, '-格式不满足要求，我们已经将其删除');
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
