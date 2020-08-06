/**
 * author likang@sensorsdata.cn
 * 内部方法依赖小程序自身的对象，故需一个统一模块处理各自的对象，例如 wx 等
 */
import {} from '../utils';
import logger from 'logger';

export function setStorageSync(key, value) {
  var fn = function () {
    wx.setStorageSync(key, value);
  };
  try {
    fn();
  } catch (e) {
    logger.info('set Storage fail --', e);
    try {
      fn();
    } catch (e2) {
      logger.info('set Storage fail again --', e2);
    }
  }
}

_.getStorageSync = function (key) {
  var store = '';
  try {
    store = wx.getStorageSync(key);
  } catch (e) {
    try {
      store = wx.getStorageSync(key);
    } catch (e2) {
      logger.info('getStorage fail');
    }
  }
  return store;
};
