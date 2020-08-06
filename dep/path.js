/**
 * author likang@sensorsdata.cn
 */
import logger from 'logger';
import { isObject } from './util';

export function getPath(path) {
  if (typeof path === 'string') {
    path = path.replace(/^\//, '');
  } else {
    path = '取值异常';
  }
  return path;
}

/**
 * getCurrenPage 依赖于小程序环境，此接口在所有的小程序中均存在，后期可以考虑在全局判断是否存在，然后通过另一变量进行保存
 */
export function getCurrentPath() {
  var url = '未取到';
  try {
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    url = currentPage.route;
  } catch (e) {
    logger.info(e);
  }
  return url;
}

export function getCurrentUrl(me) {
  var path = getCurrentPath();
  var query = '';
  if (isObject(me) && me.sensors_mp_encode_url_query) {
    query = me.sensors_mp_encode_url_query;
  }
  if (path) {
    return query ? path + '?' + query : path;
  } else {
    return '未取到';
  }
}
