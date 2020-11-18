/**
 * author likang@senssorsdata.cn
 */

import sa from 'sa';
// 发送队列
var autoExeQueue = {
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

function requestQueue(para) {
  this.url = para.url;
}
requestQueue.prototype.isEnd = function () {
  if (!this.received) {
    this.received = true;
    this.close();
  }
};
requestQueue.prototype.start = function () {
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

export function queueSend(url) {
  url = JSON.stringify(url);
  if (sa.para.server_url.indexOf('?') !== -1) {
    url =
      sa.para.server_url + '&data=' + encodeURIComponent(_.base64Encode(url));
  } else {
    url =
      sa.para.server_url + '?data=' + encodeURIComponent(_.base64Encode(url));
  }

  var instance = new requestQueue({
    url: url,
  });
  instance.close = function () {
    autoExeQueue.close();
  };
  autoExeQueue.enqueue(instance);
}
