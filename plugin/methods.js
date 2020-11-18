/**
 * author likang@sensorsdata.cn
 * mini methods
 */

// setOnceProfile 需要在全局 API 定义

import sa from 'sa';
import {
  getShareInfo,
  getPath,
  getCurrentPath,
  getCurrentUrl,
  setLatestShare,
  setLatestChannel,
  getScene,
  getUtm,
  getUtmFromPage,
} from '../dep';
import { isEmptyObject, extend } from '../utils';

/**
 *
 * @param { onLaunch option} para
 * @param { whether immediate track } immediate
 * @param { quick param } prop
 */
export function appLaunch(para, immediate, prop) {
  // 此处的 this 指针需确认
  if (typeof this === 'object' && !this['trackCustom'] && !immediate) {
    this[sa.para.name] = sa;
  }

  var prop = prop || {};
  if (para && para.path) {
    prop.$url_path = getPath(para.path);
  }

  // 设置分享的信息
  getShareInfo(para);
  var info = getShareInfo(para);
  prop = extend(prop, info.prop);
  setLatestShare(info.obj);
  // 设置utm的信息
  // setUtm 修改为 getUtm
  var utms = getUtm(para, prop);
  prop = extend(prop, utms.pre1);
  if (is_first_launch) {
    prop.$is_first_time = true;
    if (!isEmptyObject(utms.pre1)) {
      sa.setOnceProfile(utms.pre1);
    }
  } else {
    prop.$is_first_time = false;
  }

  setLatestChannel(utms.pre2);

  prop.$scene = getScene(para.scene);
  sa.registerApp({ $latest_scene: prop.$scene });

  prop.$url_query = getQueryUrl(para.query);

  if (immediate) {
    sa.track('$MPLaunch', prop);
  } else if (sa.para.autoTrack && sa.para.autoTrack.appLaunch) {
    sa.autoTrackCustom.trackCustom('appLaunch', prop, '$MPLaunch');
  }
}

export function appShow(para, prop, immediate) {
  // 注意：不要去修改 para
  var prop = prop || {};

  mpshow_time = new Date().getTime();

  if (para && para.path) {
    prop.$url_path = getPath(para.path);
  }
  // 设置分享的信息
  setShareInfo(para, prop);

  var utms = getUtm(para, prop);
  prop = extend(prop, utms.pre1);

  setLatestChannel(utms.pre2);

  prop.$scene = getScene(para.scene);
  sa.registerApp({ $latest_scene: prop.$scene });

  prop.$url_query = getQueryUrl(para.query);
  if (immediate) {
    sa.track('$MPShow', prop);
  } else if (sa.para.autoTrack && sa.para.autoTrack.appShow) {
    sa.autoTrackCustom.trackCustom('appShow', prop, '$MPShow');
  }
}

export function appHide(prop, immediate) {
  var current_time = new Date().getTime();
  var prop = prop || {};
  prop.$url_path = getCurrentPath();
  if (
    mpshow_time &&
    current_time - mpshow_time > 0 &&
    (current_time - mpshow_time) / 3600000 < 24
  ) {
    prop.event_duration = (current_time - mpshow_time) / 1000;
  }
  if (immediate) {
    prop = extend(prop, not_use_auto_track);
    sa.track('$MPHide', prop);
  } else if (sa.para.autoTrack && sa.para.autoTrack.appHide) {
    sa.autoTrackCustom.trackCustom('appHide', prop, '$MPHide');
  }
  //在关闭前告诉批量发送
  sa.sendStrategy.onAppHide();
}

export function pageLoad(para) {
  // 注意：不要去修改 para
  if (para && isObject(para)) {
    this.sensors_mp_url_query = _.setQuery(para);
    this.sensors_mp_encode_url_query = _.setQuery(para, true);
  }
}
export function pageShow(prop, immediate) {
  var prop = prop || {};
  var router = getCurrentPath();
  prop.$referrer = sa_referrer;
  prop.$url_path = router;
  sa.status.last_referrer = sa_referrer;
  prop.$url_query = this.sensors_mp_url_query ? this.sensors_mp_url_query : '';
  prop = extend(prop, getUtmFromPage());

  // para.onshow 此方方法在哪个版本上线，不做兼容
  // if (sa.para.onshow) {
  //   sa.para.onshow(sa, router, this);
  // } else
  if (immediate) {
    sa.track('$MPViewScreen', prop);
  } else if (sa.para.autoTrack && sa.para.autoTrack.pageShow) {
    sa.autoTrackCustom.trackCustom('pageShow', prop, '$MPViewScreen');
  }
  sa_referrer = router;
  sa.status.referrer = router;
}
export function pageShare(option) {
  var oldMessage = option.onShareAppMessage;

  option.onShareAppMessage = function () {
    var oldValue = oldMessage.apply(this, arguments);

    if (sa.para.autoTrack && sa.para.autoTrack.pageShare) {
      sa.autoTrackCustom.trackCustom(
        'pageShare',
        {
          $url_path: getCurrentPath(),
          $share_depth: query_share_depth,
        },
        '$MPShare'
      );
    }

    if (sa.para.allow_amend_share_path) {
      if (typeof oldValue !== 'object') {
        oldValue = {};
        oldValue.path = getCurrentUrl(this);
      }
      if (
        typeof oldValue === 'object' &&
        (typeof oldValue.path === 'undefined' || oldValue.path === '')
      ) {
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

      oldValue.path =
        oldValue.path + 'sampshare=' + encodeURIComponent(getShareInfo());
    }
    return oldValue;
  };
}
