/**
 * author likang@sensorsdata.cn
 */

import { isEmptyObject, isObject, extend, decodeURIComponent, each } from '../utils';
import { parseQuery, getCustomUtmFromQuery, detectOption } from './query';
import { sa } from sa;
import { latest_source_channel } from '../core/global';

export function setLatestChannel (channel) {
  if (!isEmptyObject(channel)) {
    if (includeChannel(channel, latest_source_channel)) {
      sa.clearAppRegister(latest_source_channel);
      sa.clearAllProps(latest_source_channel);
    }
    sa.para.is_persistent_save.utm
      ? sa.register(channel)
      : sa.registerApp(channel);
  }

  function includeChannel(channel, arr) {
    var found = false;
    for (var i in arr) {
      if (channel[arr[i]]) {
        found = true;
      }
    }
    return found;
  }
};


// setUtm 修改 getUtm
export function getUtm (para) {
  var utms = {};
  var query = parseQuery(para);
  var pre1 = getCustomUtmFromQuery(query, '$', '_', '$');
  var pre2 = getCustomUtmFromQuery(query, '$latest_', '_latest_', '$latest_');
  utms.pre1 = pre1;
  utms.pre2 = pre2;
  // 不在方法内通过引用来赋值
  // extend(prop, pre1);
  return utms;
};


// getMixedQuery 更改为 parseQuery
// 从query,q,scene三个参数中，解析得到一个整合的query对象
export function parseQuery (para) {
  var obj = detectOption(para);
  var scene = obj.scene;
  var q = obj.q;
  var query = obj.query;
  for (var i in query) {
    query[i] = decodeURIComponent(query[i]);
  }
  if (scene) {
    scene = decodeURIComponent(scene);
    if (scene.indexOf('?') !== -1) {
      scene = '?' + scene.replace(/\?/g, '');
    } else {
      scene = '?' + scene;
    }
    query = extend(query, getObjFromQuery(scene));
  }

  // 普通二维码的q
  if (q) {
    query = extend(query, getObjFromQuery(decodeURIComponent(q)));
  }
  return query;
};

// 此方法会用到系统 API
export function getUtmFromPage() {
  var newObj = {};
  try {
    var allpages = getCurrentPages();
    var myvar = JSON.parse(
      JSON.stringify(allpages[allpages.length - 1].options)
    );

    for (var i in myvar) {
      myvar[i] = decodeURIComponent(myvar[i]);
    }

    newObj = getCustomUtmFromQuery(myvar, '$', '_', '$');
  } catch (e) {
    logger.info(e);
  }
  return newObj;
};
