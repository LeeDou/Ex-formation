import ex from '../instance';
import { getStorageSync, setStorageSync } from '../../store/index';
import { isObject, isJSONString, getUUID, extend } from '../../utils/index';
import { request } from '../../data/request';
import { initWithOpenid, setOpenid } from './open';
import pf from 'platfrom';

ex.store = {
  // 防止重复请求
  storageInfo: null,
  inited: false,

  _state: {},
  toState: function (ds) {
    var state = null;
    if (isJSONString(ds)) {
      state = JSON.parse(ds);
      if (state.distinct_id) {
        this._state = state;
      } else {
        this.set('distinct_id', getUUID());
      }
    } else if (isObject(ds)) {
      state = ds;
      if (state.distinct_id) {
        this._state = state;
      } else {
        this.set('distinct_id', getUUID());
      }
    } else {
      this.set('distinct_id', getUUID());
    }
  },
  getFirstId: function () {
    return this._state._first_id || this._state.first_id;
  },
  getDistinctId: function () {
    return this._state._distinct_id || this._state.distinct_id;
  },
  getUnionId: function () {
    var obj = {};
    var first_id = this._state._first_id || this._state.first_id;
    var distinct_id = this._state._distinct_id || this._state.distinct_id;
    if (first_id && distinct_id) {
      obj['login_id'] = distinct_id;
      obj['anonymous_id'] = first_id;
    } else {
      obj['anonymous_id'] = distinct_id;
    }
    return obj;
  },
  getProps: function () {
    return this._state.props || {};
  },
  setProps: function (newp, isCover) {
    var props = this._state.props || {};
    if (!isCover) {
      extend(props, newp);
      this.set('props', props);
    } else {
      this.set('props', newp);
    }
  },
  set: function (name, value) {
    var obj = {};
    if (typeof name === 'string') {
      obj[name] = value;
    } else if (typeof name === 'object') {
      obj = name;
    }
    this._state = this._state || {};
    for (var i in obj) {
      this._state[i] = obj[i];
      if (i === 'first_id') {
        delete this._state._first_id;
      } else if (i === 'distinct_id') {
        delete this._state._distinct_id;
        ex.events.emit('changeDistinctId');
      }
    }
    this.exve();
  },
  change: function (name, value) {
    this._state['_' + name] = value;
  },
  exve: function () {
    var copyState = JSON.parse(JSON.stringify(this._state));
    delete copyState._first_id;
    delete copyState._distinct_id;
    setStorageSync('sensorsdata2015_wechat', copyState);
  },
  init: function () {
    var info = getStorageSync('sensorsdata2015_wechat');
    if (info) {
      this.toState(info);
    } else {
      ex.is_first_launch = true;
      var time = new Date();
      var visit_time = time.getTime();
      time.setHours(23);
      time.setMinutes(59);
      time.setSeconds(60);
      ex.setOnceProfile({ $first_visit_time: new Date() });
      this.set({
        distinct_id: getUUID(),
        first_visit_time: visit_time,
        first_visit_day_time: time.getTime()
      });
    }
    ex.store.inited = true;
    ex.checkInit();
  }
};

if (pf === 'weapp') {
  ex.openid = {
    getRequest: function (callback) {
      wx.login({
        success: function (res) {
          if (res.code && ex.para.appid && ex.para.openid_url) {
            request({
              url: ex.para.openid_url + '&code=' + res.code + '&appid=' + ex.para.appid,
              method: 'GET',
              complete: function (res2) {
                if (isObject(res2) && isObject(res2.data) && res2.data.openid) {
                  callback(res2.data.openid);
                } else {
                  callback();
                }
              }
            });
          } else {
            callback();
          }
        }
      });
    },
    getWXStorage: function () {
      var storageInfo = ex.store.getStorage();
      if (storageInfo && isObject(storageInfo)) {
        return storageInfo.openid;
      }
    },
    getOpenid: function (callback) {
      if (!ex.para.appid) {
        callback();
        return false;
      }
      var storageId = this.getWXStorage();
      if (storageId) {
        callback(storageId);
      } else {
        this.getRequest(callback);
      }
    }
  };

  ex.setOpenid = setOpenid;
  ex.initWithOpenid = initWithOpenid;
}
export default ex;
