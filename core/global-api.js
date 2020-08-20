/**
 * author likang@sensorsdata.cn
 * global methods
 */

import sa from './global';

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
