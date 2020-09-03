/**
 * author likang@sensorsdata.cn
 * App 代理模块
 */

import { mpProxy } from '../utils';
import { appLaunch, appShow, appHide } from '../methods';

var oldApp = App;
export function App(option) {
  mpProxy(option, 'onLaunch', appLaunch);
  mpProxy(option, 'onShow', appShow);
  mpProxy(option, 'onHide', appHide);
  oldApp.apply(this, arguments);
}
