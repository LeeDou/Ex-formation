import ex from '../instance';
import { isFunction } from '../../utils/index';

export function setOpenid(openid, isCover) {
  ex.store.set('openid', openid);
  if (isCover) {
    ex.store.set('distinct_id', openid);
  } else {
    ex.identify(openid, true);
  }
}

export function initWithOpenid(options, callback) {
  options = options || {};
  if (options.appid) {
    ex.para.appid = options.appid;
  }
  ex.openid.getOpenid(function (openid) {
    if (openid) {
      ex.setOpenid(openid, options.isCoverLogin);
    }
    if (callback && isFunction(callback)) {
      callback(openid);
    }
    ex.init(options);
  });
}
