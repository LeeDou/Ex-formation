export function wxrequest (option) {
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