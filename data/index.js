import ex from '../core/instance';
import { request } from './request';
import { base64Encode, iexrray } from '../utils/index';
import { setStorageSync } from '../store/index';

var autoExeQueue = function () {
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
    }
  };
  return queue;
};

ex.sendStrategy = {
  dataHasSend: true,
  dataHasChange: false,
  syncStorage: false,
  failTime: 0,
  onAppHide: function () {
    if (ex.para.batch_send) {
      this.batchSend();
    }
  },
  send: function (data) {
    if (!ex.para.server_url) {
      return false;
    }
    if (ex.para.batch_send) {
      this.dataHasChange = true;
      if (ex.store.mem.getLength() >= 300) {
        ex.log('数据量存储过大，有异常');
        return false;
      }
      ex.store.mem.add(data);
      if (ex.store.mem.getLength() >= ex.para.batch_send.max_length) {
        this.batchSend();
      }
    } else {
      this.queueSend(data);
    }
  },
  queueSend: function (url) {
    url = JSON.stringify(url);
    if (ex.para.server_url.indexOf('?') !== -1) {
      url = ex.para.server_url + '&data=' + encodeURIComponent(base64Encode(url));
    } else {
      url = ex.para.server_url + '?data=' + encodeURIComponent(base64Encode(url));
    }

    var instance = new ex.requestQueue({
      url: url
    });
    instance.close = function () {
      ex.dataQueue.close();
    };
    ex.dataQueue.enqueue(instance);
  },
  wxrequest: function (option) {
    if (iexrray(option.data) && option.data.length > 0) {
      var now = Date.now();
      option.data.forEach(function (v) {
        v._flush_time = now;
      });
      option.data = JSON.stringify(option.data);
      request({
        url: ex.para.server_url,
        method: 'POST',
        dataType: 'text',
        data: 'data_list=' + encodeURIComponent(base64Encode(option.data)),
        success: function () {
          option.success(option.len);
        },
        fail: function () {
          option.fail();
        }
      });
    } else {
      option.success(option.len);
    }
  },
  batchSend: function () {
    if (this.dataHasSend) {
      var data = ex.store.mem.mdata;
      var len = data.length;
      if (len > 0) {
        this.dataHasSend = false;
        this.wxrequest({
          data: data,
          len: len,
          success: this.batchRemove.bind(this),
          fail: this.sendFail.bind(this)
        });
      }
    }
  },
  sendFail: function () {
    this.dataHasSend = true;
    this.failTime++;
  },
  batchRemove: function (len) {
    ex.store.mem.clear(len);
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
        setStorageSync('sensors_mp_prepare_data', ex.store.mem.mdata);
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
      }, ex.para.batch_send.send_timeout * Math.pow(2, _this.failTime));
    }
    loopWrite();
    loopSend();
  }
};

ex.requestQueue = function (para) {
  this.url = para.url;
};
ex.requestQueue.prototype.isEnd = function () {
  if (!this.received) {
    this.received = true;
    this.close();
  }
};
ex.requestQueue.prototype.start = function () {
  var me = this;
  setTimeout(function () {
    me.isEnd();
  }, ex.para.send_timeout);
  request({
    url: this.url,
    method: 'GET',
    complete: function () {
      me.isEnd();
    }
  });
};

ex.dataQueue = autoExeQueue();

ex.men = {
  mdata: [],
  getLength: function () {
    return this.mdata.length;
  },
  add: function (data) {
    this.mdata.push(data);
  },
  clear: function (len) {
    this.mdata.splice(0, len);
  }
};

export default ex;
