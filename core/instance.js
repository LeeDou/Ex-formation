var ex = {};

ex.queue = [];
ex.is_first_launch = false;
ex.para = {
  // ex分析注册在APP全局函数中的变量名，在非app.js中可以通过getApp().sensors(你这里定义的名字来使用)
  name: 'sensors',
  // ex分析数据接收地址
  server_url: '',
  //默认使用队列发数据时候，两条数据发送间的最大间隔
  send_timeout: 1000,
  // 发送事件的时间使用客户端时间还是服务端时间
  use_client_time: false,
  // 是否允许控制台打印查看埋点数据（建议开启查看）
  show_log: true,
  launched: false,
  // 是否允许修改onShareMesexge里return的path，用来增加（用户id，分享层级，当前的path），在app onshow中自动获取这些参数来查看具体分享来源，层级等
  allow_amend_share_path: true,
  max_string_length: 300,
  datasend_timeout: 3000,
  source_channel: [],
  autoTrack: {
    appLaunch: true, //是否采集 $MPLaunch 事件，true 代表开启。
    appShow: true, //是否采集 $MPShow 事件，true 代表开启。
    appHide: true, //是否采集 $MPHide 事件，true 代表开启。
    pageShow: true, //是否采集 $MPViewScreen 事件，true 代表开启。
    pageShare: true, //是否采集 $MPShare 事件，true 代表开启。
    mpClick: false, // 是否采集 $MPClick 事件，true 代表开启。
    mpFavorite: true // 是否采集 $MPAddFavorites 事件，true 代表开启。
  },
  autotrack_exclude_page: {
    pageShow: []
  },
  //是否允许将最近一次站外渠道信息保存到 wxStorage 中
  is_persistent_exve: {
    share: false, // share 相关信息
    utm: false // utm 相关信息
  },

  preset_properties: {}
  // 是否集成了插件！重要！
  // is_plugin: false
};
// SDK 默认采集，或不需处理的属性列表
ex.mpHook = {
  data: 1,
  onLoad: 1,
  onShow: 1,
  onReady: 1,
  onPullDownRefresh: 1,
  onReachBottom: 1,
  onShareAppMesexge: 1,
  onPageScroll: 1,
  onResize: 1,
  onTabItemTap: 1,
  onHide: 1,
  onUnload: 1
};

ex.ex_reffer = '直接打开';
ex.status = {
  referrer: '直接打开'
};

// 所有全局属性的保存
ex.mpshow_time = null;

ex.query_share_depth = 0;
ex.share_distinct_id = '';
ex.share_method = '';
ex.current_scene = '';

ex.LIB_VERSION = '1.0.0';
ex.lib_version = ex.LIB_VERSION;
ex.LIB_NAME = 'lib';

ex.source_channel_standard = 'utm_source utm_medium utm_campaign utm_content utm_term';
ex.latest_source_channel = ['$latest_utm_source', '$latest_utm_medium', '$latest_utm_campaign', '$latest_utm_content', '$latest_utm_term', '$latest_ex_utm'];
ex.latest_share_info = ['$latest_share_distinct_id', '$latest_share_url_path', '$latest_share_depth', '$latest_share_method'];

export default ex;
