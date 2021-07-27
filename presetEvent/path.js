import ex from '../core/instance';
import { isObject } from '../utils/index';

export function getPath(path) {
  if (typeof path === 'string') {
    path = path.replace(/^\//, '');
  } else {
    path = '取值异常';
  }
  return path;
}

export function getCurrentPath() {
  var url = '未取到';
  try {
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    url = currentPage.route;
  } catch (e) {
    ex.log(e);
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
