var emitter = function () {
  this.sub = [];
};
emitter.prototype = {
  add: function (item) {
    this.sub.push(item);
  },
  emit: function (event, data) {
    this.sub.forEach(function (temp) {
      temp.on(event, data);
    });
  },
};

export default emitter;
