import { isObject, decodeURIComponent, isJSONString } from '../utils/index';
import ex from '../core/instance';

export function getShareInfo(para) {
  var share = {};
  var obj = {};
  var prop = {};
  var latest_prop = {};
  var info = {};
  var current_id = ex.store.getDistinctId();
  var current_first_id = ex.store.getFirstId();
  if (para && isObject(para.query) && para.query.exmpshare) {
    share = decodeURIComponent(para.query.exmpshare);
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
    ex.share_distinct_id = id;
    latest_prop.$latest_share_distinct_id = id;
  } else {
    prop.$share_distinct_id = '取值异常';
  }

  if (typeof depth === 'number') {
    if (ex.share_distinct_id && (ex.share_distinct_id === current_id || ex.share_distinct_id === current_first_id)) {
      prop.$share_depth = depth;
      ex.query_share_depth = depth;
      latest_prop.$latest_share_depth = depth;
    } else if (ex.share_distinct_id && (ex.share_distinct_id !== current_id || ex.share_distinct_id !== current_first_id)) {
      prop.$share_depth = depth + 1;
      ex.query_share_depth = depth + 1;
      latest_prop.$latest_share_depth = depth + 1;
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
  info.prop = prop;
  info.latest_prop = latest_prop;
  return info;
}

export function setLatestShare(share) {
  if (share.$latest_share_depth || share.$latest_share_distinct_id || share.$latest_share_url_path) {
    ex.clearAppRegister(ex.latest_share_info);
    ex.clearAllProps(ex.latest_share_info);

    ex.para.is_persistent_exve.share ? ex.register(share) : ex.registerApp(share);
  }
}
