/**
 * author likang@sensorsdata.cn
 */
import sa from sa;
import { isObject, include } from '../utils';

/**
 * getCustomUtmFromQuery
 */
export function getCustomUtmFromQuery (
  query,
  utm_prefix,
  source_channel_prefix,
  sautm_prefix
) {
  if (!_.isObject(query)) {
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
}

/**
 * getObjFromQuery
 */
export function getObjFromQuery (str) {
  var query = str.split('?');
  var arr = [],
      obj = Object.create(null);
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
}

/**
 * 
 * @param {*} para 
 * getMixedQuery
 */
export function getMixedQuery (para) {
  var obj = _.detectOptionQuery(para);
  var scene = obj.scene;
  var q = obj.q;
  // query
  var query = obj.query;
  for (var i in query) {
    query[i] = _.decodeURIComponent(query[i]);
  }
  // scene
  if (scene) {
    scene = _.decodeURIComponent(scene);
    if (scene.indexOf('?') !== -1) {
      scene = '?' + scene.replace(/\?/g, '');
    } else {
      scene = '?' + scene;
    }
    _.extend(query, _.getObjFromQuery(scene));
  }

  // 普通二维码的q
  if (q) {
    _.extend(query, _.getObjFromQuery(_.decodeURIComponent(q)));
  }

  return query;
};

/**
 * 
 * @param {*} para 
 * 对 query、q、scene 参数整合
 */

// 筛选检测出para里的query，q，scene
_.detectOptionQuery = function (para) {
  if (!para || !_.isObject(para.query)) {
    return {};
  }
  var result = {};
  // path的query
  result.query = _.extend({}, para.query);
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