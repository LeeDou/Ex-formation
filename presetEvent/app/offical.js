import { pf } from 'platfrom';

export default function officalInit(ex) {
  var oldApp = App;
  App = function (option) {
    option[ex.para.name] = ex;
    oldApp.apply(this, arguments);
  };

  if (pf === 'wxapp') {
    wx.onAppShow(function (para) {
      if (!ex.para.launched) {
        var option = wx.getLaunchOptionsSync() || {};
        ex.appLaunch(option);
        ex.para.launched = true;
      }
      ex.appShow(para);
    });

    wx.onAppHide(function () {
      ex.appHide();
    });
  }
}
