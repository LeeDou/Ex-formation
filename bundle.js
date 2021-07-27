'use strict';

var ex = {};

ex.queue = [];
ex.is_first_launch = false;
ex.para = {
  // ex分析注册在APP全局函数中的变量名，在非app.js中可以通过getApp().sensors(你这里定义的名字来使用)
  // ex分析数据接收地址
  name: '',
  server_url: '',
  //默认使用队列发数据时候，两条数据发送间的最大间隔
  send_timeout: 1000,
  // 发送事件的时间使用客户端时间还是服务端时间
  use_client_time: false,
  // 是否允许控制台打印查看埋点数据（建议开启查看）
  show_log: true,
  launched: false,
  // 是否允许修改onShareMesexge里return的path，用来增加（用户id，分享层级，当前的path），在app onshow中自动获取这些参数来查看具体分享来源，层级等
  allow_amend_share_path: true,
  max_string_length: 300,
  datasend_timeout: 3000,
  source_channel: [],
  autoTrack: {
    appLaunch: true, //是否采集 $MPLaunch 事件，true 代表开启。
    appShow: true, //是否采集 $MPShow 事件，true 代表开启。
    appHide: true, //是否采集 $MPHide 事件，true 代表开启。
    pageShow: true, //是否采集 $MPViewScreen 事件，true 代表开启。
    pageShare: true, //是否采集 $MPShare 事件，true 代表开启。
    mpClick: false, // 是否采集 $MPClick 事件，true 代表开启。
    mpFavorite: true // 是否采集 $MPAddFavorites 事件，true 代表开启。
  },
  autotrack_exclude_page: {
    pageShow: []
  },
  //是否允许将最近一次站外渠道信息保存到 wxStorage 中
  is_persistent_exve: {
    share: false, // share 相关信息
    utm: false // utm 相关信息
  },

  preset_properties: {}
  // 是否集成了插件！重要！
  // is_plugin: false
};
// SDK 默认采集，或不需处理的属性列表
ex.mpHook = {
  data: 1,
  onLoad: 1,
  onShow: 1,
  onReady: 1,
  onPullDownRefresh: 1,
  onReachBottom: 1,
  onShareAppMesexge: 1,
  onPageScroll: 1,
  onResize: 1,
  onTabItemTap: 1,
  onHide: 1,
  onUnload: 1
};

ex.ex_reffer = '直接打开';
ex.status = {
  referrer: '直接打开'
};

// 所有全局属性的保存
ex.mpshow_time = null;

ex.query_share_depth = 0;
ex.share_distinct_id = '';
ex.share_method = '';
ex.current_scene = '';

ex.LIB_VERSION = '1.0.0';
ex.lib_version = ex.LIB_VERSION;
ex.LIB_NAME = 'lib';

ex.source_channel_standard = 'utm_source utm_medium utm_campaign utm_content utm_term';
ex.latest_source_channel = ['$latest_utm_source', '$latest_utm_medium', '$latest_utm_campaign', '$latest_utm_content', '$latest_utm_term', '$latest_ex_utm'];
ex.latest_share_info = ['$latest_share_distinct_id', '$latest_share_url_path', '$latest_share_depth', '$latest_share_method'];

const _toString = Object.prototype.toString,
  _hasOwnProperty = Object.prototype.hasOwnProperty,
  indexOf = Array.prototype.indexOf,
  slice$1 = Array.prototype.slice,
  _iexrray = Array.prototype.iexrray,
  forEach = Array.prototype.forEach;

function isString$1(obj) {
  return toString.call(obj) == '[object String]';
}

function isDate(obj) {
  return toString.call(obj) == '[object Date]';
}

function isNumber(obj) {
  return toString.call(obj) == '[object Number]' && /[\d\.]+/.test(String(obj));
}

function isJSONString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}

function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function iexrray(obj) {
  return _iexrray || toString.call(obj) === '[object Array]';
}

function toString(val) {
  return val == null ? '' : iexrray(val) || (isPlainObject(val) && val.toString === _toString) ? JSON.stringify(val, null, 2) : String(val);
}

function hasOwn(obj, key) {
  return _hasOwnProperty.call(obj, key);
}

function each$1(obj, iterator, context) {
  if (obj == null) {
    return false;
  }
  if (forEach && obj.forEach === forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, l = obj.length; i < l; i++) {
      if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
        return false;
      }
    }
  } else {
    for (var key in obj) {
      if (hasOwn.call(obj, key)) {
        if (iterator.call(context, obj[key], key, obj) === breaker) {
          return false;
        }
      }
    }
  }
}

// include 函数，如果对象包含属性，就返回空对象 {}
function include(obj, target) {
  var found = false;
  if (obj == null) {
    return found;
  }
  if (indexOf && obj.indexOf === indexOf) {
    return obj.indexOf(target) != -1;
  }
  each$1(obj, function (value) {
    if (found || (found = value === target)) {
      return {};
    }
  });
  return found;
}

function formatDate(d) {
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + '.' + pad(d.getMilliseconds());
}

function searchObjDate(o) {
  if (isObject(o)) {
    each$1(o, function (a, b) {
      if (isObject(a)) {
        searchObjDate(o[b]);
      } else {
        if (isDate(a)) {
          o[b] = formatDate(a);
        }
      }
    });
  }
}

function decodeURIComponent(val) {
  var result = '';
  try {
    result = decodeURIComponent(val);
  } catch (e) {
    result = val;
  }
  return result;
}

function utf8Encode(string) {
  string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  var utftext = '',
    start,
    end;
  var stringl = 0,
    n;

  start = end = 0;
  stringl = string.length;

  for (n = 0; n < stringl; n++) {
    var c1 = string.charCodeAt(n);
    var enc = null;

    if (c1 < 128) {
      end++;
    } else if (c1 > 127 && c1 < 2048) {
      enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
    } else {
      enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
    }
    if (enc !== null) {
      if (end > start) {
        utftext += string.substring(start, end);
      }
      utftext += enc;
      start = end = n + 1;
    }
  }

  if (end > start) {
    utftext += string.substring(start, string.length);
  }

  return utftext;
}

function base64Encode(data) {
  var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var o1,
    o2,
    o3,
    h1,
    h2,
    h3,
    h4,
    bits,
    i = 0,
    ac = 0,
    enc = '',
    tmp_arr = [];
  if (!data) {
    return data;
  }
  data = utf8Encode(data);
  do {
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    bits = (o1 << 16) | (o2 << 8) | o3;

    h1 = (bits >> 18) & 0x3f;
    h2 = (bits >> 12) & 0x3f;
    h3 = (bits >> 6) & 0x3f;
    h4 = bits & 0x3f;
    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  } while (i < data.length);

  enc = tmp_arr.join('');

  switch (data.length % 3) {
    case 1:
      enc = enc.slice(0, -2) + '==';
      break;
    case 2:
      enc = enc.slice(0, -1) + '=';
      break;
  }

  return enc;
}

function isFunction(f) {
  try {
    return /^\s*\bfunction\b/.test(f);
  } catch (x) {
    return false;
  }
}

// 浅复制
function extend(obj) {
  each$1(slice$1.call(arguments, 1), function (source) {
    for (var prop in source) {
      if (source[prop] !== void 0) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

// 深复制
function extend2Lev(obj) {
  each$1(slice$1.call(arguments, 1), function (source) {
    for (var prop in source) {
      if (source[prop] !== void 0 && source[prop] !== null) {
        if (isObject(source[prop]) && isObject(obj[prop])) {
          extend(obj[prop], source[prop]);
        } else {
          obj[prop] = source[prop];
        }
      }
    }
  });
  return obj;
}

function isEmptyObject(obj) {
  if (isObject(obj)) {
    for (var key in obj) {
      if (hasOwn.call(obj, key)) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function formatString(str) {
  if (str.length > ex.para.max_string_length) {
    ex.log('字符串长度超过限制，已经做截取--' + str);
    return str.slice(0, ex.para.max_string_length);
  } else {
    return str;
  }
}

function searchObjString(o) {
  if (isObject(o)) {
    each$1(o, function (a, b) {
      if (isObject(a)) {
        searchObjString(o[b]);
      } else {
        if (isString(a)) {
          o[b] = formatString(a);
        }
      }
    });
  }
}

function formatSystem(system) {
  var _system = system.toLowerCase();
  if (_system === 'ios') {
    return 'iOS';
  } else if (_system === 'android') {
    return 'Android';
  } else {
    return system;
  }
}

function getUUID() {
  return (
    '' +
    Date.now() +
    '-' +
    Math.floor(1e7 * Math.random()) +
    '-' +
    Math.random().toString(16).replace('.', '') +
    '-' +
    String(Math.random() * 31242)
      .replace('.', '')
      .slice(0, 8)
  );
}

var type = 'weapp';

function getStorage(key, callback) {
  {
    wx.getStorage({
      key,
      complete: callback
    });
  }
}

function getStorageSync(key) {
  var store = '';
  switch (type) {
    case 'weapp':
      try {
        store = wx.getStorageSync(key);
      } catch (e) {
        try {
          store = wx.getStorageSync(key);
        } catch (e2) {
          ex.log('getStorage fail');
        }
      }
      break;
  }
  return store;
}

function setStorageSync(key, value) {
  var fn = function () {
    switch (type) {
      case 'weapp':
        wx.setStorageSync(key, value);
    }
  };
  try {
    fn();
  } catch (e) {
    ex.log('set Storage fail --', e);
    try {
      fn();
    } catch (e2) {
      ex.log('set Storage fail again --', e2);
    }
  }
}

ex.init = function (obj) {
  if (ex.hasInit === true) {
    return false;
  }
  ex.store.init();
  ex.system.init();
  ex.setPara(obj);
  if (ex.para.batch_send) {
    getStorage('sensors_mp_prepare_data', function (res) {
      var queue = res.data && iexrray(res.data) ? res.data : [];
      ex.store.mem.mdata = queue.concat(ex.store.mem.mdata);
      ex.sendStrategy.syncStorage = true;
    });
    ex.sendStrategy.batchInterval();
  }
  ex.checkInit();
};

ex.setPara = function (para) {
  ex.para = extend2Lev(ex.para, para);
  var channel = [];
  if (iexrray(ex.para.source_channel)) {
    var len = ex.para.source_channel.length;
    var reserve_channel = ' utm_source utm_medium utm_campaign utm_content utm_term ex_utm ';
    for (var c = 0; c < len; c++) {
      if (reserve_channel.indexOf(' ' + ex.para.source_channel[c] + ' ') === -1) {
        channel.push(ex.para.source_channel[c]);
      }
    }
  }
  ex.para.source_channel = channel;

  if (isObject(ex.para.register)) {
    extend(ex.properties, ex.para.register);
  }

  // 初始化各种预定义参数
  if (!ex.para.openid_url) {
    ex.para.openid_url = ex.para.server_url.replace(/([^\/])\/(ex)(\.gif){0,1}/, '$1/mp_login');
  }

  if (typeof ex.para.send_timeout !== 'number') {
    ex.para.send_timeout = 1000;
  }

  var batch_send_default = {
    send_timeout: 6000,
    max_length: 6
  };

  // 如果已经配置为批量发送，且未定义请求撤销时间的情况下，设置请求撤销时间为 10s
  if (para && para.datasend_timeout);
  else if (!!ex.para.batch_send) {
    ex.para.datasend_timeout = 10000;
  }

  // 如果是true，转换成对象
  if (ex.para.batch_send === true) {
    ex.para.batch_send = extend({}, batch_send_default);
    ex.para.use_client_time = true;
  } else if (isObject(ex.para.batch_send)) {
    ex.para.use_client_time = true;
    ex.para.batch_send = extend({}, batch_send_default, ex.para.batch_send);
  }

  var is_persistent_exve_default = {
    share: false,
    utm: false
  };

  if (ex.para.is_persistent_exve === true) {
    ex.para.is_persistent_exve = extend({}, is_persistent_exve_default);
    ex.para.is_persistent_exve.utm = true;
  } else if (isObject(ex.para.is_persistent_exve)) {
    ex.para.is_persistent_exve = extend({}, is_persistent_exve_default, ex.para.is_persistent_exve);
  }

  if (!ex.para.server_url) {
    ex.log('请使用 setPara() 方法设置 server_url 数据接收地址,详情可查看https://www.sensorsdata.cn/manual/mp_sdk_new.html#112-%E5%BC%95%E5%85%A5%E5%B9%B6%E9%85%8D%E7%BD%AE%E5%8F%82%E6%95%B0');
    return;
  }

  ex.para.preset_properties = isObject(ex.para.preset_properties) ? ex.para.preset_properties : {};
};

ex.log = function () {
  if (ex.para.show_log) {
    if (typeof console === 'object' && console.log) {
      try {
        return console.log.apply(console, arguments);
      } catch (e) {
        console.log(arguments[0]);
      }
    }
  }
};

ex.checkInit = function () {
  if (ex.systemState.inited && ex.store.inited) {
    ex.hasInit = true;
    if (ex.queue.length > 0) {
      each$1(ex.queue, function (content) {
        ex[content[0]].apply(ex, slice.call(content[1]));
      });
      ex.queue = [];
    }
  }
};
ex.usePlugin = function (plugin, para) {
  if (typeof plugin.init === 'function') {
    plugin.init(ex, para);
  }
};

function registerApp(obj) {
  if (isObject(obj) && !isEmptyObject(obj)) {
    ex.currentProps = extend(ex.currentProps, obj);
  }
}

function register(obj) {
  if (isObject(obj) && !isEmptyObject(obj)) {
    ex.store.setProps(obj);
  }
}

function clearAllRegister() {
  ex.store.setProps({}, true);
}

function clearAllProps(arr) {
  var obj = ex.store.getProps();
  var props = {};
  if (iexrray(arr)) {
    each$1(obj, function (value, key) {
      if (!include(arr, key)) {
        props[key] = value;
      }
    });
    ex.store.setProps(props, true);
  }
}

function clearAppRegister(arr) {
  if (iexrray(arr)) {
    each$1(ex.currentProps, function (value, key) {
      if (include(arr, key)) {
        delete ex.currentProps[key];
      }
    });
  }
}

ex.currentProps = {};
ex.properties = {
  $lib: ex.LIB_NAME,
  $lib_version: String(ex.LIB_VERSION)
};

ex.clearAllProps = clearAllProps;
ex.clearAllRegister = clearAllRegister;
ex.clearAppRegister = clearAppRegister;
ex.registerApp = registerApp;
ex.register = register;

function request(obj) {}

function setOpenid(openid, isCover) {
  ex.store.set('openid', openid);
  if (isCover) {
    ex.store.set('distinct_id', openid);
  } else {
    ex.identify(openid, true);
  }
}

function initWithOpenid(options, callback) {
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

{
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

var e = ex.properties;
var timeZoneOffset = new Date().getTimezoneOffset();
/*  appid 通用方法处理     */
var appId = getAppId();
if (isNumber(timeZoneOffset)) {
  e.$timezone_offset = timeZoneOffset;
}
if (appId) {
  e.$app_id = appId;
}

ex.systemState = {
  getNetWork: false,
  getSystem: false,
  inited: false
};

ex.system = {
  init: function () {
    getSystemInfo(e);
    getNetwork();
  }
};

function checkSystemState() {
  if (ex.systemState.getNetWork && ex.systemState.getSystem) {
    ex.systemState.inited = true;
    ex.checkInit();
  }
}

function getNetwork() {
  {
    wx.getNetworkType({
      success: function (t) {
        e.$network_type = t['networkType'];
      },
      complete: function () {
        ex.systemState.getSystem = true;
        checkSystemState();
      }
    });
  }
}

function getSystemInfo(e) {
  {
    wx.getSystemInfo({
      success: function (t) {
        e.$manufacturer = t['brand'];
        e.$model = t['model'];
        e.$screen_width = Number(t['screenWidth']);
        e.$screen_height = Number(t['screenHeight']);
        e.$os = formatSystem(t['platform']);
        e.$os_version = t['system'].indexOf(' ') > -1 ? t['system'].split(' ')[1] : t['system'];
      },
      complete: function () {
        ex.systemState.getSystem = true;
        checkSystemState();
      }
    });
  }
}

function getAppId() {
  var info;
  {
    if (wx.getAccountInfoSync) {
      info = wx.getAccountInfoSync();
    }
    if (isObject(info) && isObject(info.miniProgram)) {
      return info.miniProgram.appId;
    }
  }
}

var autoExeQueue = function () {
  var queue = {
    // 简单队列
    items: [],
    enqueue: function (val) {
      this.items.push(val);
      this.start();
    },
    dequeue: function () {
      return this.items.shift();
    },
    getCurrentItem: function () {
      return this.items[0];
    },
    // 自动循环执行队列
    isRun: false,
    start: function () {
      if (this.items.length > 0 && !this.isRun) {
        this.isRun = true;
        this.getCurrentItem().start();
      }
    },
    close: function () {
      this.dequeue();
      this.isRun = false;
      this.start();
    }
  };
  return queue;
};

ex.sendStrategy = {
  dataHasSend: true,
  dataHasChange: false,
  syncStorage: false,
  failTime: 0,
  onAppHide: function () {
    if (ex.para.batch_send) {
      this.batchSend();
    }
  },
  send: function (data) {
    if (!ex.para.server_url) {
      return false;
    }
    if (ex.para.batch_send) {
      this.dataHasChange = true;
      if (ex.store.mem.getLength() >= 300) {
        ex.log('数据量存储过大，有异常');
        return false;
      }
      ex.store.mem.add(data);
      if (ex.store.mem.getLength() >= ex.para.batch_send.max_length) {
        this.batchSend();
      }
    } else {
      this.queueSend(data);
    }
  },
  queueSend: function (url) {
    url = JSON.stringify(url);
    if (ex.para.server_url.indexOf('?') !== -1) {
      url = ex.para.server_url + '&data=' + encodeURIComponent(base64Encode(url));
    } else {
      url = ex.para.server_url + '?data=' + encodeURIComponent(base64Encode(url));
    }

    var instance = new ex.requestQueue({
      url: url
    });
    instance.close = function () {
      ex.dataQueue.close();
    };
    ex.dataQueue.enqueue(instance);
  },
  wxrequest: function (option) {
    if (iexrray(option.data) && option.data.length > 0) {
      var now = Date.now();
      option.data.forEach(function (v) {
        v._flush_time = now;
      });
      option.data = JSON.stringify(option.data);
      request({
        url: ex.para.server_url,
        method: 'POST',
        dataType: 'text',
        data: 'data_list=' + encodeURIComponent(base64Encode(option.data)),
        success: function () {
          option.success(option.len);
        },
        fail: function () {
          option.fail();
        }
      });
    } else {
      option.success(option.len);
    }
  },
  batchSend: function () {
    if (this.dataHasSend) {
      var data = ex.store.mem.mdata;
      var len = data.length;
      if (len > 0) {
        this.dataHasSend = false;
        this.wxrequest({
          data: data,
          len: len,
          success: this.batchRemove.bind(this),
          fail: this.sendFail.bind(this)
        });
      }
    }
  },
  sendFail: function () {
    this.dataHasSend = true;
    this.failTime++;
  },
  batchRemove: function (len) {
    ex.store.mem.clear(len);
    this.dataHasSend = true;
    this.dataHasChange = true;
    this.batchWrite();
    this.failTime = 0;
  },
  is_first_batch_write: true,
  batchWrite: function () {
    var me = this;
    if (this.dataHasChange) {
      // 如果是首次写入数据，等待1s后，优先发送，优化那些来了就跑的人
      if (this.is_first_batch_write) {
        this.is_first_batch_write = false;
        setTimeout(function () {
          me.batchSend();
        }, 1000);
      }

      this.dataHasChange = false;
      if (this.syncStorage) {
        setStorageSync('sensors_mp_prepare_data', ex.store.mem.mdata);
      }
    }
  },
  batchInterval: function () {
    var _this = this;
    // 每隔1秒，写入数据
    function loopWrite() {
      setTimeout(function () {
        _this.batchWrite();
        loopWrite();
      }, 500);
    }
    // 每隔6秒，发送数据
    function loopSend() {
      setTimeout(function () {
        _this.batchSend();
        loopSend();
      }, ex.para.batch_send.send_timeout * Math.pow(2, _this.failTime));
    }
    loopWrite();
    loopSend();
  }
};

ex.requestQueue = function (para) {
  this.url = para.url;
};
ex.requestQueue.prototype.isEnd = function () {
  if (!this.received) {
    this.received = true;
    this.close();
  }
};
ex.requestQueue.prototype.start = function () {
  var me = this;
  setTimeout(function () {
    me.isEnd();
  }, ex.para.send_timeout);
  request({
    url: this.url,
    method: 'GET',
    complete: function () {
      me.isEnd();
    }
  });
};

ex.dataQueue = autoExeQueue();

ex.men = {
  mdata: [],
  getLength: function () {
    return this.mdata.length;
  },
  add: function (data) {
    this.mdata.push(data);
  },
  clear: function (len) {
    this.mdata.splice(0, len);
  }
};

const OFFICAL_METHODS = {
  data: 1,
  onLoad: 1,
  onShow: 1,
  onReady: 1,
  onPullDownRefresh: 1,
  onReachBottom: 1,
  onShareAppMesexge: 1,
  onPageScroll: 1,
  onResize: 1,
  onTabItemTap: 1,
  onHide: 1,
  onUnload: 1
};

function clickProxy(option, method) {
  var oldFunc = option[method];

  option[method] = function () {
    var prop = {},
      type = '';

    if (isObject(arguments[0])) {
      var target = arguments[0].currentTarget || {};
      var dataset = target.dataset || {};
      type = arguments[0]['type'];

      // getCurrentPath 需要重新定义
      prop['$url_path'] = ex.getCurrentPath();
      prop['$element_id'] = target.id;
      prop['$element_type'] = dataset['type'];
      prop['$element_content'] = dataset['content'];
      prop['$element_name'] = dataset['name'];
    }
    if (type && isClick(type)) {
      ex.track('$MPClick', prop);
    }
    return oldFunc.apply(this, arguments);
  };
}

function getMethods(option) {
  var methods = [];
  for (var m in option) {
    if (typeof option[m] === 'function' && !OFFICAL_METHODS[m]) {
      methods.push(m);
    }
  }
  return methods;
}

function isClick(type) {
  var TAPS = {
    tap: 1,
    longpress: 1,
    longtap: 1
  };
  return !!TAPS[type];
}

function getScene(key) {
  if (typeof key === 'number' || (typeof key === 'string' && key !== '')) {
    key = String(key);
    return key;
  } else {
    return '未取到值';
  }
}

function getPath(path) {
  if (typeof path === 'string') {
    path = path.replace(/^\//, '');
  } else {
    path = '取值异常';
  }
  return path;
}

function getCurrentPath() {
  var url = '未取到';
  try {
    var pages = getCurrentPages();
    var currentPage = pages[pages.length - 1];
    url = currentPage.route;
  } catch (e) {
    ex.log(e);
  }
  return url;
}

function getCurrentUrl(me) {
  var path = getCurrentPath();
  var query = '';
  if (isObject(me) && me.sensors_mp_encode_url_query) {
    query = me.sensors_mp_encode_url_query;
  }
  if (path) {
    return query ? path + '?' + query : path;
  } else {
    return '未取到';
  }
}

function getShareInfo(para) {
  var share = {};
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
  } else {
    prop.$share_url_path = '取值异常';
  }
  info.prop = prop;
  info.latest_prop = latest_prop;
  return info;
}

function setLatestShare(share) {
  if (share.$latest_share_depth || share.$latest_share_distinct_id || share.$latest_share_url_path) {
    ex.clearAppRegister(ex.latest_share_info);
    ex.clearAllProps(ex.latest_share_info);

    ex.para.is_persistent_exve.share ? ex.register(share) : ex.registerApp(share);
  }
}

// 修改 detectOptionQuery 为 detectOption
// 筛选检测出para里的query，q，scene
function detectOption(para) {
  if (!para || !isObject(para.query)) {
    return {};
  }
  var result = {};
  // path的query
  result.query = extend({}, para.query);
  //如果query有scene，认为scene是b接口传过来的
  if (typeof result.query.scene === 'string' && isBScene(result.query)) {
    result.scene = result.query.scene;
    delete result.query.scene;
  }
  //如果query有q
  if (para.query.q && para.query.scancode_time && String(para.scene).slice(0, 3) === '101') {
    result.q = String(result.query.q);
    delete result.query.q;
    delete result.query.scancode_time;
  }
  function isBScene(obj) {
    var source = ['utm_source', 'utm_content', 'utm_medium', 'utm_campaign', 'utm_term', 'ex_utm'];
    var source_keyword = source.concat(ex.para.source_channel);
    var reg = new RegExp('(' + source_keyword.join('|') + ')%3D', 'i');
    var keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === 'scene' && reg.test(obj.scene)) {
      return true;
    } else {
      return false;
    }
  }
  return result;
}
function getObjFromQuery(str) {
  var query = str.split('?');
  var arr = [];
  var obj = {};
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

//获取自定义key的utm值
function getCustomUtmFromQuery(query, utm_prefix, source_channel_prefix, exutm_prefix) {
  if (!isObject(query)) {
    return {};
  }
  var result = {};
  if (query['ex_utm']) {
    for (var i in query) {
      if (i === 'ex_utm') {
        result[exutm_prefix + i] = query[i];
        continue;
      }
      if (include(ex.para.source_channel, i)) {
        result[source_channel_prefix + i] = query[i];
      }
    }
  } else {
    for (var i in query) {
      if ((' ' + ex.source_channel_standard + ' ').indexOf(' ' + i + ' ') !== -1) {
        result[utm_prefix + i] = query[i];
        continue;
      }
      if (include(ex.para.source_channel, i)) {
        result[source_channel_prefix + i] = query[i];
      }
    }
  }
  return result;
}

// setQUery 修改为 getQueryUrl
function getQueryUrl(params, isEncode) {
  var url_query = '';
  if (params && isObject(params) && !isEmptyObject(params)) {
    var arr = [];
    each(params, function (value, key) {
      if (!(key === 'q' && isString$1(value) && value.indexOf('http') === 0) && key !== 'scene') {
        if (isEncode) {
          arr.push(key + '=' + value);
        } else {
          arr.push(key + '=' + decodeURIComponent(value));
        }
      }
    });
    return arr.join('&');
  } else {
    return url_query;
  }
}

// getMixedQuery 更改为 parseQuery
// 从query,q,scene三个参数中，解析得到一个整合的query对象
function parseQuery(para) {
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
}

function setLatestChannel(channel) {
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
function getUtm(para) {
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
function getUtmFromPage() {
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

function presetApp() {
  ex.appLaunch = function (option, prop) {
    var obj = {};
    if (isObject(prop)) {
      obj = extend(obj, prop);
    }
    if (option && option.scene) {
      ex.current_scene = option.scene;
      obj.$scene = getScene(option.scene);
    } else {
      obj.$scene = '未取到值';
    }
    if (option && option.scene && option.scene === 1010 && option.query && option.query.exmpshare) {
      delete option.query.exmpshare;
    }
    if (option && option.path) {
      // 待处理
      obj.$url_path = getPath(option.path);
      if (ex.para.preset_properties.url_path === true) {
        ex.registerApp({ $url_path: obj.$url_path });
      }
    }
    // 设置分享的信息
    var share_info = getShareInfo(option);
    // obj = extend(obj, share_info.prop);
    // setLatestShare(share_info.latest_prop);
    if (!isEmptyObject(share_info)) {
      obj = extend(obj, share_info.prop);
      if (!isEmptyObject(share_info.latest_prop)) {
        setLatestShare(share_info.latest_prop);
      }
    }

    // 设置utm的信息
    var utms = getUtm(option);
    obj = extend(obj, utms.pre1);
    setLatestChannel(utms.pre2);

    if (ex.is_first_launch) {
      obj.$is_first_time = true;
      if (!isEmptyObject(utms.pre1)) {
        ex.setOnceProfile(utms.pre1);
      }
    } else {
      obj.$is_first_time = false;
    }

    ex.registerApp({ $latest_scene: obj.$scene });

    obj.$url_query = getQueryUrl(option.query);

    ex.track('$MPLaunch', obj);
  };
  ex.appShow = function (option, prop) {
    var obj = {};
    if (isObject(prop)) {
      obj = extend(obj, prop);
    }
    ex.mpshow_time = new Date().getTime();
    if (option && option.scene) {
      ex.current_scene = option.scene;
      obj.$scene = getScene(option.scene);
    } else {
      obj.$scene = '未取到值';
    }
    // 如果是从收藏夹进入小程序就把 query 中的 exmpshare 删除
    if (option && option.scene && option.scene === 1010 && option.query && option.query.exmpshare) {
      delete option.query.exmpshare;
    }

    if (option && option.path) {
      obj.$url_path = getPath(option.path);
      if (ex.para.preset_properties.url_path === true) {
        ex.registerApp({ $url_path: obj.$url_path });
      }
    }
    // 设置经纬度
    if (isObject(ex.para.preset_properties.location) && (ex.para.preset_properties.location.type === 'wgs84' || ex.para.preset_properties.location.type === 'gcj02')) {
      ex.getLocation();
    }
    // 分享信息
    var share_info = getShareInfo(option);
    if (!isEmptyObject(share_info)) {
      obj = extend(obj, share_info.prop);
      if (!isEmptyObject(share_info.latest_prop)) {
        setLatestShare(share_info.latest_prop);
      }
    }

    // 来源信息
    var utms = getUtm(option);

    setLatestChannel(utms.pre2);

    ex.registerApp({ $latest_scene: obj.$scene });
    obj.$url_query = getQueryUrl(option.query);
    ex.track('$MPShow', obj);
  };

  ex.appHide = function (prop) {
    var current_time = new Date().getTime();
    var obj = {};
    if (isObject(prop)) {
      obj = extend(obj, prop);
    }
    obj.$url_path = getCurrentPath();
    if (ex.mpshow_time && current_time - ex.mpshow_time > 0 && (current_time - ex.mpshow_time) / 3600000 < 24) {
      obj.event_duration = (current_time - ex.mpshow_time) / 1000;
    }
    ex.track('$MPHide', obj);
    ex.sendStrategy.onAppHide();
  };
}

var oldPage = Page;
Page = function (option) {
  var show = option.onShow;
  var load = option.onLoad;
  var addToFavorites = option.onAddToFavorites;
  var methods = ex.para.autoTrack && ex.para.autoTrack.mpClick && getMethods(option);
  if (!!methods) {
    for (let i = 0, len = methods.length; i < len; i++) {
      clickProxy(option, methods[i]);
    }
  }
  option.onLoad = function (para) {
    load && load.apply(this, arguments);
    ex.pageLoad(para);
  };
  option.onShow = function () {
    show && show.apply(this, arguments);
    ex.pageShow();
  };
  option.onAddToFavorites = function () {
    addToFavorites && addToFavorites.apply(this, arguments);
    ex.pageAddFavorites();
  };
  if (typeof option.onShareAppMesexge === 'function') {
    var oldMesexge = option.onShareAppMesexge;
    option.onShareAppMesexge = function () {
      var oldValue = oldMesexge.apply(this, arguments);
      return ex.shareAppMesexge(oldValue);
    };
  }
  if (typeof option.onShareTimeline === 'function') {
    var oldMesexge = option.onShareTimeline;
    option.onShareTimeline = function () {
      var oldValue = oldMesexge.apply(this, arguments);
      return ex.pageShareTimeline(oldValue);
    };
  }

  oldPage.apply(this, arguments);
};

ex.pageShow = function (prop) {
  var obj = {};
  var router = getCurrentPath();
  if (isObject(prop)) {
    obj = extend(obj, prop);
  }
  var currentPage = {};
  try {
    var pages = getCurrentPages();
    currentPage = pages[pages.length - 1];
  } catch (error) {
    ex.log(error);
  }

  obj.$referrer = ex.ex_referrer;
  obj.$url_path = router;
  ex.status.last_referrer = ex.ex_referrer;
  obj.$url_query = currentPage.sensors_mp_url_query ? currentPage.sensors_mp_url_query : '';
  obj = extend(obj, getUtmFromPage());

  ex.track('$MPViewScreen', obj);
  ex.ex_referrer = router;
  ex.status.referrer = router;
};
ex.pageLoad = function (para) {
  if (ex.current_scene && ex.current_scene === 1010 && para && para.exmpshare) {
    delete para.exmpshare;
  }
  if (para && isObject(para)) {
    this.sensors_mp_url_query = getQueryUrl(para);
    this.sensors_mp_encode_url_query = getQueryUrl(para, true);
  }
};

ex.shareAppMesexge = function (oldValue) {
  ex.share_method = '转发消息卡片';
  if (ex.para.autoTrack && ex.para.autoTrack.pageShare) {
    ex.track('$MPShare', {
      $url_path: getCurrentPath(),
      $share_depth: ex.query_share_depth,
      $share_method: ex.share_method
    });
  }

  if (ex.para.allow_amend_share_path) {
    if (typeof oldValue !== 'object') {
      oldValue = {};
      oldValue.path = getCurrentUrl(this);
    }
    if (typeof oldValue === 'object' && (typeof oldValue.path === 'undefined' || oldValue.path === '')) {
      oldValue.path = getCurrentUrl(this);
    }
    if (typeof oldValue === 'object' && typeof oldValue.path === 'string') {
      if (oldValue.path.indexOf('?') === -1) {
        oldValue.path = oldValue.path + '?';
      } else {
        if (oldValue.path.slice(-1) !== '&') {
          oldValue.path = oldValue.path + '&';
        }
      }
    }

    oldValue.path = oldValue.path + 'exmpshare=' + encodeURIComponent(getShareInfo());
  }
  return oldValue;
};

ex.pageShareTimeline = function (oldValue) {
  ex.share_method = '朋友圈分享';
  if (ex.para.autoTrack && ex.para.autoTrack.pageShare) {
    ex.track('$MPShare', {
      $url_path: getCurrentPath(),
      $share_depth: ex.query_share_depth,
      $share_method: ex.share_method
    });
  }

  if (ex.para.allow_amend_share_path) {
    if (typeof oldValue !== 'object') {
      oldValue = {};
    }
    if (typeof oldValue === 'object' && typeof oldValue.query === 'undefined') {
      oldValue.query = '';
    }
    if (typeof oldValue === 'object' && typeof oldValue.query === 'string' && oldValue.query !== '') {
      if (oldValue.query.slice(-1) !== '&') {
        oldValue.query = oldValue.query + '&';
      }
    }

    oldValue.query = oldValue.query + 'exmpshare=' + encodeURIComponent(getShareInfo());
  }

  return oldValue;
};

ex.pageAddFavorites = function () {
  var prop = {};
  prop.$url_path = getCurrentPath();
  if (ex.para.autoTrack && ex.para.autoTrack.mpFavorite) {
    ex.track('$MPAddFavorites', prop);
  }
};

presetApp();

ex.track = function (e, p, c) {
  ex.prepareData(
    {
      type: 'track',
      event: e,
      properties: p
    },
    c
  );
};

ex.quick = function () {
  // 方法名
  var arg0 = arguments[0];
  // 传入的参数
  var arg1 = arguments[1];
  // 需要自定义的属性
  var arg2 = arguments[2];

  var prop = isObject(arg2) ? arg2 : {};
  if (arg0 === 'getAnonymousID') {
    if (isEmptyObject(ex.store._state)) {
      ex.log('请先初始化SDK');
    } else {
      return ex.store._state._first_id || ex.store._state.first_id || ex.store._state._distinct_id || ex.store._state.distinct_id;
    }
  } else if (arg0 === 'appLaunch' || arg0 === 'appShow') {
    if (arg1) {
      ex.autoTrackCustom[arg0](arg1, prop);
    } else {
      ex.log('App的launch和show，在sensors.quick第二个参数必须传入App的options参数');
    }
  } else if (arg0 === 'appHide') {
    prop = isObject(arg1) ? arg1 : {};
    ex.autoTrackCustom[arg0](prop);
  }
};

ex.setOnceProfile = function (p, c) {
  ex.prepareData(
    {
      type: 'profile_set_once',
      properties: p
    },
    c
  );
};

ex.prepareData = function (p, callback) {
  var data = {
    distinct_id: ex.store.getDistinctId(),
    lib: {
      $lib: ex.LIB_NAME,
      $lib_method: 'code',
      $lib_version: String(ex.LIB_VERSION)
    },
    properties: {}
  };

  data = extend(data, ex.store.getUnionId(), p);
  // 合并properties里的属性
  if (isObject(p.properties) && !isEmptyObject(p.properties)) {
    data.properties = extend(data.properties, p.properties);
  }

  // profile时不传公用属性
  if (!p.type || p.type.slice(0, 7) !== 'profile') {
    if (ex.para.batch_send) {
      data._track_id = Number(String(Math.random()).slice(2, 5) + String(Math.random()).slice(2, 4) + String(Date.now()).slice(-4));
    }
    // 传入的属性 > 当前页面的属性 > session的属性 > cookie的属性 > 预定义属性
    data.properties = extend({}, ex.properties, ex.store.getProps(), ex.currentProps, data.properties);

    // 判断是否是首日访问，果子说要做
    if (typeof ex.store._state === 'object' && typeof ex.store._state.first_visit_day_time === 'number' && ex.store._state.first_visit_day_time > new Date().getTime()) {
      data.properties.$is_first_day = true;
    } else {
      data.properties.$is_first_day = false;
    }
  }
  if (data.properties.$time && isDate(data.properties.$time)) {
    data.time = data.properties.$time * 1;
    delete data.properties.$time;
  } else {
    if (ex.para.use_client_time) {
      data.time = new Date() * 1;
    }
  }

  searchObjDate(data);
  searchObjString(data);

  ex.log(data);
  ex.emitter.emit('send', data);

  ex.sendStrategy.send(data);
};

var emitter = function () {
  this.sub = [];
};
emitter.prototype = {
  add: function (item) {
    this.sub.push(item);
  },
  emit: function (event, data) {
    this.sub.forEach(function (temp) {
      temp.on(event, data);
    });
  }
};

var subscribe = function (handle) {
  if (ex && ex.emitter) {
    ex.events.add(this);
    this._events = [];
    this.handle = handle;
    this.ready = false;
  } else {
    return false;
  }
};

subscribe.prototype = {
  on: function (event, data) {
    if (this.ready) {
      if (isFunction(this.handle)) {
        try {
          this.handle(event, data);
        } catch (error) {
          ex.log(error);
        }
      }
    } else {
      this._events.push({
        event,
        data
      });
    }
  },
  isReady: function () {
    var that = this;
    that.ready = true;
    that._events.forEach(function (item) {
      if (isFunction(that.handle)) {
        try {
          that.handle(item.event, item.data);
        } catch (error) {
          ex.log(error);
        }
      }
    });
  }
};

ex.emitter = new emitter();
ex.eventSub = subscribe;

module.exports = ex;
