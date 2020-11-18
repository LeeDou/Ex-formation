/**
 * info module
 * author likang@sensorsdata.cn
 */

var info = {
  currentProps: {},
  properties: {
    $lib: LIB_NAME,
    $lib_version: String(LIB_VERSION),
  },
  getSystem: function () {
    var e = this.properties;

    function getNetwork() {
      wx.getNetworkType({
        success: function (t) {
          e.$network_type = t['networkType'];
        },
        complete: getSystemInfo,
      });
    }

    function getSystemInfo() {
      wx.getSystemInfo({
        success: function (t) {
          e.$manufacturer = t['brand'];
          e.$model = t['model'];
          e.$screen_width = Number(t['screenWidth']);
          e.$screen_height = Number(t['screenHeight']);
          e.$os = formatSystem(t['platform']);
          e.$os_version =
            t['system'].indexOf(' ') > -1
              ? t['system'].split(' ')[1]
              : t['system'];
        },
        complete: function () {
          var timeZoneOffset = new Date().getTimezoneOffset();
          var appId = _.getAppId();
          if (_.isNumber(timeZoneOffset)) {
            e.$timezone_offset = timeZoneOffset;
          }
          if (appId) {
            e.$app_id = appId;
          }
          sa.initialState.systemIsComplete = true;
          sa.initialState.checkIsComplete();
        },
      });
    }
    getNetwork();
  },
};

function formatSystem(system) {
  var _system = system.toLowerCase();
  if (_system === 'ios') {
    return 'iOS';
  } else if (_system === 'android') {
    return 'Android';
  } else {
    return system;
  }
}
