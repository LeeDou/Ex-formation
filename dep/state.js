/**
 * author likang@sensorsdata.cn
 */

import { sa } from 'sa';

import { getUUID } from './user';
import { getStorageSync, setStorageSync } from './store';
import { isJSONString, isObject } from '../utils';

const store = {
  // 防止重复请求
  storageInfo: null,
  getStorage: function () {
    if (this.storageInfo) {
      return this.storageInfo;
    } else {
      this.storageInfo = getStorageSync('sensorsdata2015_wechat') || '';
      return this.storageInfo;
    }
  },
  _state: {},
  // 未存储到storage中的内存数据
  mem: {
    mdata: [],
    getLength: function () {
      return this.mdata.length;
    },
    add: function (data) {
      this.mdata.push(data);
    },
    clear: function (len) {
      this.mdata.splice(0, len);
    },
  },
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
      _.extend(props, newp);
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
      // 如果set('first_id') 或者 set('distinct_id')，删除对应的临时属性
      if (i === 'first_id') {
        delete this._state._first_id;
      } else if (i === 'distinct_id') {
        delete this._state._distinct_id;
        sa.events.emit('changeDistinctId');
      }
    }
    this.save();
  },
  change: function (name, value) {
    this._state['_' + name] = value;
  },
  save: function () {
    // 深拷贝避免修改原对象
    var copyState = JSON.parse(JSON.stringify(this._state));
    // 删除临时属性避免写入微信 storage
    delete copyState._first_id;
    delete copyState._distinct_id;
    setStorageSync('sensorsdata2015_wechat', copyState);
  },
  init: function () {
    var info = this.getStorage();
    if (info) {
      this.toState(info);
    } else {
      is_first_launch = true;
      var time = new Date();
      var visit_time = time.getTime();
      time.setHours(23);
      time.setMinutes(59);
      time.setSeconds(60);
      sa.setOnceProfile({ $first_visit_time: new Date() });
      this.set({
        distinct_id: getUUID(),
        first_visit_time: visit_time,
        first_visit_day_time: time.getTime(),
      });
    }
  },
};

export default store;
