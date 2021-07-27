/**
 * author likang@sensorsdata.cn
 * mini methods
 */

// setOnceProfile 需要在全局 API 定义

import ex from 'ex';
import { getShareInfo, getPath, getCurrentPath, getCurrentUrl, setLatestShare, setLatestChannel, getScene, getUtm, getUtmFromPage } from '../dep';
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
    this[ex.para.name] = ex;
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
  if (ex.is_first_launch) {
    prop.$is_first_time = true;
    if (!isEmptyObject(utms.pre1)) {
      ex.setOnceProfile(utms.pre1);
    }
  } else {
    prop.$is_first_time = false;
  }

  setLatestChannel(utms.pre2);

  prop.$scene = getScene(para.scene);
  ex.registerApp({ $latest_scene: prop.$scene });

  prop.$url_query = getQueryUrl(para.query);

  if (immediate) {
    ex.track('$MPLaunch', prop);
  } else if (ex.para.autoTrack && ex.para.autoTrack.appLaunch) {
    ex.autoTrackCustom.trackCustom('appLaunch', prop, '$MPLaunch');
  }
}

export function appShow(para, prop, immediate) {
  // 注意：不要去修改 para
  var prop = prop || {};

  ex.mpshow_time = new Date().getTime();

  if (para && para.path) {
    prop.$url_path = getPath(para.path);
  }
  // 设置分享的信息
  setShareInfo(para, prop);

  var utms = getUtm(para, prop);
  prop = extend(prop, utms.pre1);

  setLatestChannel(utms.pre2);

  prop.$scene = getScene(para.scene);
  ex.registerApp({ $latest_scene: prop.$scene });

  prop.$url_query = getQueryUrl(para.query);
  if (immediate) {
    ex.track('$MPShow', prop);
  } else if (ex.para.autoTrack && ex.para.autoTrack.appShow) {
    ex.autoTrackCustom.trackCustom('appShow', prop, '$MPShow');
  }
}

export function appHide(prop, immediate) {
  var current_time = new Date().getTime();
  var prop = prop || {};
  prop.$url_path = getCurrentPath();
  if (ex.mpshow_time && current_time - ex.mpshow_time > 0 && (current_time - ex.mpshow_time) / 3600000 < 24) {
    prop.event_duration = (current_time - ex.mpshow_time) / 1000;
  }
  if (immediate) {
    prop = extend(prop, not_use_auto_track);
    ex.track('$MPHide', prop);
  } else if (ex.para.autoTrack && ex.para.autoTrack.appHide) {
    ex.autoTrackCustom.trackCustom('appHide', prop, '$MPHide');
  }
  //在关闭前告诉批量发送
  ex.sendStrategy.onAppHide();
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
  prop.$referrer = ex_referrer;
  prop.$url_path = router;
  ex.status.last_referrer = ex_referrer;
  prop.$url_query = this.sensors_mp_url_query ? this.sensors_mp_url_query : '';
  prop = extend(prop, getUtmFromPage());

  // para.onshow 此方方法在哪个版本上线，不做兼容
  // if (ex.para.onshow) {
  //   ex.para.onshow(ex, router, this);
  // } else
  if (immediate) {
    ex.track('$MPViewScreen', prop);
  } else if (ex.para.autoTrack && ex.para.autoTrack.pageShow) {
    ex.autoTrackCustom.trackCustom('pageShow', prop, '$MPViewScreen');
  }
  ex_referrer = router;
  ex.status.referrer = router;
}
export function pageShare(option) {
  var oldMesexge = option.onShareAppMesexge;

  option.onShareAppMesexge = function () {
    var oldValue = oldMesexge.apply(this, arguments);

    if (ex.para.autoTrack && ex.para.autoTrack.pageShare) {
      ex.autoTrackCustom.trackCustom(
        'pageShare',
        {
          $url_path: getCurrentPath(),
          $share_depth: ex.query_share_depth
        },
        '$MPShare'
      );
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
}
