import pf from 'platfrom';
import ex from '../core/instance';
export function getStorage(key, callback) {
  if (pf === 'weapp') {
    wx.getStorage({
      key,
      complete: callback
    });
  }
  if (pf === 'ali') {
    my.getStorage({
      key,
      complete: callback
    });
  }
}

export function getStorageSync(key) {
  var store = '';
  switch (pf) {
    case 'weapp':
      try {
        store = wx.getStorageSync(key);
      } catch (e) {
        try {
          store = wx.getStorageSync(key);
        } catch (e2) {
          ex.log('getStorage fail');
        }
      }
      break;
  }
  return store;
}

export function setStorageSync(key, value) {
  var fn = function () {
    switch (pf) {
      case 'weapp':
        wx.setStorageSync(key, value);
    }
  };
  try {
    fn();
  } catch (e) {
    ex.log('set Storage fail --', e);
    try {
      fn();
    } catch (e2) {
      ex.log('set Storage fail again --', e2);
    }
  }
}
