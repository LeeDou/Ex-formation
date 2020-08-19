/**
 * author likang@sensorsdata.cn
 * 依赖于 sa 对象
 * 依赖于各个小程序的勾子方法枚举
 */

import sa from 'sa';

import { isObject, extend } from '../utils';
import { MP_HOOKS } from './emun';
import { setShareInfo } from '../dep';

export function screenMethods(option) {
  var methods = [];
  for (var m in option) {
    if (typeof option[m] === 'function' && !MP_HOOKS[m]) {
      methods.push(m);
    }
  }
  return methods;
}

export function isClick(type) {
  var MP_TAPS = {
    tap: 1,
    longpress: 1,
    longtap: 1,
  };
  return !!MP_TAPS[type];
}

// click_proxy 更换为 proxyClick
export function proxyClick(option, method) {
  var oldFunc = option[method];

  option[method] = function () {
    var prop = {},
      type = '';

    if (isObject(arguments[0])) {
      var target = arguments[0].currentTarget || {};
      var dataset = target.dataset || {};
      type = arguments[0]['type'];
      prop['$element_id'] = target.id;
      prop['$element_type'] = dataset['type'];
      prop['$element_content'] = dataset['content'];
      prop['$element_name'] = dataset['name'];
    }
    if (type && isClick(type)) {
      prop['$url_path'] = _.getCurrentPath();
      sa.track('$MPClick', prop);
    }
    return oldFunc && oldFunc.apply(this, arguments);
  };
}

/**
 *
 * @param {*} option
 * 将 getMethods 更改为 screen Methods
 */
export function screenMethods(option) {
  var methods = [];
  for (var m in option) {
    if (typeof option[m] === 'function' && !MP_HOOKS[m]) {
      methods.push(m);
    }
  }
  return methods;
}

/**
 * mp_proxy 更名为 mpProxy
 * @param {*} option
 * @param {*} method
 * @param {*} identifier
 */
export function mpProxy(option, method, identifier) {
  var newFunc = sa.autoTrackCustom[identifier];
  if (option[method]) {
    var oldFunc = option[method];
    option[method] = function () {
      if (method === 'onLaunch') {
        this[sa.para.name] = sa;
      }
      if (
        !sa.para.autoTrackIsFirst ||
        (isObject(sa.para.autoTrackIsFirst) &&
          !sa.para.autoTrackIsFirst[identifier])
      ) {
        oldFunc.apply(this, arguments);
        newFunc.apply(this, arguments);
      } else if (
        sa.para.autoTrackIsFirst === true ||
        (isObject(sa.para.autoTrackIsFirst) &&
          sa.para.autoTrackIsFirst[identifier])
      ) {
        newFunc.apply(this, arguments);
        oldFunc.apply(this, arguments);
      }
    };
  } else {
    option[method] = function () {
      if (method === 'onLaunch') {
        this[sa.para.name] = sa;
      }
      newFunc.apply(this, arguments);
    };
  }
}

/**
 * autoTrackCustom 方法需要重写，能实现绑定自定义的方法处理自定属性，传入自定义属性
 * 其中页面的代理可以实现不同页面的可配置
 * quick 方法，默认跳过所有的控制检查，直接完成数据的发送，与自定义埋点区分开
 */

export const autoTrackCustom = {
  trackCustom: function (api, prop, event) {
    var temp = sa.para.autoTrack[api];
    var tempFunc = '';
    if (sa.para.autoTrack && temp) {
      if (typeof temp === 'function') {
        tempFunc = temp();
        if (isObject(tempFunc)) {
          extend(prop, tempFunc);
        }
      } else if (isObject(temp)) {
        extend(prop, temp);
        sa.para.autoTrack[api] = true;
      }
      sa.track(event, prop);
    }
  },
  appLaunch: function (para, not_use_auto_track) {
    if (typeof this === 'object' && !this['trackCustom']) {
      this[sa.para.name] = sa;
    }

    var prop = {};
    if (para && para.path) {
      prop.$url_path = _.getPath(para.path);
    }

    // 设置分享的信息
    setShareInfo(para, prop);
    // 设置utm的信息
    var utms = _.setUtm(para, prop);
    if (is_first_launch) {
      prop.$is_first_time = true;
      if (!_.isEmptyObject(utms.pre1)) {
        sa.setOnceProfile(utms.pre1);
      }
    } else {
      prop.$is_first_time = false;
    }

    _.setLatestChannel(utms.pre2);

    prop.$scene = _.getMPScene(para.scene);
    sa.registerApp({ $latest_scene: prop.$scene });

    prop.$url_query = _.setQuery(para.query);

    if (not_use_auto_track) {
      prop = _.extend(prop, not_use_auto_track);
      sa.track('$MPLaunch', prop);
    } else if (sa.para.autoTrack && sa.para.autoTrack.appLaunch) {
      sa.autoTrackCustom.trackCustom('appLaunch', prop, '$MPLaunch');
    }
  },
  appShow: function (para, not_use_auto_track) {
    // 注意：不要去修改 para
    var prop = {};

    mpshow_time = new Date().getTime();

    // 给小程序弹窗传递小程序打开事件
    sa.events.emit('appShow', para.query.scene);

    if (para && para.path) {
      prop.$url_path = _.getPath(para.path);
    }
    // 设置分享的信息
    setShareInfo(para, prop);

    var utms = _.setUtm(para, prop);

    _.setLatestChannel(utms.pre2);

    prop.$scene = _.getMPScene(para.scene);
    sa.registerApp({ $latest_scene: prop.$scene });

    prop.$url_query = _.setQuery(para.query);
    if (not_use_auto_track) {
      prop = _.extend(prop, not_use_auto_track);
      sa.track('$MPShow', prop);
    } else if (sa.para.autoTrack && sa.para.autoTrack.appShow) {
      sa.autoTrackCustom.trackCustom('appShow', prop, '$MPShow');
    }
  },
  appHide: function (not_use_auto_track) {
    var current_time = new Date().getTime();
    var prop = {};
    prop.$url_path = _.getCurrentPath();
    if (
      mpshow_time &&
      current_time - mpshow_time > 0 &&
      (current_time - mpshow_time) / 3600000 < 24
    ) {
      prop.event_duration = (current_time - mpshow_time) / 1000;
    }
    if (not_use_auto_track) {
      prop = _.extend(prop, not_use_auto_track);
      sa.track('$MPHide', prop);
    } else if (sa.para.autoTrack && sa.para.autoTrack.appHide) {
      sa.autoTrackCustom.trackCustom('appHide', prop, '$MPHide');
    }
    //在关闭前告诉批量发送
    sa.sendStrategy.onAppHide();
  },
  pageLoad: function (para) {
    // 注意：不要去修改 para
    if (para && _.isObject(para)) {
      this.sensors_mp_url_query = _.setQuery(para);
      this.sensors_mp_encode_url_query = _.setQuery(para, true);
    }
  },
  pageShow: function () {
    var prop = {};
    var router = _.getCurrentPath();
    prop.$referrer = sa_referrer;
    prop.$url_path = router;
    sa.status.last_referrer = sa_referrer;
    prop.$url_query = this.sensors_mp_url_query
      ? this.sensors_mp_url_query
      : '';
    prop = _.extend(prop, _.getUtmFromPage());

    if (sa.para.onshow) {
      sa.para.onshow(sa, router, this);
    } else if (sa.para.autoTrack && sa.para.autoTrack.pageShow) {
      sa.autoTrackCustom.trackCustom('pageShow', prop, '$MPViewScreen');
    }
    sa_referrer = router;
    sa.status.referrer = router;
  },
  pageShare: function (option, not_use_auto_track) {
    var oldMessage = option.onShareAppMessage;

    option.onShareAppMessage = function () {
      var oldValue = oldMessage.apply(this, arguments);

      if (sa.para.autoTrack && sa.para.autoTrack.pageShare) {
        sa.autoTrackCustom.trackCustom(
          'pageShare',
          {
            $url_path: _.getCurrentPath(),
            $share_depth: query_share_depth,
          },
          '$MPShare'
        );
      }

      if (sa.para.allow_amend_share_path) {
        if (typeof oldValue !== 'object') {
          oldValue = {};
          oldValue.path = _.getCurrentUrl(this);
        }
        if (
          typeof oldValue === 'object' &&
          (typeof oldValue.path === 'undefined' || oldValue.path === '')
        ) {
          oldValue.path = _.getCurrentUrl(this);
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

        oldValue.path =
          oldValue.path + 'sampshare=' + encodeURIComponent(_.getShareInfo());
      }
      return oldValue;
    };
  },
};
