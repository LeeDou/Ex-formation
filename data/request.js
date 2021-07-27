import { isObject, isFunction } from '../utils/index';
import ex from '../core/instance';
import pf from 'platfrom';

export function request(obj) {
  if (pf === 'wxapp') {
    var rq = wx.request(obj);
    setTimeout(function () {
      if (isObject(rq) && isFunction(rq.abort)) {
        rq.abort();
      }
    }, ex.para.datasend_timeout);
  }
}
