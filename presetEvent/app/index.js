import { isObject, extend, isEmptyObject } from '../../utils/index';
import { getScene } from '../helper';
import { getPath, getCurrentPath } from '../path';
import { getShareInfo, setLatestShare } from '../share';
import { getUtm, setLatestChannel } from '../utm';
import { getQueryUrl } from '../query';
import ex from '../../core/instance';

export default function presetApp() {
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
    var utms = getUtm(option, obj);

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
