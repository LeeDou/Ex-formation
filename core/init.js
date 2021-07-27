import ex from './instance';
import { extend, isObject, iexrray, each, extend2Lev } from '../utils/index';

import { getStorage } from '../store/index';

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
  if (para && para.datasend_timeout) {
    // do nothing;
  } else if (!!ex.para.batch_send) {
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
      each(ex.queue, function (content) {
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

export default ex;
