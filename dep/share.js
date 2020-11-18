/**
 * author likang@sensorsdata.cn
 */

import { isObject, decodeURIComponent, isJSONString } from '../utils';
import store from './store';

export function getShareInfo(para) {
  var share = {};
  var obj = {};
  var prop = {};
  var info = {};
  var current_id = store.getDistinctId();
  var current_first_id = store.getFirstId();
  if (para && isObject(para.query) && para.query.sampshare) {
    share = decodeURIComponent(para.query.sampshare);
    if (isJSONString(share)) {
      share = JSON.parse(share);
    } else {
      return {};
    }
  } else {
    return {};
  }
  var depth = share.d;
  var path = share.p;
  var id = share.i;
  if (typeof id === 'string') {
    prop.$share_distinct_id = id;
    share_distinct_id = id;
    obj.$latest_share_distinct_id = id;
  } else {
    prop.$share_distinct_id = '取值异常';
  }

  if (typeof depth === 'number') {
    if (
      share_distinct_id &&
      (share_distinct_id === current_id ||
        share_distinct_id === current_first_id)
    ) {
      prop.$share_depth = depth;
      query_share_depth = depth;
      obj.$latest_share_depth = depth;
    } else if (
      share_distinct_id &&
      (share_distinct_id !== current_id ||
        share_distinct_id !== current_first_id)
    ) {
      prop.$share_depth = depth + 1;
      query_share_depth = depth + 1;
      obj.$latest_share_depth = depth + 1;
    } else {
      prop.$share_depth = '-1';
    }
  } else {
    prop.$share_depth = '-1';
  }
  if (typeof path === 'string') {
    prop.$share_url_path = path;
    obj.$latest_share_url_path = path;
  } else {
    prop.$share_url_path = '取值异常';
  }
  info.obj = obj;
  info.prop = prop;
  return info;
}

export function setLatestShare(share) {
  if (
    share.$latest_share_depth ||
    share.$latest_share_distinct_id ||
    share.$latest_share_url_path
  ) {
    sa.clearAppRegister(latest_share_info);
    sa.clearAllProps(latest_share_info);

    sa.para.is_persistent_save.share
      ? sa.register(share)
      : sa.registerApp(share);
  }
}
