import { isEmptyObject, isObject, extend, decodeURIComponent, each } from '../utils/index';
import { parseQuery, getCustomUtmFromQuery, detectOption } from './query';
import ex from '../core/instance';

export function setLatestChannel(channel) {
  if (!isEmptyObject(channel)) {
    if (includeChannel(channel, ex.latest_source_channel)) {
      ex.clearAppRegister(ex.latest_source_channel);
      ex.clearAllProps(ex.latest_source_channel);
    }
    ex.para.is_persistent_exve.utm ? ex.register(channel) : ex.registerApp(channel);
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
}

// setUtm 修改 getUtm
export function getUtm(para) {
  var utms = {};
  var query = parseQuery(para);
  var pre1 = getCustomUtmFromQuery(query, '$', '_', '$');
  var pre2 = getCustomUtmFromQuery(query, '$latest_', '_latest_', '$latest_');
  utms.pre1 = pre1;
  utms.pre2 = pre2;
  // 不在方法内通过引用来赋值
  // extend(prop, pre1);
  return utms;
}

// 此方法会用到系统 API
export function getUtmFromPage() {
  var newObj = {};
  try {
    var allpages = getCurrentPages();
    var myvar = JSON.parse(JSON.stringify(allpages[allpages.length - 1].options));

    for (var i in myvar) {
      myvar[i] = decodeURIComponent(myvar[i]);
    }

    newObj = getCustomUtmFromQuery(myvar, '$', '_', '$');
  } catch (e) {
    ex.log(e);
  }
  return newObj;
}
