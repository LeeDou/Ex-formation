import { isObject, isNumber, formatSystem } from '../utils/index';
import ex from './instance';
import pf from 'platfrom';

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
    getNetwork(e);
  }
};

function checkSystemState() {
  if (ex.systemState.getNetWork && ex.systemState.getSystem) {
    ex.systemState.inited = true;
    ex.checkInit();
  }
}

function getNetwork() {
  if (pf === 'weapp') {
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
  if (pf === 'weapp') {
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
  if (pf === 'weapp') {
    if (wx.getAccountInfoSync) {
      info = wx.getAccountInfoSync();
    }
    if (isObject(info) && isObject(info.miniProgram)) {
      return info.miniProgram.appId;
    }
  }
}

export default ex;
