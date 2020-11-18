/**
 * author likang@sensorsdata.cn
 */
import sa from sa;
import { isObject, include, isEmptyObject, isString, decodeURIComponent } from '../utils';


// 修改 detectOptionQuery 为 detectOption
// 筛选检测出para里的query，q，scene
export function detectOption(para) {
  if (!para || !isObject(para.query)) {
    return {};
  }
  var result = {};
  // path的query
  result.query = extend({}, para.query);
  //如果query有scene，认为scene是b接口传过来的
  if (typeof result.query.scene === 'string' && isBScene(result.query)) {
    result.scene = result.query.scene;
    delete result.query.scene;
  }
  //如果query有q
  if (
    para.query.q &&
    para.query.scancode_time &&
    String(para.scene).slice(0, 3) === '101'
  ) {
    result.q = String(result.query.q);
    delete result.query.q;
    delete result.query.scancode_time;
  }
  function isBScene(obj) {
    var source = [
      'utm_source',
      'utm_content',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'sa_utm',
    ];
    var source_keyword = source.concat(sa.para.source_channel);
    var reg = new RegExp('(' + source_keyword.join('|') + ')%3D', 'i');
    var keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === 'scene' && reg.test(obj.scene)) {
      return true;
    } else {
      return false;
    }
  }
  return result;
};
export function getObjFromQuery (str) {
  var query = str.split('?');
  var arr = [];
  var obj = {};
  if (query && query[1]) {
    each(query[1].split('&'), function (value) {
      arr = value.split('=');
      if (arr[0] && arr[1]) {
        obj[arr[0]] = arr[1];
      }
    });
  } else {
    return {};
  }
  return obj;
};


//获取自定义key的utm值
export function getCustomUtmFromQuery (
  query,
  utm_prefix,
  source_channel_prefix,
  sautm_prefix
) {
  if (!isObject(query)) {
    return {};
  }
  var result = {};
  if (query['sa_utm']) {
    for (var i in query) {
      if (i === 'sa_utm') {
        result[sautm_prefix + i] = query[i];
        continue;
      }
      if (include(sa.para.source_channel, i)) {
        result[source_channel_prefix + i] = query[i];
      }
    }
  } else {
    for (var i in query) {
      if ((' ' + source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
        result[utm_prefix + i] = query[i];
        continue;
      }
      if (include(sa.para.source_channel, i)) {
        result[source_channel_prefix + i] = query[i];
      }
    }
  }
  return result;
};

// setQUery 修改为 getQueryUrl
export function getQueryUrl (params, isEncode) {
  var url_query = '';
  if (params && isObject(params) && !isEmptyObject(params)) {
    var arr = [];
    each(params, function (value, key) {
      // 防止传统二维码的para.q这种异常query。另外异常的para.scene 不好判断，直接去掉。建议不要使用这个容易异意的参数
      if (
        !(key === 'q' && isString(value) && value.indexOf('http') === 0) &&
        key !== 'scene'
      ) {
        if (isEncode) {
          arr.push(key + '=' + value);
        } else {
          arr.push(key + '=' + decodeURIComponent(value));
        }
      }
    });
    return arr.join('&');
  } else {
    return url_query;
  }
};