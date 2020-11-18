/**
 * author likang@sensorsdata.cn
 * App 代理模块
 */

import { mpProxy } from '../utils';
// import sdmp from 'sdmp';
import { appLaunch, appShow, appHide } from '../methods';

// var oldApp = App;
// export function App(option) {
//   mpProxy(option, 'onLaunch', appLaunch);
//   mpProxy(option, 'onShow', appShow);
//   mpProxy(option, 'onHide', appHide);
//   oldApp.apply(this, arguments);
// }

export default function AppTrack() {
  var option = wx.getLaunchOptionsSync() || {};
  appLaunch(option);

  wx.onAppShow(function (para) {
    appShow(para);
  });
  wx.onAppHide(function () {
    appHide();
  });
}
