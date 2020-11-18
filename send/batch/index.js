// 发送队列
_.autoExeQueue = function () {
  var queue = {
    // 简单队列
    items: [],
    enqueue: function (val) {
      this.items.push(val);
      this.start();
    },
    dequeue: function () {
      return this.items.shift();
    },
    getCurrentItem: function () {
      return this.items[0];
    },
    // 自动循环执行队列
    isRun: false,
    start: function () {
      if (this.items.length > 0 && !this.isRun) {
        this.isRun = true;
        this.getCurrentItem().start();
      }
    },
    close: function () {
      this.dequeue();
      this.isRun = false;
      this.start();
    },
  };
  return queue;
};

sa.requestQueue = function (para) {
  this.url = para.url;
};
sa.requestQueue.prototype.isEnd = function () {
  if (!this.received) {
    this.received = true;
    this.close();
  }
};
sa.requestQueue.prototype.start = function () {
  var me = this;
  setTimeout(function () {
    me.isEnd();
  }, sa.para.send_timeout);
  _.wxrequest({
    url: this.url,
    method: 'GET',
    complete: function () {
      me.isEnd();
    },
  });
};

sa.dataQueue = _.autoExeQueue();

sa.sendStrategy = {
  dataHasSend: true,
  dataHasChange: false,
  syncStorage: false,
  failTime: 0,
  onAppHide: function () {
    if (sa.para.batch_send) {
      this.batchSend();
    }
  },
  send: function (data) {
    if (!sa.para.server_url) {
      return false;
    }
    if (sa.para.batch_send) {
      this.dataHasChange = true;
      if (sa.store.mem.getLength() >= 300) {
        logger.info('数据量存储过大，有异常');
        return false;
      }
      sa.store.mem.add(data);
      if (sa.store.mem.getLength() >= sa.para.batch_send.max_length) {
        this.batchSend();
      }
    } else {
      this.queueSend(data);
    }
  },
  queueSend: function (url) {
    url = JSON.stringify(url);
    if (sa.para.server_url.indexOf('?') !== -1) {
      url =
        sa.para.server_url + '&data=' + encodeURIComponent(_.base64Encode(url));
    } else {
      url =
        sa.para.server_url + '?data=' + encodeURIComponent(_.base64Encode(url));
    }

    var instance = new sa.requestQueue({
      url: url,
    });
    instance.close = function () {
      sa.dataQueue.close();
    };
    sa.dataQueue.enqueue(instance);
  },
  wxrequest: function (option) {
    if (_.isArray(option.data) && option.data.length > 0) {
      var now = Date.now();
      option.data.forEach(function (v) {
        v._flush_time = now;
      });
      option.data = JSON.stringify(option.data);
      _.wxrequest({
        url: sa.para.server_url,
        method: 'POST',
        dataType: 'text',
        data: 'data_list=' + encodeURIComponent(_.base64Encode(option.data)),
        success: function () {
          option.success(option.len);
        },
        fail: function () {
          option.fail();
        },
      });
    } else {
      option.success(option.len);
    }
  },
  batchSend: function () {
    if (this.dataHasSend) {
      var data = sa.store.mem.mdata;
      var len = data.length;
      if (len > 0) {
        this.dataHasSend = false;
        this.wxrequest({
          data: data,
          len: len,
          success: this.batchRemove.bind(this),
          fail: this.sendFail.bind(this),
        });
      }
    }
  },
  sendFail: function () {
    this.dataHasSend = true;
    this.failTime++;
  },
  batchRemove: function (len) {
    sa.store.mem.clear(len);
    this.dataHasSend = true;
    this.dataHasChange = true;
    this.batchWrite();
    this.failTime = 0;
  },
  is_first_batch_write: true,
  batchWrite: function () {
    var me = this;
    if (this.dataHasChange) {
      // 如果是首次写入数据，等待1s后，优先发送，优化那些来了就跑的人
      if (this.is_first_batch_write) {
        this.is_first_batch_write = false;
        setTimeout(function () {
          me.batchSend();
        }, 1000);
      }

      this.dataHasChange = false;
      if (this.syncStorage) {
        sa._.setStorageSync('sensors_mp_prepare_data', sa.store.mem.mdata);
      }
    }
  },
  batchInterval: function () {
    var _this = this;
    // 每隔1秒，写入数据
    function loopWrite() {
      setTimeout(function () {
        _this.batchWrite();
        loopWrite();
      }, 500);
    }
    // 每隔6秒，发送数据
    function loopSend() {
      setTimeout(function () {
        _this.batchSend();
        loopSend();
      }, sa.para.batch_send.send_timeout * Math.pow(2, _this.failTime));
    }
    loopWrite();
    loopSend();
  },
};
