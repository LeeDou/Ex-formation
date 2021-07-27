import ex from '../core/instance';
import { isEmptyObject, isObject, extend, isDate, searchObjDate, searchObjString } from '../utils/index';

ex.track = function (e, p, c) {
  ex.prepareData(
    {
      type: 'track',
      event: e,
      properties: p
    },
    c
  );
};

ex.quick = function () {
  // 方法名
  var arg0 = arguments[0];
  // 传入的参数
  var arg1 = arguments[1];
  // 需要自定义的属性
  var arg2 = arguments[2];

  var prop = isObject(arg2) ? arg2 : {};
  if (arg0 === 'getAnonymousID') {
    if (isEmptyObject(ex.store._state)) {
      ex.log('请先初始化SDK');
    } else {
      return ex.store._state._first_id || ex.store._state.first_id || ex.store._state._distinct_id || ex.store._state.distinct_id;
    }
  } else if (arg0 === 'appLaunch' || arg0 === 'appShow') {
    if (arg1) {
      ex.autoTrackCustom[arg0](arg1, prop);
    } else {
      ex.log('App的launch和show，在sensors.quick第二个参数必须传入App的options参数');
    }
  } else if (arg0 === 'appHide') {
    prop = isObject(arg1) ? arg1 : {};
    ex.autoTrackCustom[arg0](prop);
  }
};

ex.setOnceProfile = function (p, c) {
  ex.prepareData(
    {
      type: 'profile_set_once',
      properties: p
    },
    c
  );
};

ex.prepareData = function (p, callback) {
  var data = {
    distinct_id: ex.store.getDistinctId(),
    lib: {
      $lib: ex.LIB_NAME,
      $lib_method: 'code',
      $lib_version: String(ex.LIB_VERSION)
    },
    properties: {}
  };

  data = extend(data, ex.store.getUnionId(), p);
  // 合并properties里的属性
  if (isObject(p.properties) && !isEmptyObject(p.properties)) {
    data.properties = extend(data.properties, p.properties);
  }

  // profile时不传公用属性
  if (!p.type || p.type.slice(0, 7) !== 'profile') {
    if (ex.para.batch_send) {
      data._track_id = Number(String(Math.random()).slice(2, 5) + String(Math.random()).slice(2, 4) + String(Date.now()).slice(-4));
    }
    // 传入的属性 > 当前页面的属性 > session的属性 > cookie的属性 > 预定义属性
    data.properties = extend({}, ex.properties, ex.store.getProps(), ex.currentProps, data.properties);

    // 判断是否是首日访问，果子说要做
    if (typeof ex.store._state === 'object' && typeof ex.store._state.first_visit_day_time === 'number' && ex.store._state.first_visit_day_time > new Date().getTime()) {
      data.properties.$is_first_day = true;
    } else {
      data.properties.$is_first_day = false;
    }
  }
  if (data.properties.$time && isDate(data.properties.$time)) {
    data.time = data.properties.$time * 1;
    delete data.properties.$time;
  } else {
    if (ex.para.use_client_time) {
      data.time = new Date() * 1;
    }
  }

  searchObjDate(data);
  searchObjString(data);

  ex.log(data);
  ex.emitter.emit('send', data);

  ex.sendStrategy.send(data);
};
