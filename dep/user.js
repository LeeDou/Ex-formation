/**
 * author likang@sensors.cn
 */

export function getUUID() {
  return (
    '' +
    Date.now() +
    '-' +
    Math.floor(1e7 * Math.random()) +
    '-' +
    Math.random().toString(16).replace('.', '') +
    '-' +
    String(Math.random() * 31242)
      .replace('.', '')
      .slice(0, 8)
  );
}

export function verifyDistinctId(id) {
  if (typeof id === 'number') {
    id = String(id);
    if (!/^\d+$/.test(id)) {
      id = 'unexpected_id';
    }
  }
  if (typeof id !== 'string' || id === '') {
    id = 'unexpected_id';
  }
  return id;
}

export function getFirstId() {
  return this._state._first_id || this._state.first_id;
}
export function getDistinctId() {
  return this._state._distinct_id || this._state.distinct_id;
}

export function getUnionId() {
  var obj = {};
  var first_id = this._state._first_id || this._state.first_id;
  var distinct_id = this._state._distinct_id || this._state.distinct_id;
  if (first_id && distinct_id) {
    obj['login_id'] = distinct_id;
    obj['anonymous_id'] = first_id;
  } else {
    obj['anonymous_id'] = distinct_id;
  }
  return obj;
}

export function login(id) {
  if (typeof id !== 'string' && typeof id !== 'number') {
    return false;
  }
  id = sa.store.verifyDistinctId(id);
  var firstId = sa.store.getFirstId();
  var distinctId = sa.store.getDistinctId();
  if (id !== distinctId) {
    if (firstId) {
      sa.trackSignup(id, '$SignUp');
    } else {
      sa.store.set('first_id', distinctId);
      sa.trackSignup(id, '$SignUp');
    }
  }
}

export function logout(isChangeId) {
  var firstId = sa.store.getFirstId();
  if (firstId) {
    sa.store.set('first_id', '');
    if (isChangeId === true) {
      sa.store.set('distinct_id', sa.store.getUUID());
    } else {
      sa.store.set('distinct_id', firstId);
    }
  } else {
    logger.info('没有first_id，logout失败');
  }
}

// 获取openid，先从storage里获取，
sa.openid = {
  getRequest: function (callback) {
    wx.login({
      success: function (res) {
        if (res.code && sa.para.appid && sa.para.openid_url) {
          _.wxrequest({
            url:
              sa.para.openid_url +
              '&code=' +
              res.code +
              '&appid=' +
              sa.para.appid,
            method: 'GET',
            complete: function (res2) {
              if (
                _.isObject(res2) &&
                _.isObject(res2.data) &&
                res2.data.openid
              ) {
                callback(res2.data.openid);
              } else {
                callback();
              }
            },
          });
        } else {
          callback();
        }
      },
    });
  },
  getWXStorage: function () {
    var storageInfo = sa.store.getStorage();
    if (storageInfo && _.isObject(storageInfo)) {
      return storageInfo.openid;
    }
  },
  getOpenid: function (callback) {
    if (!sa.para.appid) {
      callback();
      return false;
    }
    var storageId = this.getWXStorage();
    if (storageId) {
      callback(storageId);
    } else {
      this.getRequest(callback);
    }
  },
};

export function setOpenid(openid, isCover) {
  sa.store.set('openid', openid);
  if (isCover) {
    sa.store.set('distinct_id', openid);
  } else {
    sa.identify(openid, true);
  }
}

sa.initWithOpenid = function (options, callback) {
  options = options || {};
  if (options.appid) {
    sa.para.appid = options.appid;
  }
  sa.openid.getOpenid(function (openid) {
    if (openid) {
      sa.setOpenid(openid, options.isCoverLogin);
    }
    if (callback && _.isFunction(callback)) {
      callback(openid);
    }
    sa.init(options);
  });
};
