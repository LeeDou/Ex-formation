import ex from '../core/instance';
import { isFunction } from '../utils/index';

var subscribe = function (handle) {
  if (ex && ex.emitter) {
    ex.events.add(this);
    this._events = [];
    this.handle = handle;
    this.ready = false;
  } else {
    return false;
  }
};

subscribe.prototype = {
  on: function (event, data) {
    if (this.ready) {
      if (isFunction(this.handle)) {
        try {
          this.handle(event, data);
        } catch (error) {
          ex.log(error);
        }
      }
    } else {
      this._events.push({
        event,
        data
      });
    }
  },
  isReady: function () {
    var that = this;
    that.ready = true;
    that._events.forEach(function (item) {
      if (isFunction(that.handle)) {
        try {
          that.handle(item.event, item.data);
        } catch (error) {
          ex.log(error);
        }
      }
    });
  }
};

export default subscribe;
