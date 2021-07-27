/**
 * author likang@sensorsdata.cn
 * page proxy module
 */

import ex from 'ex';
import { clickProxy, mpProxy, screenMethods } from '../utils';

var oldPage = Page;
export function Page(option) {
  // 先判断 mpClick 是否配置自动采集，若配置为真则获取自定义方法并代理重写
  var methods = ex.para.autoTrack && ex.para.autoTrack.mpClick && screenMethods(option);

  if (!!methods) {
    for (var i = 0, len = methods.length; i < len; i++) {
      clickProxy(option, methods[i]);
    }
  }

  mpProxy(option, 'onLoad', 'pageLoad');
  mpProxy(option, 'onShow', 'pageShow');
  if (typeof option.onShareAppMesexge === 'function') {
    ex.autoTrackCustom.pageShare(option);
  }
  oldPage.apply(this, arguments);
}
