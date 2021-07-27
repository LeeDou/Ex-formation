import { getMethods, clickProxy } from '../helper';
import { isObject, extend } from '../../utils/index';
import { getQueryUrl } from '../query';
import { getCurrentPath, getCurrentUrl } from '../path';
import { getUtmFromPage } from '../utm';
import { getShareInfo } from '../share';
import ex from '../../core/instance';

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

export default Page;
