/**
 * author likang@sensorsdata.cn
 * miniProgram auto plugin
 * 依赖于小程序的原生对象
 */

import { proxyClick } from './utils';

var oldApp = App;
App = function (option) {
  proxyClick(option, 'onLaunch', 'appLaunch');
  mp_proxy(option, 'onShow', 'appShow');
  mp_proxy(option, 'onHide', 'appHide');
  oldApp.apply(this, arguments);
};

var oldPage = Page;
Page = function (option) {
  // 先判断 mpClick 是否配置自动采集，若配置为真则获取自定义方法并代理重写
  var methods =
    sa.para.autoTrack && sa.para.autoTrack.mpClick && _.getMethods(option);

  if (!!methods) {
    for (var i = 0, len = methods.length; i < len; i++) {
      click_proxy(option, methods[i]);
    }
  }

  mp_proxy(option, 'onLoad', 'pageLoad');
  mp_proxy(option, 'onShow', 'pageShow');
  if (typeof option.onShareAppMessage === 'function') {
    sa.autoTrackCustom.pageShare(option);
  }
  oldPage.apply(this, arguments);
};

var oldComponent = Component;
Component = function (option) {
  try {
    // 先判断 mpClick 是否配置自动采集，若配置为真则获取自定义方法并代理重写
    var methods =
      sa.para.autoTrack &&
      sa.para.autoTrack.mpClick &&
      _.getMethods(option.methods);

    if (!!methods) {
      for (var i = 0, len = methods.length; i < len; i++) {
        click_proxy(option.methods, methods[i]);
      }
    }

    mp_proxy(option.methods, 'onLoad', 'pageLoad');
    mp_proxy(option.methods, 'onShow', 'pageShow');
    if (typeof option.methods.onShareAppMessage === 'function') {
      sa.autoTrackCustom.pageShare(option.methods);
    }
    oldComponent.apply(this, arguments);
  } catch (e) {
    oldComponent.apply(this, arguments);
  }
};
