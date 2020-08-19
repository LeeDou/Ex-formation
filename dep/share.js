/**
 * author likang@sensorsdata.cn
 */

import { isObject } from '../utils';

export function setShareInfo(para, prop) {
  var share = {};
  var obj = {};
  var current_id = sa.store.getDistinctId();
  var current_first_id = sa.store.getFirstId();
  if (para && isObject(para.query) && para.query.sampshare) {
    share = _.decodeURIComponent(para.query.sampshare);
    if (_.isJSONString(share)) {
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
  _.setLatestShare(obj);
}
