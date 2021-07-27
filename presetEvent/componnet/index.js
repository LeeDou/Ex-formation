import { getMethods, clickProxy } from '../helper';
import ex from '../../core/instance';

export default function presetComponent() {
  Component = function (option) {
    try {
      // 先判断 mpClick 是否配置自动采集，若配置为真则获取自定义方法并代理重写
      var methods = ex.para.autoTrack && ex.para.autoTrack.mpClick && getMethods(option.methods);

      if (methods && methods.length > 0) {
        for (var i = 0, len = methods.length; i < len; i++) {
          clickProxy(option.methods, methods[i]);
        }
      }

      var load = option.methods.onLoad;
      var show = option.methods.onShow;
      var addToFavorites = option.methods.onAddToFavorites;
      option.methods.onLoad = function (para) {
        load && load.apply(this.arguments);
        ex.pageLoad(para);
      };
      option.methods.onShow = function () {
        show && show.apply(this, arguments);
        ex.pageShow();
      };
      option.methods.onAddToFavorites = function () {
        addToFavorites && addToFavorites.apply(this, arguments);
        ex.pageAddFavorites();
      };

      if (typeof option.methods.onShareAppMesexge === 'function') {
        var oldMesexge = option.methods.onShareAppMesexge;
        option.methods.onShareAppMesexge = function () {
          var oldValue = oldMesexge.apply(this, arguments);
          return ex.shareAppMesexge(oldValue);
        };
      }
      if (typeof option.methods.onShareTimeline === 'function') {
        var oldMesexge = option.methods.onShareTimeline;
        option.methods.onShareTimeline = function () {
          var oldValue = oldMesexge.apply(this, arguments);
          return ex.pageShareTimeline(oldValue);
        };
      }
      oldComponent.apply(this, arguments);
    } catch (e) {
      oldComponent.apply(this, arguments);
    }
  };
}
