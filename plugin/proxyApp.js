var oldApp = App;
App = function (option) {
  proxyClick(option, 'onLaunch', 'appLaunch');
  mp_proxy(option, 'onShow', 'appShow');
  mp_proxy(option, 'onHide', 'appHide');
  oldApp.apply(this, arguments);
};