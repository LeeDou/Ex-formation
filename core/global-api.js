/**
 * author likang@sensorsdata.cn
 * global methods
 */

import sa from './global';
import { extend, isObject, isEmptyObject, isDate, isArray } from '../utils';

sa.track = function (e, p, c) {
  this.prepareData(
    {
      type: 'track',
      event: e,
      properties: p,
    },
    c
  );
};

sa.quick = function () {
  // 方法名
  var arg0 = arguments[0];
  // 传入的参数
  var arg1 = arguments[1];
  // 需要自定义的属性
  var arg2 = arguments[2];

  var prop = _.isObject(arg2) ? arg2 : {};
  if (arg0 === 'getAnonymousID') {
    if (_.isEmptyObject(sa.store._state)) {
      logger.info('请先初始化SDK');
    } else {
      return (
        sa.store._state._first_id ||
        sa.store._state.first_id ||
        sa.store._state._distinct_id ||
        sa.store._state.distinct_id
      );
    }
  } else if (arg0 === 'appLaunch' || arg0 === 'appShow') {
    if (arg1) {
      sa.autoTrackCustom[arg0](arg1, prop);
    } else {
      logger.info(
        'App的launch和show，在sensors.quick第二个参数必须传入App的options参数'
      );
    }
  } else if (arg0 === 'appHide') {
    prop = _.isObject(arg1) ? arg1 : {};
    sa.autoTrackCustom[arg0](prop);
  }
};

sa.setOnceProfile = function (p, c) {
  sa.prepareData(
    {
      type: 'profile_set_once',
      properties: p,
    },
    c
  );
};

sa.prepareData = function (p, callback) {
  var data = {
    distinct_id: this.store.getDistinctId(),
    lib: {
      $lib: LIB_NAME,
      $lib_method: 'code',
      $lib_version: String(LIB_VERSION),
    },
    properties: {},
  };

  data = extend(data, this.store.getUnionId(), p);

  // 合并properties里的属性
  if (isObject(p.properties) && !isEmptyObject(p.properties)) {
    data.properties = extend(data.properties, p.properties);
  }

  // profile时不传公用属性
  if (!p.type || p.type.slice(0, 7) !== 'profile') {
    if (sa.para.batch_send) {
      data._track_id = Number(
        String(Math.random()).slice(2, 5) +
          String(Math.random()).slice(2, 4) +
          String(Date.now()).slice(-4)
      );
    }
    // 传入的属性 > 当前页面的属性 > session的属性 > cookie的属性 > 预定义属性
    data.properties = extend(
      {},
      _.info.properties,
      sa.store.getProps(),
      _.info.currentProps,
      data.properties
    );

    // 判断是否是首日访问，果子说要做
    if (
      typeof sa.store._state === 'object' &&
      typeof sa.store._state.first_visit_day_time === 'number' &&
      sa.store._state.first_visit_day_time > new Date().getTime()
    ) {
      data.properties.$is_first_day = true;
    } else {
      data.properties.$is_first_day = false;
    }
  }
  // 如果$time是传入的就用，否则使用服务端时间
  if (data.properties.$time && isDate(data.properties.$time)) {
    data.time = data.properties.$time * 1;
    delete data.properties.$time;
  } else {
    if (sa.para.use_client_time) {
      data.time = new Date() * 1;
    }
  }

  _.searchObjDate(data);
  _.searchObjString(data);

  logger.info(data);
  sa.events.emit('send', data);

  sa.sendStrategy.send(data);
};

sa.registerApp = function (obj) {
  if (isObject(obj) && !isEmptyObject(obj)) {
    _.info.currentProps = extend(_.info.currentProps, obj);
  }
};

sa.register = function (obj) {
  if (isObject(obj) && !isEmptyObject(obj)) {
    sa.store.setProps(obj);
  }
};

sa.clearAllRegister = function () {
  sa.store.setProps({}, true);
};

sa.clearAllProps = function (arr) {
  var obj = sa.store.getProps();
  var props = {};
  if (isArray(arr)) {
    _.each(obj, function (value, key) {
      if (!_.include(arr, key)) {
        props[key] = value;
      }
    });
    sa.store.setProps(props, true);
  }
};

sa.clearAppRegister = function (arr) {
  if (isArray(arr)) {
    _.each(_.info.currentProps, function (value, key) {
      if (_.include(arr, key)) {
        delete _.info.currentProps[key];
      }
    });
  }
};
