/**
 * author likang@sensorsdata.cn
 */

// 需要单独引入 sa 及 logger
import sa from 'sa';
import logger from 'logger';

// 依赖于 sa 的配置参数
export function formatString(str) {
  if (str.length > sa.para.max_string_length) {
    logger.info('字符串长度超过限制，已经做截取--' + str);
    return str.slice(0, sa.para.max_string_length);
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
