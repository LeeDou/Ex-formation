/**
 * para set
 * author likang@sensorsdata.cn
 */

import sa from 'sa';
import { extend2Lev, isArray, isObject, extend } from '../utils';

var setPara = function (para) {
  sa.para = extend2Lev(sa.para, para);

  var channel = [];
  if (isArray(sa.para.source_channel)) {
    var len = sa.para.source_channel.length;
    var reserve_channel =
      ' utm_source utm_medium utm_campaign utm_content utm_term sa_utm ';
    for (var c = 0; c < len; c++) {
      if (
        reserve_channel.indexOf(' ' + sa.para.source_channel[c] + ' ') === -1
      ) {
        channel.push(sa.para.source_channel[c]);
      }
    }
  }
  sa.para.source_channel = channel;

  // _.info 待处理
  if (isObject(sa.para.register)) {
    extend(_.info.properties, sa.para.register);
  }

  // 初始化各种预定义参数
  if (!sa.para.openid_url) {
    sa.para.openid_url = sa.para.server_url.replace(
      /([^\/])\/(sa)(\.gif){0,1}/,
      '$1/mp_login'
    );
  }

  if (typeof sa.para.send_timeout !== 'number') {
    sa.para.send_timeout = 1000;
  }

  var batch_send_default = {
    send_timeout: 6000,
    max_length: 6,
  };

  // 如果已经配置为批量发送，且未定义请求撤销时间的情况下，设置请求撤销时间为 10s
  if (para && para.datasend_timeout) {
    // do nothing;
  } else if (!!sa.para.batch_send) {
    sa.para.datasend_timeout = 10000;
  }

  // 如果是true，转换成对象
  if (sa.para.batch_send === true) {
    sa.para.batch_send = extend({}, batch_send_default);
    sa.para.use_client_time = true;
  } else if (isObject(sa.para.batch_send)) {
    sa.para.use_client_time = true;
    sa.para.batch_send = extend({}, batch_send_default, sa.para.batch_send);
  }

  var is_persistent_save_default = {
    share: false,
    utm: false,
  };

  if (sa.para.is_persistent_save === true) {
    sa.para.is_persistent_save = extend({}, is_persistent_save_default);
    sa.para.is_persistent_save.utm = true;
  } else if (isObject(sa.para.is_persistent_save)) {
    sa.para.is_persistent_save = extend(
      {},
      is_persistent_save_default,
      sa.para.is_persistent_save
    );
  }

  if (!sa.para.server_url) {
    logger.info(
      '请使用 setPara() 方法设置 server_url 数据接收地址,详情可查看https://www.sensorsdata.cn/manual/mp_sdk_new.html#112-%E5%BC%95%E5%85%A5%E5%B9%B6%E9%85%8D%E7%BD%AE%E5%8F%82%E6%95%B0'
    );
    return;
  }
};
