/**
 * send data mopdule
 */

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

    var instance = new requestQueue({
      url: url,
    });
    instance.close = function () {
      autoExeQueue.close();
    };
    autoExeQueue.enqueue(instance);
  },
};
