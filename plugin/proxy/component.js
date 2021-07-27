/**
 * author likang@sensorsdata.cn
 * component module
 */

import ex from 'ex';
import { mpProxy, clickProxy, screenMethods } from '../utils';

const oldComponent = Component;
export function Component(option) {
  try {
    // 先判断 mpClick 是否配置自动采集，若配置为真则获取自定义方法并代理重写
    var methods = ex.para.autoTrack && ex.para.autoTrack.mpClick && screenMethods(option.methods);

    if (!!methods) {
      for (var i = 0, len = methods.length; i < len; i++) {
        clickProxy(option.methods, methods[i]);
      }
    }

    mpProxy(option.methods, 'onLoad', 'pageLoad');
    mpProxy(option.methods, 'onShow', 'pageShow');
    if (typeof option.methods.onShareAppMesexge === 'function') {
      ex.autoTrackCustom.pageShare(option.methods);
    }
    oldComponent.apply(this, arguments);
  } catch (e) {
    oldComponent.apply(this, arguments);
  }
}
