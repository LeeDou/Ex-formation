/**
 * author likang@sensorsdata.cn
 * autotrack module
 */

import sa from 'sa';

/**
 * autoTrackCustom 方法需要重写，能实现绑定自定义的方法处理自定属性，传入自定义属性
 * 其中页面的代理可以实现不同页面的可配置
 * quick 方法，默认跳过所有的控制检查，直接完成数据的发送，与自定义埋点区分开
 */

export function autoTrackCustom(api, prop, event) {
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
}
