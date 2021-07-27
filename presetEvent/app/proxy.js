export default function proxyInit(ex) {
  var oldApp = App;
  App = function (option) {
    var show = option.onShow,
      launch = option.onLaunch,
      hide = option.onHide;
    option.onLaunch = function () {
      this[ex.para.name] = ex;
      launch && launch.apply(this, arguments);
      ex.appLaunch(arguments[0]);
    };
    option.onShow = function () {
      show && show.apply(this, arguments);
      ex.appShow(arguments[0]);
    };
    option.onHide = function () {
      hide && hide.apply(this, arguments);
      ex.appHide(arguments[0]);
    };
    oldApp.apply(this, arguments);
  };
}
